import { CONNECT_LABEL, ROOM_LABEL, StatusPill, VisibilityPill } from "@/components/brand";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fmtDay, fmtRange, useMe, type Opp, type Org } from "@/lib/app";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { CATEGORIES, INTERESTS, YEARS } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  CircleHelp,
  ClipboardList,
  Copy,
  ExternalLink,
  Flag,
  Globe,
  History,
  Lock,
  Pencil,
  Plus,
  RefreshCcw,
  ShieldAlert,
  Trash2,
  UserCog,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "wouter";
import { FreshDot } from "./organizations";
type OrgDetail = Org & {
  opportunities: Opp[];
  editors: {
    role: string;
    name: string;
    userId: number;
  }[];
  canEdit: boolean;
  history: {
    id: number;
    at: string;
    summary: string;
  }[];
  corrections: {
    id: number;
    orgId: number;
    note: string;
    status: string;
    at: string;
  }[];
};
interface FormVals {
  kind: "event" | "recruitment";
  title: string;
  summary: string;
  gain: string;
  nextStep: string;
  category: string;
  date: string;
  start: string;
  end: string;
  location: string;
  visibility: "public" | "teaser" | "private";
  teaser: string;
  openToNonmembers: string;
  food: string;
  years: string[];
  interests: string[];
  status: string;
  changeNote: string;
  externalUrl: string;
  externalLabel: string;
  connectStatus: string;
  roomStatus: string;
  joinProcess: string;
}
const pad = (n: number) => String(n).padStart(2, "0");
const toLocal = (iso: string) => {
  const d = new Date(iso);
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};
function OppDialog({
  org,
  opp,
  open,
  onOpenChange,
}: {
  org: OrgDetail;
  opp: Opp | null;
  open: boolean;
  onOpenChange: (b: boolean) => void;
}) {
  const { toast } = useToast();
  const blank = (): FormVals => {
    const d = new Date(Date.now() + 10 * 86400000);
    return {
      kind: "event",
      title: "",
      summary: "",
      gain: "",
      nextStep: "",
      category: "Info session",
      date: toLocal(d.toISOString()).date,
      start: "18:00",
      end: "19:00",
      location: "",
      visibility: "public",
      teaser: "",
      openToNonmembers: "yes",
      food: "unknown",
      years: [],
      interests: org.interests.slice(0, 1),
      status: "scheduled",
      changeNote: "",
      externalUrl: "",
      externalLabel: "",
      connectStatus: "not_started",
      roomStatus: "to_request",
      joinProcess: org.joinProcess,
    };
  };
  const form = useForm<FormVals>({ defaultValues: blank() });
  useEffect(() => {
    if (!open) return;
    if (opp && opp.startsAt && opp.endsAt) {
      const s = toLocal(opp.startsAt),
        e = toLocal(opp.endsAt);
      form.reset({
        kind: opp.kind,
        title: opp.title,
        summary: opp.summary,
        gain: opp.gain,
        nextStep: opp.nextStep,
        category: opp.category,
        date: s.date,
        start: s.time,
        end: e.time,
        location: opp.location ?? "",
        visibility: opp.visibility,
        teaser: opp.teaser ?? "",
        openToNonmembers: opp.openToNonmembers,
        food: opp.food,
        years: opp.years,
        interests: opp.interests,
        status: opp.status,
        changeNote: opp.changeNote ?? "",
        externalUrl: opp.externalUrl ?? "",
        externalLabel: opp.externalLabel ?? "",
        connectStatus: opp.connectStatus,
        roomStatus: opp.roomStatus,
        joinProcess: opp.joinProcess ?? "",
      });
    } else form.reset(blank());
  }, [open, opp]);
  const v = form.watch();
  const m = useMutation({
    mutationFn: async (x: FormVals) => {
      const startsAt = new Date(`${x.date}T${x.start}`).toISOString();
      const endsAt =
        x.kind === "recruitment" ? startsAt : new Date(`${x.date}T${x.end}`).toISOString();
      const body = {
        orgId: org.id,
        kind: x.kind,
        title: x.title,
        summary: x.summary,
        gain: x.gain,
        nextStep: x.nextStep,
        category: x.kind === "recruitment" ? "Recruiting" : x.category,
        interests: x.interests,
        departments: org.departments,
        startsAt,
        endsAt,
        location: x.location || null,
        visibility: x.visibility,
        teaser: x.teaser || null,
        years: x.years,
        openToNonmembers: x.visibility === "private" ? "no" : x.openToNonmembers,
        food: x.food,
        joinProcess: x.kind === "recruitment" ? x.joinProcess : null,
        status: x.status,
        changeNote: x.changeNote || null,
        externalUrl: x.externalUrl || null,
        externalLabel: x.externalLabel || null,
        connectStatus: x.connectStatus,
        roomStatus: x.roomStatus,
      };
      const r = opp
        ? await apiRequest("PATCH", `/api/opportunities/${opp.id}`, body)
        : await apiRequest("POST", "/api/opportunities", body);
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      onOpenChange(false);
      toast({
        title: opp ? "Changes saved" : "Listing saved",
        description: "Saved in this tab only. Reloading restores the sample data.",
      });
    },
    onError: (e: Error) =>
      toast({ title: "Couldn't save", description: e.message, variant: "destructive" }),
  });
  const toggleArr = (k: "years" | "interests", val: string) =>
    form.setValue(k, v[k].includes(val) ? v[k].filter((x) => x !== val) : [...v[k], val]);
  const err = (k: keyof FormVals) =>
    form.formState.errors[k] && (
      <p className="mt-1 text-xs text-destructive">{String(form.formState.errors[k]?.message)}</p>
    );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {opp ? "Edit listing" : "New listing"}
          </DialogTitle>
          <DialogDescription>
            Changes affect only this tab and reset on reload. Do not enter confidential information.
            Nothing is submitted to Baylor Connect.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((x) => m.mutate(x))} className="space-y-5">
          <RadioGroup
            value={v.kind}
            onValueChange={(x) => form.setValue("kind", x as any)}
            className="flex gap-4"
          >
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="event" />
              Event
            </label>
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="recruitment" />
              Recruiting window
            </label>
          </RadioGroup>
          <div>
            <Label>Title</Label>
            <Input
              {...form.register("title", {
                required: "Add a title",
                minLength: { value: 3, message: "Too short" },
              })}
              data-testid="input-opp-title"
            />
            {err("title")}
          </div>
          <div>
            <Label>
              What you'll gain{" "}
              <span className="font-normal text-muted-foreground">
                — one sentence in students' terms
              </span>
            </Label>
            <Textarea
              rows={2}
              {...form.register("gain", {
                required: "Tell students what they'll gain",
                minLength: { value: 10, message: "A bit more detail, please" },
              })}
              data-testid="input-opp-gain"
            />
            {err("gain")}
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              rows={3}
              {...form.register("summary", {
                required: "Add a description",
                minLength: { value: 10, message: "A bit more detail, please" },
              })}
              data-testid="input-opp-summary"
            />
            {err("summary")}
          </div>
          <div>
            <Label>Next step for students</Label>
            <Input
              {...form.register("nextStep", { required: "What should students do next?" })}
              placeholder="e.g. RSVP on Baylor Connect"
              data-testid="input-opp-next"
            />
            {err("nextStep")}
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <Label>{v.kind === "recruitment" ? "Deadline date" : "Date"}</Label>
              <Input
                type="date"
                {...form.register("date", { required: true })}
                data-testid="input-opp-date"
              />
            </div>
            <div>
              <Label>{v.kind === "recruitment" ? "Deadline time" : "Starts"}</Label>
              <Input
                type="time"
                {...form.register("start", { required: true })}
                data-testid="input-opp-start"
              />
            </div>
            {v.kind === "event" && (
              <div>
                <Label>Ends</Label>
                <Input
                  type="time"
                  {...form.register("end", {
                    required: true,
                    validate: (e, all) => e > all.start || "End after start",
                  })}
                  data-testid="input-opp-end"
                />
                {err("end")}
              </div>
            )}
          </div>
          {v.kind === "event" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Location</Label>
                <Input
                  {...form.register("location")}
                  placeholder="e.g. Foster 240"
                  data-testid="input-opp-location"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={v.category} onValueChange={(x) => form.setValue("category", x)}>
                  <SelectTrigger data-testid="select-opp-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c !== "Recruiting").map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div>
              <Label>Joining process</Label>
              <Select
                value={v.joinProcess || "Application"}
                onValueChange={(x) => form.setValue("joinProcess", x)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Open",
                    "Application",
                    "Interview",
                    "Application + interview",
                    "Selective program",
                  ].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>Who can see it</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["public", Globe, "Public", "Publish event details for everyone"],
                  [
                    "private",
                    Lock,
                    "Private · members only",
                    "Only club editors can see details here. Share them with members through your own channels.",
                  ],
                ] as const
              ).map(([val, Icon, t, d]) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => form.setValue("visibility", val)}
                  data-testid={`button-vis-${val}`}
                  className={cn(
                    "rounded-lg border p-3 text-left text-sm transition",
                    v.visibility === val
                      ? "border-primary ring-1 ring-primary"
                      : "hover:border-primary/40",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <div className="mt-1 font-semibold">{t}</div>
                  <div className="text-xs text-muted-foreground">{d}</div>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Private visibility is demonstrated with sample data only. A static public site cannot
              protect confidential event details. No membership roster is collected.
            </p>
          </div>
          {v.kind === "event" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Food</Label>
                <Select value={v.food} onValueChange={(x) => form.setValue("food", x)}>
                  <SelectTrigger data-testid="select-opp-food">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Food provided</SelectItem>
                    <SelectItem value="no">No food</SelectItem>
                    <SelectItem value="unknown">Not specified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Open to non-members</Label>
                <Select
                  value={v.openToNonmembers}
                  onValueChange={(x) => form.setValue("openToNonmembers", x)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">Members only</SelectItem>
                    <SelectItem value="unknown">Not specified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div>
            <Label>
              Eligible class years{" "}
              <span className="font-normal text-muted-foreground">— leave empty for all</span>
            </Label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {YEARS.map((y) => (
                <button
                  type="button"
                  key={y}
                  onClick={() => toggleArr("years", y)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs",
                    v.years.includes(y) ? "border-primary bg-primary text-primary-foreground" : "",
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Interests</Label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {INTERESTS.map((y) => (
                <button
                  type="button"
                  key={y}
                  onClick={() => toggleArr("interests", y)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs",
                    v.interests.includes(y)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "",
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
          {v.kind === "event" && (
            <div className="rounded-lg border bg-secondary/40 p-4">
              <div className="text-sm font-semibold">
                Official status (you report it — the hub doesn't verify)
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Baylor Connect</Label>
                  <Select
                    value={v.connectStatus}
                    onValueChange={(x) => form.setValue("connectStatus", x)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CONNECT_LABEL).map(([k, l]) => (
                        <SelectItem key={k} value={k}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Foster room</Label>
                  <Select
                    value={v.roomStatus}
                    onValueChange={(x) => form.setValue("roomStatus", x)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROOM_LABEL).map(([k, l]) => (
                        <SelectItem key={k} value={k}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Official link (Connect RSVP, form)</Label>
                  <Input
                    {...form.register("externalUrl")}
                    placeholder="https://baylor.campuslabs.com/engage/…"
                  />
                </div>
                <div>
                  <Label className="text-xs">Button label</Label>
                  <Input {...form.register("externalLabel")} placeholder="RSVP on Baylor Connect" />
                </div>
              </div>
            </div>
          )}
          {opp && (
            <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
              <div>
                <Label>Status</Label>
                <Select value={v.status} onValueChange={(x) => form.setValue("status", x)}>
                  <SelectTrigger data-testid="select-opp-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="changed">Changed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>
                  What changed?{" "}
                  <span className="font-normal text-muted-foreground">(shown to students)</span>
                </Label>
                <Input {...form.register("changeNote")} data-testid="input-opp-changenote" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={m.isPending} data-testid="button-opp-submit">
              {opp ? "Save changes" : "Publish to hub"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
interface Packet {
  notice: string;
  fields: [string, string][];
  checks: {
    label: string;
    ok: boolean | null;
    note: string;
  }[];
  reported: {
    connectStatus: string;
    roomStatus: string;
  };
  sources: {
    label: string;
    url: string;
  }[];
}
function PacketView({ oppId }: { oppId: number }) {
  const { toast } = useToast();
  const { data: p, isLoading } = useQuery<Packet>({
    queryKey: ["/api/opportunities", oppId, "packet"],
  });
  if (isLoading || !p) return <div className="h-40 animate-pulse rounded-xl bg-muted" />;
  const text = p.fields.map(([k, v]) => `${k}: ${v}`).join("\n");
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-[#FFB81C]/60 bg-accent/50 p-3 text-sm text-accent-foreground">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        {p.notice}
      </div>
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Copy-ready event details</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard?.writeText(text).then(
                () => toast({ title: "Copied" }),
                () =>
                  toast({
                    title: "Copy not available in preview",
                    description: "Select the text manually.",
                  }),
              );
            }}
            data-testid="button-copy-packet"
          >
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Copy
          </Button>
        </div>
        <dl className="divide-y text-sm">
          {p.fields.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[160px_1fr] gap-3 px-4 py-2.5">
              <dt className="text-muted-foreground">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="rounded-xl border bg-card p-4">
        <div className="text-sm font-semibold">Lead-time checks</div>
        <ul className="mt-3 space-y-2.5">
          {p.checks.map((c) => (
            <li key={c.label} className="flex items-start gap-2.5 text-sm">
              {c.ok === true ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : c.ok === false ? (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              ) : (
                <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              )}
              <span>
                <span className="font-medium">{c.label}</span>
                <br />
                <span className="text-muted-foreground">{c.note}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Rules summarized from public Baylor guidance; confirm current rules before relying on
          them. Exact Connect form fields need an authorized example.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          {p.sources.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 underline"
            >
              {s.label}
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      </div>
      <Button asChild>
        <a href="https://baylor.campuslabs.com/engage/" target="_blank" rel="noopener noreferrer">
          Open Baylor Connect to submit
          <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}
export default function Workspace() {
  const { data: me } = useMe();
  const { toast } = useToast();
  const { data: orgs } = useQuery<Org[]>({ queryKey: ["/api/orgs"] });
  const editable = useMemo(
    () => (orgs ?? []).filter((o) => me?.role === "admin" || me?.editorOrgIds.includes(o.id)),
    [orgs, me],
  );
  const [slug, setSlug] = useState<string>("");
  const [activeTab, setActiveTab] = useState("listings");
  useEffect(() => {
    if (editable.length && !editable.find((o) => o.slug === slug)) setSlug(editable[0].slug);
  }, [editable]);
  const { data: org } = useQuery<OrgDetail>({ queryKey: ["/api/orgs", slug], enabled: !!slug });
  const { data: users } = useQuery<
    {
      id: number;
      name: string;
      role: string;
    }[]
  >({ queryKey: ["/api/users"] });
  const [dlg, setDlg] = useState<{
    open: boolean;
    opp: Opp | null;
  }>({ open: false, opp: null });
  const [packetFor, setPacketFor] = useState<string>("");
  const [confirmDel, setConfirmDel] = useState<Opp | null>(null);
  const act = useMutation({
    mutationFn: async ({ method, url, body }: { method: string; url: string; body?: unknown }) =>
      (await apiRequest(method, url, body)).json(),
    onSuccess: () => queryClient.invalidateQueries(),
    onError: (e: Error) =>
      toast({ title: "Action failed", description: e.message, variant: "destructive" }),
  });
  const profile = useForm({
    values: org
      ? {
          tagline: org.tagline,
          mission: org.mission,
          culture: org.culture,
          joinDetails: org.joinDetails,
          recruitingWindow: org.recruitingWindow ?? "",
          meetingRhythm: org.meetingRhythm ?? "",
          contactEmail: org.contactEmail ?? "",
          joinProcess: org.joinProcess,
          b0: org.benefits[0]?.label ?? "",
          b1: org.benefits[1]?.label ?? "",
          b2: org.benefits[2]?.label ?? "",
        }
      : undefined,
  });
  const [primary, setPrimary] = useState<string>("");
  const [backup, setBackup] = useState<string>("");
  useEffect(() => {
    if (org) {
      setPrimary(String(org.primaryEditorId ?? "none"));
      setBackup(String(org.backupEditorId ?? "none"));
    }
  }, [org]);
  if (!me)
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-serif text-2xl font-semibold">Club workspace</h1>
        <p className="mt-2 text-muted-foreground">
          Use Officer sign in to open your organization's workspace. Preview accounts are available
          until Baylor sign-in is connected.
        </p>
      </div>
    );
  if (!editable.length)
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-serif text-2xl font-semibold">No editor access</h1>
        <p className="mt-2 text-muted-foreground">
          {me.name} isn't an editor for any organization. Editors are assigned by a club's current
          editors or the council admin.
        </p>
      </div>
    );
  const opps = (org?.opportunities ?? [])
    .slice()
    .sort((a, b) => (a.startsAt ?? "").localeCompare(b.startsAt ?? ""));
  const corrections = org?.corrections ?? [];
  return (
    <div>
      <PageHeader
        eyebrow="Club workspace"
        title={org ? org.name : "Workspace"}
        actions={
          <Select value={slug} onValueChange={setSlug}>
            <SelectTrigger className="w-64" data-testid="select-workspace-org">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {editable.map((o) => (
                <SelectItem key={o.slug} value={o.slug}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      >
        {org && (
          <span className="flex flex-wrap items-center gap-3">
            <FreshDot lastReviewed={org.lastReviewed} />
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                act.mutate(
                  { method: "POST", url: `/api/orgs/${org.id}/review` },
                  { onSuccess: () => toast({ title: "Marked as reviewed" }) },
                )
              }
              data-testid="button-mark-reviewed"
            >
              <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
              Confirm profile is current
            </Button>
            <Link href={`/organizations/${org.slug}`} className="text-sm underline">
              View public profile
            </Link>
          </span>
        )}
      </PageHeader>
      {org && (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex h-auto flex-wrap justify-start">
              <TabsTrigger value="listings" data-testid="tab-listings">
                Listings
              </TabsTrigger>
              <TabsTrigger value="profile" data-testid="tab-profile">
                Profile
              </TabsTrigger>
              <TabsTrigger value="packet" data-testid="tab-packet">
                Connect prep
              </TabsTrigger>
              <TabsTrigger value="editors" data-testid="tab-editors">
                Editors & handover
              </TabsTrigger>
            </TabsList>

            <TabsContent value="listings" className="mt-6">
              <div className="flex items-center justify-between">
                <h2 className="font-sans text-lg font-semibold tracking-normal">
                  {opps.length} listings
                </h2>
                <Button
                  onClick={() => setDlg({ open: true, opp: null })}
                  data-testid="button-new-opp"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  New listing
                </Button>
              </div>
              <div className="mt-4 overflow-hidden rounded-xl border bg-card">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3">Listing</th>
                      <th className="hidden p-3 md:table-cell">When</th>
                      <th className="hidden p-3 lg:table-cell">Official status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {opps.map((o) => (
                      <tr key={o.id} data-testid={`row-opp-${o.id}`}>
                        <td className="p-3">
                          <div className="font-medium">{o.title}</div>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            <StatusPill o={o} />
                            <VisibilityPill v={o.visibility} />
                            {o.kind === "recruitment" && (
                              <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                                Recruiting
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="hidden p-3 text-muted-foreground md:table-cell">
                          {o.startsAt && (
                            <>
                              {fmtDay(o.startsAt)}
                              <br />
                              {o.kind === "event" && o.endsAt
                                ? fmtRange(o.startsAt, o.endsAt)
                                : "Deadline"}
                            </>
                          )}
                        </td>
                        <td className="hidden p-3 text-xs text-muted-foreground lg:table-cell">
                          {o.kind === "event" ? (
                            <>
                              Connect: {CONNECT_LABEL[o.connectStatus]}
                              <br />
                              Room: {ROOM_LABEL[o.roomStatus]}
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-3">
                          <div className="ml-auto flex max-w-[112px] flex-wrap justify-end gap-1 sm:max-w-none sm:flex-nowrap">
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Edit"
                              onClick={() => setDlg({ open: true, opp: o })}
                              data-testid={`button-edit-${o.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Duplicate to next week"
                              onClick={() =>
                                act.mutate(
                                  { method: "POST", url: `/api/opportunities/${o.id}/duplicate` },
                                  {
                                    onSuccess: () =>
                                      toast({
                                        title: "Duplicated to next week",
                                        description:
                                          "Connect status reset — submit the new date separately.",
                                      }),
                                  },
                                )
                              }
                              data-testid={`button-dup-${o.id}`}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            {o.kind === "event" && (
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label="Prepare Connect packet"
                                onClick={() => {
                                  setPacketFor(String(o.id));
                                  setActiveTab("packet");
                                }}
                                data-testid={`button-packet-${o.id}`}
                              >
                                <ClipboardList className="h-4 w-4" />
                              </Button>
                            )}
                            {o.status !== "canceled" && (
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label="Cancel event"
                                onClick={() =>
                                  act.mutate(
                                    {
                                      method: "PATCH",
                                      url: `/api/opportunities/${o.id}`,
                                      body: {
                                        status: "canceled",
                                        changeNote: o.changeNote || "Canceled by the organization.",
                                      },
                                    },
                                    {
                                      onSuccess: () =>
                                        toast({
                                          title: "Marked canceled",
                                          description:
                                            "Students see it as canceled everywhere, including the Today screen.",
                                        }),
                                    },
                                  )
                                }
                                data-testid={`button-cancel-${o.id}`}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Delete"
                              onClick={() => setConfirmDel(o)}
                              data-testid={`button-delete-${o.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(corrections.length > 0 || org.history.length > 0) && (
                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                  <section className="rounded-xl border bg-card p-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <Flag className="h-4 w-4" />
                      Corrections from students
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm">
                      {corrections.length === 0 ? (
                        <li className="text-muted-foreground">None open.</li>
                      ) : (
                        corrections.map((c) => (
                          <li
                            key={c.id}
                            className="flex items-start justify-between gap-3 rounded-lg bg-secondary/40 p-3"
                          >
                            <span>{c.note}</span>
                            {c.status === "open" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  act.mutate({
                                    method: "POST",
                                    url: `/api/corrections/${c.id}/resolve`,
                                  })
                                }
                              >
                                Resolve
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">Resolved</span>
                            )}
                          </li>
                        ))
                      )}
                    </ul>
                  </section>
                  <section className="rounded-xl border bg-card p-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <History className="h-4 w-4" />
                      Recent changes
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm">
                      {org.history.slice(0, 8).map((h) => (
                        <li key={h.id} className="flex justify-between gap-3">
                          <span>{h.summary}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {new Date(h.at).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              )}
            </TabsContent>

            <TabsContent value="profile" className="mt-6">
              <form
                className="grid max-w-3xl gap-4"
                onSubmit={profile.handleSubmit((x: any) =>
                  act.mutate(
                    {
                      method: "PATCH",
                      url: `/api/orgs/${org.id}`,
                      body: {
                        tagline: x.tagline,
                        mission: x.mission,
                        culture: x.culture,
                        joinDetails: x.joinDetails,
                        joinProcess: x.joinProcess,
                        recruitingWindow: x.recruitingWindow || null,
                        meetingRhythm: x.meetingRhythm || null,
                        contactEmail: x.contactEmail || null,
                        benefits: [
                          [x.b0, "Now"],
                          [x.b1, "Next year"],
                          [x.b2, "Career"],
                        ]
                          .filter(([l]) => l)
                          .map(([label, horizon]) => ({ label, horizon })),
                      },
                    },
                    {
                      onSuccess: () =>
                        toast({ title: "Profile saved", description: "Review date updated." }),
                    },
                  ),
                )}
              >
                <div>
                  <Label>Tagline</Label>
                  <Input {...profile.register("tagline")} data-testid="input-org-tagline" />
                </div>
                <div>
                  <Label>What membership feels like</Label>
                  <Textarea
                    rows={3}
                    {...profile.register("culture")}
                    data-testid="input-org-culture"
                  />
                </div>
                <div>
                  <Label>Mission</Label>
                  <Textarea rows={3} {...profile.register("mission")} />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label className="text-xs">Gain — this semester</Label>
                    <Input {...profile.register("b0")} />
                  </div>
                  <div>
                    <Label className="text-xs">Gain — by next year</Label>
                    <Input {...profile.register("b1")} />
                  </div>
                  <div>
                    <Label className="text-xs">Gain — for your career</Label>
                    <Input {...profile.register("b2")} />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Joining process</Label>
                    <Select
                      value={profile.watch("joinProcess")}
                      onValueChange={(x) => profile.setValue("joinProcess", x)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Open",
                          "Application",
                          "Interview",
                          "Application + interview",
                          "Selective program",
                        ].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Recruiting window</Label>
                    <Input {...profile.register("recruitingWindow")} />
                  </div>
                </div>
                <div>
                  <Label>How to join</Label>
                  <Textarea rows={2} {...profile.register("joinDetails")} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Meeting rhythm</Label>
                    <Input {...profile.register("meetingRhythm")} />
                  </div>
                  <div>
                    <Label>Contact email</Label>
                    <Input {...profile.register("contactEmail")} />
                  </div>
                </div>
                <div>
                  <Button type="submit" disabled={act.isPending} data-testid="button-save-profile">
                    Save profile
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="packet" className="mt-6 max-w-3xl">
              <p className="text-sm text-muted-foreground">
                Reuse what you already entered to fill out Baylor Connect's event form. The hub
                checks lead times against published guidance.
              </p>
              <Select value={packetFor} onValueChange={setPacketFor}>
                <SelectTrigger className="mt-4 w-full sm:w-96" data-testid="select-packet-opp">
                  <SelectValue placeholder="Choose an event" />
                </SelectTrigger>
                <SelectContent>
                  {opps
                    .filter((o) => o.kind === "event")
                    .map((o) => (
                      <SelectItem key={o.id} value={String(o.id)}>
                        {o.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="mt-6">
                {packetFor ? (
                  <PacketView oppId={Number(packetFor)} />
                ) : (
                  <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                    Pick an event to prepare its packet.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="editors" className="mt-6 max-w-2xl">
              <div className="rounded-xl border bg-card p-6">
                <h3 className="flex items-center gap-2 font-sans text-lg font-semibold tracking-normal">
                  <UserCog className="h-5 w-5" />
                  Editors
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Every club should have a primary and a backup editor so the profile survives
                  officer turnover. Handing over keeps all history.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Primary editor</Label>
                    <Select value={primary} onValueChange={setPrimary}>
                      <SelectTrigger data-testid="select-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {users
                          ?.filter((u) => u.role !== "admin")
                          .map((u) => (
                            <SelectItem key={u.id} value={String(u.id)}>
                              {u.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Backup editor</Label>
                    <Select value={backup} onValueChange={setBackup}>
                      <SelectTrigger data-testid="select-backup">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {users
                          ?.filter((u) => u.role !== "admin")
                          .map((u) => (
                            <SelectItem key={u.id} value={String(u.id)}>
                              {u.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  className="mt-5"
                  onClick={() =>
                    act.mutate(
                      {
                        method: "POST",
                        url: `/api/orgs/${org.id}/handover`,
                        body: {
                          primaryEditorId: primary === "none" ? null : Number(primary),
                          backupEditorId: backup === "none" ? null : Number(backup),
                        },
                      },
                      {
                        onSuccess: () =>
                          toast({
                            title: "Editors updated",
                            description: "Logged in the change history.",
                          }),
                      },
                    )
                  }
                  data-testid="button-handover"
                >
                  Save handover
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
      {org && (
        <OppDialog
          org={org}
          opp={dlg.opp}
          open={dlg.open}
          onOpenChange={(b) => setDlg((d) => ({ ...d, open: b }))}
        />
      )}
      <Dialog open={!!confirmDel} onOpenChange={(b) => !b && setConfirmDel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete “{confirmDel?.title}”?</DialogTitle>
            <DialogDescription>
              If the event is still happening differently, mark it changed or canceled instead so
              students who saved it are informed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDel(null)}>
              Keep it
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                act.mutate({ method: "DELETE", url: `/api/opportunities/${confirmDel!.id}` });
                setConfirmDel(null);
              }}
              data-testid="button-confirm-delete"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
