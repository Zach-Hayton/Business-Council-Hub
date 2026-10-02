import { OrgMark } from "@/components/brand";
import { PageHeader } from "@/components/layout";
import { OrgPhotoPlaceholder } from "@/components/org-photo-placeholder";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { type Org, freshness, triLabel } from "@/lib/app";
import { cn } from "@/lib/utils";
import { clubRank } from "@shared/clubs";
import { INTERESTS } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Columns3, ExternalLink, Search, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
export function FreshDot({ lastReviewed }: { lastReviewed: string }) {
  const f = freshness(lastReviewed);
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
      data-testid="text-freshness"
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          f.level === "fresh"
            ? "bg-emerald-500"
            : f.level === "aging"
              ? "bg-amber-500"
              : "bg-destructive",
        )}
      />
      {f.label}
    </span>
  );
}
export default function Organizations() {
  const { data: orgs, isLoading } = useQuery<Org[]>({ queryKey: ["/api/orgs"] });
  const [q, setQ] = useState("");
  const [interest, setInterest] = useState("any");
  const [join, setJoin] = useState("any");
  const [type, setType] = useState("any");
  const [compare, setCompare] = useState<number[]>([]);
  const [open, setOpen] = useState(false);
  const list = useMemo(
    () =>
      (orgs ?? [])
        .filter((o) => {
          const t = q.toLowerCase();
          if (
            t &&
            ![o.name, o.short, o.tagline, o.mission, ...o.interests]
              .join(" ")
              .toLowerCase()
              .includes(t)
          )
            return false;
          if (interest !== "any" && !o.interests.includes(interest)) return false;
          if (type !== "any" && o.type !== type) return false;
          if (join === "open" && o.joinProcess !== "Open") return false;
          if (join === "apply" && !/Application/.test(o.joinProcess)) return false;
          if (join === "selective" && !/Interview|Selective/.test(o.joinProcess)) return false;
          return true;
        })
        .sort((a, b) => clubRank(a.slug) - clubRank(b.slug)),
    [orgs, q, interest, join, type],
  );
  const toggle = (id: number) =>
    setCompare((c) =>
      c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id],
    );
  const chosen = (orgs ?? []).filter((o) => compare.includes(o.id));
  return (
    <div>
      <PageHeader eyebrow="The organizations" title="Find your people at Hankamer.">
        Consulting teams. Student founders. Future leaders in finance, marketing and beyond.
      </PageHeader>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-3 md:grid-cols-[1fr_200px_200px_200px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search organizations"
              className="h-11 pl-9"
              data-testid="input-org-search"
            />
          </div>
          <Select value={interest} onValueChange={setInterest}>
            <SelectTrigger className="h-11" data-testid="select-org-interest">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All interests</SelectItem>
              {INTERESTS.map((i) => (
                <SelectItem key={i} value={i}>
                  {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={join} onValueChange={setJoin}>
            <SelectTrigger className="h-11" data-testid="select-org-join">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any joining process</SelectItem>
              <SelectItem value="open">Open — just show up</SelectItem>
              <SelectItem value="apply">Application required</SelectItem>
              <SelectItem value="selective">Interview or selective</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-11" data-testid="select-org-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All types</SelectItem>
              <SelectItem value="Professional organization">Professional organizations</SelectItem>
              <SelectItem value="Cooperative program">Cooperative programs</SelectItem>
              <SelectItem value="Accelerator">Accelerators</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">
          {list.length} Business Council organizations
        </div>

        <div className="mt-6 divide-y border-y">
          {!isLoading && list.length === 0 && (
            <div className="py-16 text-center">
              <h2 className="font-serif text-2xl">No organizations match yet</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Try another search or reset your filters.
              </p>
              <Button
                variant="outline"
                className="mt-5"
                onClick={() => {
                  setQ("");
                  setInterest("any");
                  setJoin("any");
                  setType("any");
                }}
              >
                Reset filters
              </Button>
            </div>
          )}
          {isLoading &&
            Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          {list.map((o) => (
            <article
              key={o.id}
              className="grid gap-7 py-10 md:grid-cols-[minmax(220px,.75fr)_1.25fr] lg:gap-12"
              data-testid={`card-org-${o.slug}`}
            >
              <Link
                href={`/organizations/${o.slug}`}
                className="relative block h-[300px] overflow-hidden bg-secondary sm:h-[350px]"
              >
                <OrgPhotoPlaceholder name={o.name} />
              </Link>
              <div className="min-w-0 self-center">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 text-xs uppercase tracking-[.14em] text-muted-foreground">
                      {o.interests.slice(0, 2).join(" · ")}
                    </div>
                    <Link
                      href={`/organizations/${o.slug}`}
                      className="font-serif text-3xl leading-tight hover:underline"
                      data-testid={`link-org-${o.slug}`}
                    >
                      {o.name}
                    </Link>
                  </div>
                  <button
                    onClick={() => toggle(o.id)}
                    aria-pressed={compare.includes(o.id)}
                    aria-label={`Compare ${o.name}`}
                    data-testid={`button-compare-${o.slug}`}
                    className={cn(
                      "relative z-10 flex h-7 w-7 items-center justify-center rounded-md border text-xs transition",
                      compare.includes(o.id)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:border-primary/50",
                    )}
                  >
                    {compare.includes(o.id) ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Columns3 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {o.mission}
                </p>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {o.size ? (
                      <a
                        href={o.sizeSource}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={o.sizeNote}
                        className="underline decoration-border underline-offset-4"
                      >
                        {o.size}
                      </a>
                    ) : (
                      "Size not published"
                    )}
                  </span>
                  <span>{o.joinProcess}</span>
                </div>
                {o.sizeNote && (
                  <p className="mt-2 text-[11px] text-muted-foreground">{o.sizeNote}</p>
                )}
                <div className="mt-5 border-t pt-4 text-sm">
                  {o.contacts.length ? (
                    <>
                      <span className="text-muted-foreground">{o.contacts[0].role}: </span>
                      <a
                        href={
                          o.contacts[0].email ? `mailto:${o.contacts[0].email}` : o.contacts[0].url
                        }
                        className="underline underline-offset-4"
                      >
                        {o.contacts[0].name}
                      </a>
                    </>
                  ) : (
                    <a
                      href={o.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground underline underline-offset-4"
                    >
                      Contact the organization through its official page
                    </a>
                  )}
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-6">
                  <Link
                    href={`/organizations/${o.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold"
                  >
                    Meet the organization <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href={o.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                  >
                    Official page <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {compare.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-fit max-w-[calc(100%-24px)] items-center gap-2 rounded-full border bg-card px-3 py-2 shadow-xl">
          <div className="hidden items-center gap-2 sm:flex">
            {chosen.map((o) => (
              <OrgMark key={o.id} short={o.short} accent={o.accent} size="sm" />
            ))}
          </div>
          <span className="text-sm">{compare.length} selected</span>
          <Button
            size="sm"
            disabled={compare.length < 2}
            onClick={() => setOpen(true)}
            data-testid="button-open-compare"
          >
            Compare
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setCompare([])} aria-label="Clear">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              Compare membership experiences
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr>
                  <th className="w-36" />
                  {chosen.map((o) => (
                    <th key={o.id} className="p-3 text-left align-top">
                      <OrgMark short={o.short} accent={o.accent} size="sm" />
                      <div className="mt-2 font-semibold">{o.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {(
                  [
                    ["About", (o: Org) => o.mission],
                    [
                      "Membership size",
                      (o: Org) => (
                        <>
                          {o.size ?? "Not published"}
                          {o.sizeNote && (
                            <div className="mt-1 text-xs text-muted-foreground">{o.sizeNote}</div>
                          )}
                        </>
                      ),
                    ],
                    [
                      "What you'd gain",
                      (o: Org) => (
                        <ul className="space-y-1">
                          {o.benefits.map((b) => (
                            <li key={b.label}>
                              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                                {b.horizon}
                              </span>{" "}
                              {b.label}
                            </li>
                          ))}
                        </ul>
                      ),
                    ],
                    [
                      "How to join",
                      (o: Org) => (
                        <>
                          <div className="font-medium">{o.joinProcess}</div>
                          <div className="text-muted-foreground">{o.joinDetails}</div>
                        </>
                      ),
                    ],
                    [
                      "Recruiting window",
                      (o: Org) => o.recruitingWindow ?? "Rolling / not specified",
                    ],
                    [
                      "All majors?",
                      (o: Org) => triLabel(o.openToAllMajors, "Yes", "Business majors"),
                    ],
                    ["Meets", (o: Org) => o.meetingRhythm ?? "Not specified"],
                  ] as [string, (o: Org) => React.ReactNode][]
                ).map(([label, fn]) => (
                  <tr key={label}>
                    <th className="p-3 text-left align-top text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {label}
                    </th>
                    {chosen.map((o) => (
                      <td key={o.id} className="p-3 align-top">
                        {fn(o)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
