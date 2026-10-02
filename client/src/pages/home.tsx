import { OrgMark } from "@/components/brand";
import { OppCard } from "@/components/opp-card";
import { OrgPhotoPlaceholder } from "@/components/org-photo-placeholder";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { daysUntil, useApp, type Opp, type Org, type Preset } from "@/lib/app";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, DoorOpen, GraduationCap, Search, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
const INTENTS = [
  { label: "Free food this week", icon: UtensilsCrossed, preset: { food: true, when: "week" } },
  { label: "Open to non-members", icon: DoorOpen, preset: { open: true } },
  { label: "First-year friendly", icon: GraduationCap, preset: { years: "First-year" } },
];
export default function Home() {
  const [, nav] = useLocation();
  const { setPreset } = useApp();
  const [q, setQ] = useState("");
  const { data: opps, isLoading } = useQuery<Opp[]>({ queryKey: ["/api/opportunities"] });
  const { data: orgs } = useQuery<Org[]>({ queryKey: ["/api/orgs"] });
  const go = (p: Preset) => {
    setPreset({ kind: "event", open: true, ...p });
    nav("/discover");
  };
  const now = new Date().toISOString();
  const upcoming = (opps ?? [])
    .filter(
      (o) =>
        o.kind === "event" &&
        o.visibility === "public" &&
        o.openToNonmembers === "yes" &&
        o.endsAt! >= now &&
        o.status !== "canceled",
    )
    .slice(0, 5);
  const deadlines = (opps ?? [])
    .filter(
      (o) =>
        o.kind === "recruitment" &&
        o.visibility === "public" &&
        o.startsAt! >= now &&
        o.status !== "canceled",
    )
    .slice(0, 4);
  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img
          src="./images/hero-atrium.jpg"
          alt="Illustrative view of a busy business school atrium"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0c2c20]/95 via-[#0f3527]/80 to-[#0f3527]/20" />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#FFB81C]">
              Hankamer School of Business
            </p>
            <h1 className="mt-5 font-serif text-[clamp(2.6rem,5.3vw,4.5rem)] font-medium leading-[1.04] tracking-tight text-white">
              What's happening
              <br />
              at Hankamer.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/85">
              Events, conversations and opportunities around Foster. Find something worth showing up
              for.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                go({ q });
              }}
              className="mt-8 max-w-xl"
            >
              <label
                htmlFor="events-search"
                className="mb-3 block text-xs font-semibold uppercase tracking-[.16em] text-white"
              >
                Search upcoming events
              </label>
              <div className="flex items-center gap-2 rounded-md bg-white p-1.5">
                <Search className="ml-3 h-5 w-5 shrink-0 text-[#154734]/60" />
                <input
                  id="events-search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Try consulting, free food, or startup"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm text-[#154734] outline-none"
                  data-testid="input-hero-search"
                />
                <Button
                  type="submit"
                  className="h-11 bg-[#154734] px-4 text-white hover:bg-[#0f3527]"
                  data-testid="button-hero-search"
                >
                  Find events
                </Button>
              </div>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {INTENTS.map((i) => (
                <button
                  key={i.label}
                  onClick={() => go(i.preset)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/20"
                  data-testid={`chip-intent-${i.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <i.icon className="h-3.5 w-3.5 text-[#FFB81C]" />
                  {i.label}
                </button>
              ))}
            </div>
            <Link
              href="/organizations"
              className="mt-7 inline-flex items-center gap-2 text-sm text-white/85 underline underline-offset-4 hover:text-white"
            >
              Looking for a club? Browse organizations <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pt-14 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-6">
          <div>
            <p className="eyebrow">Coming up</p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">Happening around Foster</h2>
          </div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-sm font-medium"
            data-testid="link-see-all"
          >
            All events <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="event-list divide-y" data-testid="home-event-list">
          {isLoading && <Skeleton className="my-5 h-32" />}
          {upcoming.map((o) => (
            <OppCard key={o.id} o={o} />
          ))}
          {!isLoading && !upcoming.length && (
            <p className="py-10 text-muted-foreground">
              No upcoming public events. Check back soon.
            </p>
          )}
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 pt-16 sm:px-8 lg:grid-cols-[1.1fr_1fr]">
        <Link
          href="/organizations/consulting-group"
          className="group flex min-h-[320px] flex-col overflow-hidden rounded-sm"
        >
          <OrgPhotoPlaceholder
            name="The Consulting Group at Baylor"
            className="min-h-[240px] flex-1"
          />
          <div className="border-x border-b px-6 py-5">
            <p className="text-xs uppercase tracking-[.16em] text-muted-foreground">
              The Consulting Group at Baylor
            </p>
            <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium">
              Explore the club <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
        <div className="min-w-0">
          <p className="eyebrow">Plan ahead</p>
          <h2 className="mt-2 font-serif text-3xl">Recruiting deadlines</h2>
          <ul className="mt-5 divide-y border-y">
            {deadlines.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/opportunity/${o.id}`}
                  className="flex items-center gap-4 py-5"
                  data-testid={`link-deadline-${o.id}`}
                >
                  <OrgMark short={o.org.short} accent={o.org.accent} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{o.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{o.org.name}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-serif text-2xl">{daysUntil(o.startsAt!)} days</div>
                    <div className="text-xs text-muted-foreground">to apply</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pt-20 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Business Council</p>
            <h2 className="mt-2 font-serif text-3xl">Built with our organizations.</h2>
          </div>
          <Link href="/organizations" className="inline-flex items-center gap-2 text-sm">
            Meet the council <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div
          data-testid="council-icon-grid"
          className="mt-7 grid grid-cols-4 gap-x-4 gap-y-7 border-y py-8 lg:grid-cols-8 lg:gap-x-6"
        >
          {(orgs ?? []).map((o) => (
            <Link
              key={o.id}
              href={`/organizations/${o.slug}`}
              title={o.name}
              aria-label={o.name}
              className="group flex min-w-0 flex-col items-center gap-3 rounded-sm text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <OrgMark
                short={o.short}
                accent={o.accent}
                size="lg"
                className="h-16 w-full max-w-[104px] transition-colors group-hover:border-[#154734]/40"
              />
              <span className="text-xs font-medium leading-4 text-muted-foreground group-hover:text-foreground">
                {o.short}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
