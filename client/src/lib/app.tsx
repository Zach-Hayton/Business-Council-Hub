import type { ClubDetail } from "@shared/clubs";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiRequest, queryClient, setDemoUser } from "./queryClient";
export type Tri = "yes" | "no" | "unknown";
export interface Benefit {
  label: string;
  horizon: string;
}
export interface OrgLink {
  label: string;
  url: string;
  kind: string;
}
export interface Org extends Omit<ClubDetail, "name" | "short"> {
  id: number;
  slug: string;
  name: string;
  short: string;
  type: string;
  tagline: string;
  mission: string;
  culture: string;
  departments: string[];
  interests: string[];
  benefits: Benefit[];
  joinProcess: string;
  joinDetails: string;
  recruitingWindow: string | null;
  openToAllMajors: Tri;
  meetingRhythm: string | null;
  contactEmail: string | null;
  links: OrgLink[];
  accent: string;
  lastReviewed: string;
  primaryEditorId: number | null;
  backupEditorId: number | null;
  inFeedback: number;
  upcomingCount?: number;
}
export interface Opp {
  id: number;
  orgId: number;
  kind: "event" | "recruitment";
  title: string;
  summary: string;
  gain: string;
  nextStep: string;
  category: string;
  interests: string[];
  departments: string[];
  startsAt: string | null;
  endsAt: string | null;
  location: string | null;
  visibility: "public" | "teaser" | "private";
  teaser: string | null;
  years: string[];
  openToNonmembers: Tri;
  food: Tri;
  joinProcess: string | null;
  status: "scheduled" | "changed" | "canceled";
  changeNote: string | null;
  externalUrl: string | null;
  externalLabel: string | null;
  connectStatus: string;
  roomStatus: string;
  source: string;
  isSample: number;
  updatedAt: string;
  restricted: boolean;
  approx?: string;
  saved?: boolean;
  canEdit?: boolean;
  org: {
    id: number;
    slug: string;
    name: string;
    short: string;
    accent: string;
    type: string;
  };
}
export interface Me {
  id: number;
  name: string;
  email: string;
  role: "student" | "officer" | "admin";
  classYear: string | null;
  major: string | null;
  blurb: string | null;
  memberships: {
    orgId: number;
    role: string;
  }[];
  editorOrgIds: number[];
  memberOrgIds: number[];
  follows: number[];
}
export interface Prefs {
  interests: string[];
  goals: string[];
  wantsFood: number | boolean;
  founder: number | boolean;
  reminders: string;
}
export interface Busy {
  id: number;
  day: number;
  start: string;
  end: string;
  label: string | null;
}
export interface Preset {
  q?: string;
  interests?: string[];
  food?: boolean;
  open?: boolean;
  kind?: "all" | "event" | "recruitment";
  years?: string;
  when?: string;
  noInterview?: boolean;
}
interface Ctx {
  userId: number | null;
  setUserId: (id: number | null) => void;
  dark: boolean;
  setDark: (d: boolean) => void;
  preset: Preset | null;
  setPreset: (p: Preset | null) => void;
}
const AppCtx = createContext<Ctx>({
  userId: null,
  setUserId: () => {},
  dark: false,
  setDark: () => {},
  preset: null,
  setPreset: () => {},
});
export function AppProvider({ children }: { children: ReactNode }) {
  const [userId, setUid] = useState<number | null>(null);
  const [preset, setPreset] = useState<Preset | null>(null);
  const [dark, setDark] = useState(
    () =>
      typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  const setUserId = (id: number | null) => {
    setDemoUser(id);
    setUid(id);
    queryClient.invalidateQueries();
  };
  return (
    <AppCtx.Provider value={{ userId, setUserId, dark, setDark, preset, setPreset }}>
      {children}
    </AppCtx.Provider>
  );
}
export const useApp = () => useContext(AppCtx);
export function useMe() {
  const { userId } = useApp();
  return useQuery<Me | null>({
    queryKey: ["/api/me", userId ?? "anon"],
    queryFn: async () => {
      const r = await apiRequest("GET", "/api/me");
      return r.json();
    },
  });
}
export const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
export const fmtRange = (a: string, b: string) => `${fmtTime(a)} – ${fmtTime(b)}`;
export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export function relDay(iso: string) {
  const d = new Date(iso);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - t.getTime()) / 86400000,
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff > 1 && diff < 7) return d.toLocaleDateString("en-US", { weekday: "long" });
  return fmtDay(iso);
}
export function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}
export function freshness(lastReviewed: string) {
  const days = Math.floor((Date.now() - new Date(lastReviewed + "T12:00:00").getTime()) / 86400000);
  if (days <= 45)
    return {
      days,
      level: "fresh" as const,
      label: days <= 1 ? "Reviewed today" : `Reviewed ${days} days ago`,
    };
  if (days <= 120) return { days, level: "aging" as const, label: `Reviewed ${days} days ago` };
  return { days, level: "stale" as const, label: `Not reviewed in ${days} days` };
}
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export type Fit =
  | {
      state: "unchecked";
    }
  | {
      state: "clear";
    }
  | {
      state: "conflict";
      block: Busy;
    };
