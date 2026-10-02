import { type Busy, daysUntil, fmtRange, type Opp, relDay } from "@/lib/app";
import { cn } from "@/lib/utils";
import { Clock, MapPin, Sparkles, Timer } from "lucide-react";
import { Link } from "wouter";
import { Fact, OrgMark, StatusPill, TriFacts, VisibilityPill } from "./brand";
export function DateBlock({ iso, approx }: { iso: string | null; approx?: string }) {
  if (!iso)
    return (
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
        <span className="text-[10px] uppercase tracking-wider">
          {approx?.split(" ")[0] ?? "TBA"}
        </span>
        <span className="text-sm font-semibold">{approx?.split(" ")[1]?.slice(0, 3) ?? ""}</span>
      </div>
    );
  const d = new Date(iso);
  return (
    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
        {d.toLocaleDateString("en-US", { month: "short" })}
      </span>
      <span className="font-serif text-2xl font-semibold leading-none tabular">{d.getDate()}</span>
      <span className="mt-0.5 text-[10px] uppercase tracking-wider opacity-80">
        {d.toLocaleDateString("en-US", { weekday: "short" })}
      </span>
    </div>
  );
}
export function OppCard({
  o,
  busy,
  reasons,
  dense,
}: {
  o: Opp;
  busy?: Busy[];
  reasons?: string[];
  dense?: boolean;
}) {
  const canceled = o.status === "canceled";
  return (
    <Link
      href={o.restricted ? `/organizations/${o.org.slug}` : `/opportunity/${o.id}`}
      data-testid={`card-opp-${o.id}`}
      className={cn(
        "group block min-w-0 rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_8px_30px_-12px_rgba(21,71,52,0.25)]",
        canceled && "opacity-75",
      )}
    >
      <div className="flex gap-4">
        {o.kind === "recruitment" && o.startsAt ? (
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-[#FFB81C] text-[#154734]">
            <Timer className="h-4 w-4" />
            <span className="mt-0.5 text-sm font-bold leading-none tabular">
              {Math.max(0, daysUntil(o.startsAt))}d
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider">to apply</span>
          </div>
        ) : (
          <DateBlock iso={o.startsAt} approx={o.approx} />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {o.kind === "recruitment" ? "Recruiting" : o.category}
            </span>
            <StatusPill o={o} />
            <VisibilityPill v={o.visibility} restricted={o.restricted} />
          </div>
          <h3
            className={cn(
              "mt-1 font-sans text-base font-semibold leading-snug tracking-normal group-hover:text-primary dark:group-hover:text-[#FFB81C]",
              canceled && "line-through decoration-1",
            )}
          >
            {o.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <OrgMark
              short={o.org.short}
              accent={o.org.accent}
              size="sm"
              className="h-5 w-5 rounded text-[8px]"
            />
            <span className="min-w-0 truncate">{o.org.name}</span>
          </div>
          {!dense && (
            <p className="mt-2 line-clamp-2 text-sm text-foreground/80">
              {o.restricted ? o.summary : o.gain}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {o.startsAt && o.endsAt && o.kind === "event" && (
              <Fact icon={Clock}>
                {relDay(o.startsAt)} · {fmtRange(o.startsAt, o.endsAt)}
              </Fact>
            )}
            {o.kind === "recruitment" && o.startsAt && (
              <Fact icon={Clock}>Deadline {relDay(o.startsAt)}</Fact>
            )}
            {o.location && <Fact icon={MapPin}>{o.location}</Fact>}
            {o.restricted && (
              <Fact icon={Clock} muted>
                Contact the club for details
              </Fact>
            )}
            {!o.restricted && o.kind === "event" && (
              <TriFacts food={o.food} open={o.openToNonmembers} />
            )}
          </div>
          {reasons && reasons.length > 0 && (
            <div className="mt-3 flex items-start gap-1.5 rounded-md bg-accent/60 px-2.5 py-1.5 text-xs text-accent-foreground">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                <span className="font-semibold">Why you're seeing this: </span>
                {reasons.join(" · ")}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
