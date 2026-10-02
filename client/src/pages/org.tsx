import { OrgMark } from "@/components/brand";
import { OppCard } from "@/components/opp-card";
import { OrgPhotoPlaceholder } from "@/components/org-photo-placeholder";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { triLabel, useApp, useMe, type Busy, type Opp, type Org } from "@/lib/app";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Clock4, DoorOpen, ExternalLink, Pencil } from "lucide-react";
import { Link, useParams } from "wouter";
import { CorrectionDialog } from "./opportunity";
type OrgDetail = Org & {
  opportunities: Opp[];
  editors: {
    role: string;
    name: string;
  }[];
  canEdit: boolean;
  isMember: boolean;
};
export default function OrgPage() {
  const { slug } = useParams<{
    slug: string;
  }>();
  const { userId } = useApp();
  const { data: me } = useMe();
  const { toast } = useToast();
  const { data: o, isLoading } = useQuery<OrgDetail>({ queryKey: ["/api/orgs", slug] });
  const { data: busy } = useQuery<Busy[]>({ queryKey: ["/api/me/busy"], enabled: !!userId });
  if (isLoading || !o)
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  const now = new Date().toISOString();
  const events = o.opportunities.filter(
    (x) => x.kind === "event" && (x.restricted || (x.endsAt ?? "") >= now),
  );
  const recruiting = o.opportunities.filter(
    (x) => x.kind === "recruitment" && (x.startsAt ?? "") >= now,
  );
  const teasers = events.filter((x) => x.visibility !== "public");
  const publicEvents = events.filter((x) => x.visibility === "public");
  return (
    <div>
      <div className="border-b bg-gradient-to-b from-secondary/70 to-background">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6">
          <Link
            href="/organizations"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Directory
          </Link>
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-5">
              <OrgMark short={o.short} accent={o.accent} size="lg" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {o.type}
                </div>
                <h1
                  className="mt-1 font-serif text-3xl font-semibold tracking-tight sm:text-4xl"
                  data-testid="text-org-name"
                >
                  {o.name}
                </h1>
                <p className="mt-2 max-w-2xl text-lg text-muted-foreground">{o.tagline}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {o.size ? (
                    <a
                      href={o.sizeSource}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={o.sizeNote}
                      className="underline underline-offset-4"
                    >
                      {o.size}
                    </a>
                  ) : (
                    <span>Membership size not published</span>
                  )}
                  <span>·</span>
                  <a
                    href={o.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 underline underline-offset-4"
                  >
                    Official page <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {o.canEdit && (
                <Button asChild variant="outline">
                  <Link href="/workspace" data-testid="link-edit-org">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit profile
                  </Link>
                </Button>
              )}
              <Button asChild>
                <a href={o.website} target="_blank" rel="noopener noreferrer">
                  Visit organization <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-12">
          <OrgPhotoPlaceholder name={o.name} className="h-[340px] sm:h-[500px]" />
          <section>
            <h2 className="font-serif text-2xl font-semibold">About the organization</h2>
            <p className="mt-3 leading-relaxed text-foreground/85">{o.mission}</p>
            <a
              href={o.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground underline"
            >
              Organization information <ExternalLink className="h-3 w-3" />
            </a>
          </section>
          <section>
            <h2 className="font-serif text-2xl font-semibold">What you'd gain</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {o.benefits.map((b) => (
                <div key={b.label} className="rounded-xl border bg-card p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a6b00] dark:text-[#FFB81C]">
                    {b.horizon === "Now"
                      ? "This semester"
                      : b.horizon === "Next year"
                        ? "By next year"
                        : "For your career"}
                  </div>
                  <div className="mt-2 text-sm font-medium leading-snug">{b.label}</div>
                </div>
              ))}
            </div>
          </section>
          {teasers.length > 0 && (
            <section>
              <h2 className="font-serif text-2xl font-semibold">Inside {o.short}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The club shares details of its members-only activities through its own channels.
              </p>
              <div className="mt-4 grid gap-3">
                {teasers.map((x) => (
                  <OppCard key={x.id} o={x} busy={busy} />
                ))}
              </div>
            </section>
          )}
          <section>
            <h2 className="font-serif text-2xl font-semibold">Upcoming events</h2>
            <div className="mt-4 grid gap-3">
              {publicEvents.length ? (
                publicEvents.map((x) => <OppCard key={x.id} o={x} />)
              ) : (
                <p className="border-y py-6 text-sm text-muted-foreground">
                  No upcoming public events posted. Check the organization's own page for updates.
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <DoorOpen className="h-4 w-4 text-primary dark:text-[#FFB81C]" />
              How to join
            </h3>
            <div
              className="mt-3 inline-flex rounded-full bg-[#FFB81C] px-2.5 py-0.5 text-xs font-semibold text-[#10291f]"
              data-testid="text-join-process"
            >
              {o.joinProcess}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">{o.joinDetails}</p>
            <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Recruiting</dt>
                <dd className="text-right">{o.recruitingWindow ?? "Rolling / not specified"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">All majors</dt>
                <dd>{triLabel(o.openToAllMajors, "Yes", "Business majors")}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Meets</dt>
                <dd className="text-right">{o.meetingRhythm ?? "Not specified"}</dd>
              </div>
            </dl>
            {recruiting.map((r) => (
              <Link
                key={r.id}
                href={`/opportunity/${r.id}`}
                className="mt-4 flex items-center gap-3 rounded-lg bg-accent/70 p-3 text-sm text-accent-foreground"
                data-testid={`link-recruiting-${r.id}`}
              >
                <Clock4 className="h-4 w-4" />
                <span className="flex-1">
                  <span className="font-semibold">{r.title}</span>
                  <br />
                  Deadline{" "}
                  {new Date(r.startsAt!).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </Link>
            ))}
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <CalendarDays className="h-4 w-4 text-primary dark:text-[#FFB81C]" />
              Where else to find {o.short}
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href={o.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:underline"
                >
                  Organization's official page
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://baylor.campuslabs.com/engage/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:underline"
                >
                  Baylor Connect
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-card p-5 text-sm">
            <h3 className="font-semibold">Get in touch</h3>
            <ul className="mt-4 space-y-5">
              {o.contacts.length ? (
                o.contacts.map((c) => (
                  <li key={c.name}>
                    <div className="text-xs text-muted-foreground">{c.role}</div>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block font-medium underline underline-offset-4"
                    >
                      {c.name}
                    </a>
                    {c.email && (
                      <a
                        href={`mailto:${c.email}`}
                        className="mt-1 block break-all text-xs text-muted-foreground"
                      >
                        {c.email}
                      </a>
                    )}
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">
                  Contact the club through its{" "}
                  <a
                    href={o.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    official page
                  </a>
                  .
                </li>
              )}
            </ul>
            <p className="mt-4 text-[11px] text-muted-foreground">
              Contacts are listed by the organization. Roles may change each semester.
            </p>
            <div className="mt-2 -ml-3">
              <CorrectionDialog orgId={o.id} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