export function scheduleFit(o: Opp, busy: Busy[] | undefined): Fit {
  if (!busy || busy.length === 0 || !o.startsAt || !o.endsAt || o.kind === "recruitment")
    return { state: "unchecked" };
  const s = new Date(o.startsAt),
    e = new Date(o.endsAt);
  const day = s.getDay();
  const sm = s.getHours() * 60 + s.getMinutes();
  const em = sm + Math.round((e.getTime() - s.getTime()) / 60000);
  for (const b of busy) {
    if (b.day !== day) continue;
    if (sm < toMin(b.end) && em > toMin(b.start)) return { state: "conflict", block: b };
  }
  return { state: "clear" };
}
const GOAL_MAP: Record<
  string,
  {
    categories?: string[];
    interests?: string[];
  }
> = {
  "Land an internship": { categories: ["Career", "Workshop", "Recruiting", "Info session"] },
  "Explore majors": {
    categories: ["Speaker", "Info session"],
    interests: ["Professional development"],
  },
  "Find my people": { categories: ["Social"], interests: ["Community"] },
  "Build leadership": { categories: ["Recruiting"], interests: ["Faith & leadership"] },
  "Serve Waco": { categories: ["Service"], interests: ["Social impact"] },
  "Start or grow a venture": { interests: ["Entrepreneurship"] },
  "Hear from alumni": { categories: ["Speaker", "Career"] },
};
export function recommend(o: Opp, prefs: Prefs | null | undefined, me: Me | null | undefined) {
  const reasons: string[] = [];
  let score = 0;
  if (!prefs) return { score, reasons };
  const ints = o.interests.filter((i) => prefs.interests.includes(i));
  if (ints.length) {
    score += 3 * ints.length;
    reasons.push(`Matches your interest in ${ints.slice(0, 2).join(" and ")}`);
  }
  for (const g of prefs.goals) {
    const m = GOAL_MAP[g];
    if (!m) continue;
    if (m.categories?.includes(o.category) || m.interests?.some((i) => o.interests.includes(i))) {
      score += 2;
      reasons.push(`Helps you “${g.toLowerCase()}”`);
      break;
    }
  }
  if (prefs.wantsFood && o.food === "yes") {
    score += 1;
    reasons.push("Food provided");
  }
  if (prefs.founder && o.org.slug === "oso-launch") {
    score += 4;
    reasons.push("You said you already run a venture — Oso Launch is built for founders like you");
  }
  if (me?.classYear && o.years.length && o.years.includes(me.classYear)) {
    score += 1;
    reasons.push(`Aimed at ${me.classYear.toLowerCase()}s`);
  }
  if (me?.follows?.includes(o.orgId)) {
    score += 2;
    reasons.push(`You follow ${o.org.short}`);
  }
  if (me?.classYear && o.years.length && !o.years.includes(me.classYear)) {
    score -= 5;
  }
  return { score, reasons };
}
export const triLabel = (t: Tri, yes: string, no: string) =>
  t === "yes" ? yes : t === "no" ? no : "Not specified";
