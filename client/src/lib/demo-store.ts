import fixture from "@/data/sample.json";
import type { Me, Opp, Org } from "./app";
type User = Omit<Me, "editorOrgIds" | "memberOrgIds" | "follows" | "email"> & {
  blurb: string;
};
type Correction = {
  id: number;
  orgId: number;
  oppId?: number;
  note: string;
  status: string;
  at: string;
};
type Audit = {
  id: number;
  orgId: number;
  at: string;
  summary: string;
};
let viewerId: number | null = null;
let orgs: Org[] = [];
let listings: Opp[] = [];
let users = structuredClone(fixture.users) as User[];
let corrections: Correction[] = [];
let audit: Audit[] = [];
function campusDate(value = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(value);
}
function campusTimestamp(day: number, hour: number, minute: number) {
  const [year, month, date] = campusDate().split("-").map(Number);
  const target = Date.UTC(year, month - 1, date + day, hour, minute);
  let result = target;
  for (let step = 0; step < 2; step++) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    }).formatToParts(new Date(result));
    const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
    const observed = Date.UTC(
      value("year"),
      value("month") - 1,
      value("day"),
      value("hour"),
      value("minute"),
    );
    result += target - observed;
  }
  return new Date(result).toISOString();
}
function reset() {
  orgs = structuredClone(fixture.organizations) as unknown as Org[];
  users = structuredClone(fixture.users) as User[];
  listings = fixture.opportunities.map(({ day, hour, minute, duration, ...item }) => {
    const startsAt = campusTimestamp(day, hour, minute);
    return {
      ...item,
      startsAt,
      endsAt: new Date(Date.parse(startsAt) + duration * 60000).toISOString(),
    } as Opp;
  });
  corrections = [];
  audit = [];
}
reset();
export function setPreviewUser(id: number | null) {
  viewerId = id;
}
function currentUser(): Me | null {
  const user = users.find((item) => item.id === viewerId);
  return user
    ? {
        ...user,
        email: "",
        editorOrgIds: user.memberships.map((membership) => membership.orgId),
        memberOrgIds: [],
        follows: [],
      }
    : null;
}
function canEdit(orgId: number) {
  const user = currentUser();
  return !!user && (user.role === "admin" || user.editorOrgIds.includes(orgId));
}
function requireEditor(orgId: number) {
  if (!canEdit(orgId)) throw new Error("Select an editor for this organization.");
}
function log(orgId: number, summary: string) {
  audit.unshift({ id: Date.now(), orgId, at: new Date().toISOString(), summary });
}
function publicListing(item: Opp): Opp {
  const org = orgs.find((organization) => organization.id === item.orgId)!;
  const base = {
    ...item,
    org: {
      id: org.id,
      name: org.name,
      short: org.short,
      slug: org.slug,
      accent: org.accent,
      type: org.type,
    },
    canEdit: canEdit(org.id),
  };
  if (base.visibility === "public" || canEdit(org.id)) return { ...base, restricted: false };
  return {
    ...base,
    title: "Members-only activity",
    kind: "event",
    restricted: true,
    category: "Members only",
    summary:
      "This organization also holds private activities. Contact the club through its own channels for details.",
    gain: "Details are shared by the organization directly.",
    nextStep: "Contact the organization.",
    startsAt: null,
    endsAt: null,
    location: null,
    interests: [],
    departments: [],
    years: [],
    food: "unknown",
    openToNonmembers: "no",
    joinProcess: null,
    status: "scheduled",
    changeNote: null,
    externalUrl: null,
    externalLabel: null,
    connectStatus: "hidden",
    roomStatus: "hidden",
    teaser: null,
    updatedAt: "",
    source: "Organization",
    saved: false,
  };
}
function visibleListings(items = listings) {
  const seen = new Set<number>();
  return items
    .map(publicListing)
    .filter((item) => {
      if (!item.restricted) return true;
      if (seen.has(item.orgId)) return false;
      seen.add(item.orgId);
      return true;
    })
    .sort((a, b) => (a.startsAt ?? "9999").localeCompare(b.startsAt ?? "9999"));
}
function profile(org: Org) {
  return {
    ...org,
    canEdit: canEdit(org.id),
    isMember: false,
    opportunities: visibleListings(listings.filter((item) => item.orgId === org.id)),
    editors: canEdit(org.id)
      ? users.flatMap((user) =>
          user.memberships
            .filter((membership) => membership.orgId === org.id)
            .map((membership) => ({ name: user.name, role: membership.role, userId: user.id })),
        )
      : [],
    history: canEdit(org.id) ? audit.filter((item) => item.orgId === org.id) : [],
    corrections: canEdit(org.id) ? corrections.filter((item) => item.orgId === org.id) : [],
  };
}
function packet(item: Opp) {
  requireEditor(item.orgId);
  return {
    notice:
      "Demonstration only. This prepares text but does not submit to Connect, request approval or reserve a room.",
    fields: [
      ["Organization", item.org.name],
      ["Event name", item.title],
      ["Description", item.summary],
      ["Start", new Date(item.startsAt!).toLocaleString("en-US", { timeZone: "America/Chicago" })],
      ["End", new Date(item.endsAt!).toLocaleString("en-US", { timeZone: "America/Chicago" })],
      ["Location requested", item.location ?? "Not specified"],
      ["Open to", item.openToNonmembers === "yes" ? "All students" : "Members"],
    ],
    checks: [
      {
        label: "Confirm current requirements before submission",
        ok: null,
        note: "Use Baylor's official event approval and room reservation guidance.",
      },
    ],
    reported: { connectStatus: item.connectStatus, roomStatus: item.roomStatus },
    sources: [{ label: "Baylor Connect", url: "https://baylor.campuslabs.com/engage/" }],
  };
}
export async function requestPreview(
  method: string,
  url: string,
  payload?: unknown,
): Promise<unknown> {
  const path = url.split("?")[0].split("/").filter(Boolean).slice(1);
  const body = (payload ?? {}) as Record<string, any>;
  const id = Number(path[1]);
  if (path[0] === "users") return users;
  if (path[0] === "me") {
    if (path[1] === "busy") return [];
    if (path[1] === "preferences") return null;
    return currentUser();
  }
  if (path[0] === "today") {
    return listings
      .filter(
        (item) =>
          item.visibility === "public" &&
          item.kind === "event" &&
          campusDate(new Date(item.startsAt!)) === campusDate(),
      )
      .map((item) => ({ ...item, restricted: false }));
  }
  if (path[0] === "orgs") {
    if (path.length === 1)
      return orgs.map((org) => ({
        ...org,
        upcomingCount: listings.filter(
          (item) =>
            item.orgId === org.id &&
            item.status !== "canceled" &&
            item.endsAt! >= new Date().toISOString(),
        ).length,
      }));
    const org = orgs.find((item) => item.slug === path[1] || item.id === id);
    if (!org) throw new Error("Organization not found.");
    if (method === "GET") return profile(org);
    requireEditor(org.id);
    if (path[2] === "handover") {
      org.primaryEditorId = body.primaryEditorId;
      org.backupEditorId = body.backupEditorId;
      for (const user of users) {
        user.memberships = user.memberships.filter((membership) => membership.orgId !== org.id);
        if (user.id === org.primaryEditorId || user.id === org.backupEditorId)
          user.memberships.push({
            orgId: org.id,
            role: user.id === org.primaryEditorId ? "primary_editor" : "editor",
          });
      }
    } else if (path[2] !== "review") {
      const allowed = [
        "tagline",
        "mission",
        "culture",
        "joinDetails",
        "joinProcess",
        "recruitingWindow",
        "meetingRhythm",
        "contactEmail",
        "benefits",
        "links",
      ];
      for (const key of allowed) if (key in body) Object.assign(org, { [key]: body[key] });
    }
    org.lastReviewed = campusDate();
    log(org.id, "Profile updated in this session.");
    return profile(org);
  }
  if (path[0] === "opportunities") {
    if (path.length === 1 && method === "GET") return visibleListings();
    if (path.length === 1 && method === "POST") {
      requireEditor(Number(body.orgId));
      if (
        !body.title?.trim() ||
        !body.summary?.trim() ||
        Date.parse(body.endsAt) < Date.parse(body.startsAt)
      )
        throw new Error("Add a title, description and valid event times.");
      const org = orgs.find((item) => item.id === Number(body.orgId))!;
      const item = {
        ...(body as Partial<Opp>),
        id: Math.max(0, ...listings.map((item) => item.id)) + 1,
        org,
        source: "Session example",
        isSample: 1,
        updatedAt: new Date().toISOString(),
        restricted: false,
      } as Opp;
      listings.push(item);
      log(org.id, `Created ${item.title}.`);
      return item;
    }
    const item = listings.find((listing) => listing.id === id);
    if (!item) throw new Error("Listing not found.");
    if (path[2] === "packet") return packet(item);
    if (method === "GET") return publicListing(item);
    requireEditor(item.orgId);
    if (method === "DELETE") {
      listings = listings.filter((listing) => listing.id !== id);
      log(item.orgId, `Deleted ${item.title}.`);
      return { ok: true };
    }
    if (path[2] === "duplicate") {
      const copy = structuredClone(item);
      copy.id = Math.max(...listings.map((listing) => listing.id)) + 1;
      copy.title += " (copy)";
      copy.startsAt = new Date(Date.parse(item.startsAt!) + 604800000).toISOString();
      copy.endsAt = new Date(Date.parse(item.endsAt!) + 604800000).toISOString();
      copy.status = "scheduled";
      copy.changeNote = null;
      copy.connectStatus = "not_started";
      copy.roomStatus = item.roomStatus === "not_needed" ? "not_needed" : "to_request";
      listings.push(copy);
      log(item.orgId, `Duplicated ${item.title}.`);
      return copy;
    }
    const { id: ignoredId, orgId: ignoredOrg, org: ignoredProfile, ...changes } = body;
    Object.assign(item, changes, { updatedAt: new Date().toISOString(), isSample: 1 });
    log(item.orgId, `Updated ${item.title}.`);
    return item;
  }
  if (path[0] === "corrections") {
    if (path[2] === "resolve") {
      const correction = corrections.find((item) => item.id === id);
      if (!correction) throw new Error("Correction not found.");
      requireEditor(correction.orgId);
      correction.status = "resolved";
      return correction;
    }
    if (!body.note || body.note.trim().length < 5)
      throw new Error("Please add a little more detail.");
    const correction = {
      ...body,
      id: Date.now(),
      status: "open",
      at: new Date().toISOString(),
    } as Correction;
    corrections.push(correction);
    return correction;
  }
  if (path[0] === "admin") {
    if (currentUser()?.role !== "admin")
      throw new Error("Select the council administrator preview.");
    if (path[1] === "reset") {
      reset();
      return { ok: true };
    }
    return {
      orgs: orgs.map((org) => ({
        ...org,
        primaryEditor: users.find((user) => user.id === org.primaryEditorId)?.name ?? null,
        backupEditor: users.find((user) => user.id === org.backupEditorId)?.name ?? null,
        upcoming: listings.filter(
          (item) =>
            item.orgId === org.id &&
            item.endsAt! >= new Date().toISOString() &&
            item.status !== "canceled",
        ).length,
      })),
      totals: {
        orgs: orgs.length,
        upcoming: listings.filter(
          (item) => item.endsAt! >= new Date().toISOString() && item.status !== "canceled",
        ).length,
        changed: listings.filter((item) => item.status === "changed").length,
        canceled: listings.filter((item) => item.status === "canceled").length,
      },
      corrections: corrections.map((item) => ({
        ...item,
        orgName: orgs.find((org) => org.id === item.orgId)?.name,
      })),
      audit: audit.map((item) => ({
        ...item,
        orgName: orgs.find((org) => org.id === item.orgId)?.name,
      })),
    };
  }
  throw new Error("This action is not available in the standalone preview.");
}
