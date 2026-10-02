import { PageHeader } from "@/components/layout";
import { OppCard } from "@/components/opp-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  recommend,
  relDay,
  scheduleFit,
  useApp,
  useMe,
  type Busy,
  type Opp,
  type Org,
} from "@/lib/app";
import { cn } from "@/lib/utils";
import { CATEGORIES, DEPARTMENTS, INTERESTS, YEARS } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { CalendarRange, List, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
interface F {
  q: string;
  kind: "all" | "event" | "recruitment";
  interests: string[];
  categories: string[];
  dept: string;
  years: string;
  when: string;
  food: boolean;
  open: boolean;
  noInterview: boolean;
  hideCanceled: boolean;
  fitsSchedule: boolean;
  org: string;
}
const EMPTY: F = {
  q: "",
  kind: "all",
  interests: [],
  categories: [],
  dept: "any",
  years: "any",
  when: "any",
  food: false,
  open: true,
  noInterview: false,
  hideCanceled: false,
  fitsSchedule: false,
  org: "any",
};
function Filters({
  f,
  set,
  orgs,
  hasBusy,
}: {
  f: F;
  set: (p: Partial<F>) => void;
  orgs: Org[];
  hasBusy: boolean;
}) {
  const toggle = (k: "interests" | "categories", v: string) =>
    set({ [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] } as Partial<F>);
  return (
    <div className="space-y-7">
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Practical
        </h3>
        <div className="space-y-3">
          {(
            [
              ["food", "Food provided"],
              ["open", "Open to everyone"],
              ["hideCanceled", "Hide canceled"],
            ] as const
          ).map(([k, l]) => (
            <div key={k} className="flex items-center justify-between gap-2">
              <Label htmlFor={`f-${k}`} className="text-sm font-normal">
                {l}
              </Label>
              <Switch
                id={`f-${k}`}
                checked={f[k]}
                onCheckedChange={(v) => set({ [k]: v } as Partial<F>)}
                data-testid={`switch-${k}`}
              />
            </div>
          ))}
          {!f.open && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              Members-only notices are included. Private event details stay with each club.
            </p>
          )}
        </div>
      </section>
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          When
        </h3>
        <Select value={f.when} onValueChange={(v) => set({ when: v })}>
          <SelectTrigger data-testid="select-when">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any upcoming date</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Next 7 days</SelectItem>
            <SelectItem value="2weeks">Next 14 days</SelectItem>
            <SelectItem value="month">Next 30 days</SelectItem>
          </SelectContent>
        </Select>
      </section>
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Who it's for
        </h3>
        <div className="space-y-3">
          <Select value={f.years} onValueChange={(v) => set({ years: v })}>
            <SelectTrigger data-testid="select-year">
              <SelectValue placeholder="Class year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any class year</SelectItem>
              {YEARS.map((y) => (
                <SelectItem key={y} value={y}>
                  {y} eligible
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={f.dept} onValueChange={(v) => set({ dept: v })}>
            <SelectTrigger data-testid="select-dept">
              <SelectValue placeholder="Major / department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any major or department</SelectItem>
              {DEPARTMENTS.filter((d) => d !== "Any major").map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={f.org} onValueChange={(v) => set({ org: v })}>
            <SelectTrigger data-testid="select-org">
              <SelectValue placeholder="Organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any organization</SelectItem>
              {orgs.map((o) => (
                <SelectItem key={o.id} value={String(o.id)}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Interests
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {INTERESTS.map((i) => (
            <button
              key={i}
              onClick={() => toggle("interests", i)}
              data-testid={`chip-interest-${i}`}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition",
                f.interests.includes(i)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card hover:border-primary/40",
              )}
            >
              {i}
            </button>
          ))}
        </div>
      </section>
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Type
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.filter((c) => c !== "Recruiting").map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={f.categories.includes(c)}
                onCheckedChange={() => toggle("categories", c)}
                data-testid={`check-cat-${c}`}
              />
              {c}
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
export default function Discover() {
  const { preset, setPreset, userId } = useApp();
  const { data: me } = useMe();
  const [f, setF] = useState<F>(EMPTY);
  const [personal, setPersonal] = useState(false);
  const [view, setView] = useState<"list" | "agenda">("agenda");
  const set = (p: Partial<F>) => setF((x) => ({ ...x, ...p }));
  useEffect(() => {
    if (preset) {
      setF({
        ...EMPTY,
        ...preset,
        interests: preset.interests ?? [],
        years: preset.years ?? "any",
        when: preset.when ?? "any",
        kind: preset.kind ?? "all",
        q: preset.q ?? "",
      } as F);
      setPreset(null);
    }
  }, [preset]);
  const { data: opps, isLoading } = useQuery<Opp[]>({ queryKey: ["/api/opportunities"] });
  const { data: orgs } = useQuery<Org[]>({ queryKey: ["/api/orgs"] });
  const prefs = null;
  const busy: Busy[] = [];
  const orgMap = useMemo(() => new Map((orgs ?? []).map((o) => [o.id, o])), [orgs]);
  const results = useMemo(() => {
    const now = Date.now();
    const horizon =
      { any: Infinity, today: 1, week: 7, "2weeks": 14, month: 30 }[f.when] ?? Infinity;
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const q = f.q.trim().toLowerCase();
    return (opps ?? [])
      .filter((o) => {
        const end = o.endsAt ? Date.parse(o.endsAt) : Infinity;
        if (end < now && o.startsAt) return false;
        if (f.kind !== "all" && o.kind !== f.kind) return false;
        if (f.hideCanceled && o.status === "canceled") return false;
        if (o.startsAt) {
          const s = Date.parse(o.startsAt);
          if (f.when === "today" ? s > endOfToday.getTime() : s > now + horizon * 86400000)
            return false;
        } else if (f.when !== "any") return false;
        if (f.food && o.food !== "yes") return false;
        if (f.open && (o.openToNonmembers !== "yes" || o.visibility !== "public")) return false;
        if (f.noInterview) {
          const jp = o.joinProcess ?? orgMap.get(o.orgId)?.joinProcess ?? "";
          if (/interview|selective/i.test(jp)) return false;
        }
        if (f.years !== "any" && o.years.length && !o.years.includes(f.years)) return false;
        if (f.dept !== "any" && !o.departments.includes(f.dept)) return false;
        if (f.org !== "any" && String(o.orgId) !== f.org) return false;
        if (f.interests.length && !o.interests.some((i) => f.interests.includes(i))) return false;
        if (f.categories.length && !f.categories.includes(o.category)) return false;
        if (f.fitsSchedule && scheduleFit(o, busy).state === "conflict") return false;
        if (q) {
          const hay = [
            o.title,
            o.summary,
            o.gain,
            o.category,
            o.org.name,
            o.org.short,
            ...o.interests,
            ...o.departments,
            o.food === "yes" ? "free food" : "",
          ]
            .join(" ")
            .toLowerCase();
          if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
        }
        return true;
      })
      .map((o) => ({ o, rec: recommend(o, prefs, me) }));
  }, [opps, f, busy, prefs, me, orgMap]);
  const sorted = useMemo(() => {
    const arr = [...results];
    if (personal && prefs)
      arr.sort(
        (a, b) =>
          b.rec.score - a.rec.score || (a.o.startsAt ?? "z").localeCompare(b.o.startsAt ?? "z"),
      );
    return arr;
  }, [results, personal, prefs]);
  const groups = useMemo(() => {
    const m = new Map<string, typeof sorted>();
    for (const r of results) {
      const k = r.o.startsAt ? relDay(r.o.startsAt) : "Members-only activities";
      m.set(k, [...(m.get(k) ?? []), r]);
    }
    return [...m.entries()];
  }, [results]);
  const active: [string, () => void][] = [
    ...(f.q ? [[`“${f.q}”`, () => set({ q: "" })] as [string, () => void]] : []),
    ...f.interests.map(
      (i) =>
        [i, () => set({ interests: f.interests.filter((x) => x !== i) })] as [string, () => void],
    ),
    ...f.categories.map(
      (c) =>
        [c, () => set({ categories: f.categories.filter((x) => x !== c) })] as [string, () => void],
    ),
    ...(f.food ? [["Food provided", () => set({ food: false })] as [string, () => void]] : []),
    ...(f.open ? [["Open to everyone", () => set({ open: false })] as [string, () => void]] : []),
    ...(f.noInterview
      ? [["No interview", () => set({ noInterview: false })] as [string, () => void]]
      : []),
    ...(f.years !== "any"
      ? [[`${f.years}`, () => set({ years: "any" })] as [string, () => void]]
      : []),
    ...(f.dept !== "any" ? [[f.dept, () => set({ dept: "any" })] as [string, () => void]] : []),
    ...(f.when !== "any"
      ? [
          [
            {
              today: "Today",
              week: "Next 7 days",
              "2weeks": "Next 14 days",
              month: "Next 30 days",
            }[f.when]!,
            () => set({ when: "any" }),
          ] as [string, () => void],
        ]
      : []),
    ...(f.org !== "any"
      ? [
          [orgMap.get(Number(f.org))?.short ?? "Org", () => set({ org: "any" })] as [
            string,
            () => void,
          ],
        ]
      : []),
    ...(f.fitsSchedule
      ? [["Fits my schedule", () => set({ fitsSchedule: false })] as [string, () => void]]
      : []),
  ];
  const filterPanel = <Filters f={f} set={set} orgs={orgs ?? []} hasBusy={!!busy?.length} />;
  return (
    <div>
      <PageHeader eyebrow="Discover" title="What's coming up at Hankamer">
        Find events and recruiting opportunities by interest, organization or date.
      </PageHeader>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={f.q}
              onChange={(e) => set({ q: e.target.value })}
              placeholder="Search by topic, club, major or keyword"
              className="h-11 pl-9"
              data-testid="input-search"
            />
          </div>
          <Tabs value={f.kind} onValueChange={(v) => set({ kind: v as F["kind"] })}>
            <TabsList className="h-11">
              <TabsTrigger value="all" className="h-9" data-testid="tab-all">
                All
              </TabsTrigger>
              <TabsTrigger value="event" className="h-9" data-testid="tab-events">
                Events
              </TabsTrigger>
              <TabsTrigger value="recruitment" className="h-9" data-testid="tab-recruiting">
                Recruiting
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-11 lg:hidden" data-testid="button-filters">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters{active.length ? ` (${active.length})` : ""}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetTitle className="mb-4">Filters</SheetTitle>
              {filterPanel}
            </SheetContent>
          </Sheet>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">{filterPanel}</div>
          </aside>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted-foreground" data-testid="text-result-count">
                <span className="font-semibold text-foreground">{results.length}</span>{" "}
                {results.length === 1 ? "result" : "results"}
              </span>
              {active.map(([l, clear]) => (
                <button
                  key={l}
                  onClick={clear}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/70"
                >
                  {l}
                  <X className="h-3 w-3" />
                </button>
              ))}
              {active.length > 0 && (
                <button
                  onClick={() => setF({ ...EMPTY, open: false })}
                  className="text-xs font-medium text-primary underline dark:text-[#FFB81C]"
                  data-testid="button-clear"
                >
                  Clear all
                </button>
              )}
              <div className="ml-auto flex items-center gap-2">
                <div className="flex rounded-md border p-0.5">
                  <button
                    aria-label="Agenda view"
                    onClick={() => setView("agenda")}
                    className={cn("rounded px-2 py-1", view === "agenda" && "bg-secondary")}
                    data-testid="button-view-agenda"
                  >
                    <CalendarRange className="h-4 w-4" />
                  </button>
                  <button
                    aria-label="List view"
                    onClick={() => setView("list")}
                    className={cn("rounded px-2 py-1", view === "list" && "bg-secondary")}
                    data-testid="button-view-list"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              {isLoading && (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                  ))}
                </div>
              )}
              {!isLoading && results.length === 0 && (
                <div className="rounded-2xl border border-dashed p-12 text-center">
                  <h3 className="font-serif text-xl font-semibold">Nothing matches every filter</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try removing one filter — or browse the full directory of organizations instead.
                  </p>
                  <Button className="mt-5" variant="outline" onClick={() => setF(EMPTY)}>
                    Reset filters
                  </Button>
                </div>
              )}
              {view === "list" || (personal && prefs) ? (
                <div className="grid gap-3">
                  {sorted.map(({ o, rec }) => (
                    <OppCard
                      key={o.id}
                      o={o}
                      busy={busy}
                      reasons={personal ? rec.reasons : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  {groups.map(([day, items]) => (
                    <section key={day}>
                      <h2 className="sticky top-[76px] z-10 -mx-1 mb-3 bg-background/90 px-1 py-2 font-sans text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
                        {day}
                      </h2>
                      <div className="grid gap-3">
                        {items.map(({ o, rec }) => (
                          <OppCard
                            key={o.id}
                            o={o}
                            busy={busy}
                            reasons={prefs ? rec.reasons : undefined}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
