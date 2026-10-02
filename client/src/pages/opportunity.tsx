import {
  Fact,
  OfficialStatus,
  OrgMark,
  StatusPill,
  TriFacts,
  VisibilityPill,
} from "@/components/brand";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  daysUntil,
  fmtRange,
  relDay,
  useApp,
  useMe,
  type Busy,
  type Opp,
  type Prefs,
} from "@/lib/app";
import { downloadCalendar } from "@/lib/calendar";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CalendarPlus,
  Clock,
  ExternalLink,
  Flag,
  Info,
  MapPin,
  Pencil,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
const CAT_IMG: Record<string, string> = {
  Career: "./images/networking.jpg",
  "Info session": "./images/networking.jpg",
  Speaker: "./images/hero-atrium.jpg",
  Workshop: "./images/workshop.jpg",
  Competition: "./images/markets.jpg",
  Social: "./images/hero-atrium.jpg",
  Service: "./images/service.jpg",
  Recruiting: "./images/founders.jpg",
};
export function CorrectionDialog({ orgId, oppId }: { orgId: number; oppId?: number }) {
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const m = useMutation({
    mutationFn: async () =>
      (await apiRequest("POST", "/api/corrections", { orgId, oppId: oppId ?? null, note })).json(),
    onSuccess: () => {
      setOpen(false);
      setNote("");
      toast({
        title: "Example note saved",
        description: "Visible in this tab's workspace only. No message was sent.",
      });
    },
    onError: (e: Error) =>
      toast({ title: "Couldn't send", description: e.message, variant: "destructive" }),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          data-testid="button-flag"
        >
          <Flag className="mr-1.5 h-3.5 w-3.5" />
          Something out of date?
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Flag outdated information</DialogTitle>
          <DialogDescription>
            This example stays in the current tab. It does not notify the organization.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. The meeting moved to Wednesdays"
          rows={4}
          data-testid="input-correction"
        />
        <Button
          onClick={() => m.mutate()}
          disabled={note.trim().length < 5 || m.isPending}
          data-testid="button-submit-correction"
        >
          Send to editors
        </Button>
      </DialogContent>
    </Dialog>
  );
}
export default function OpportunityPage() {
  const { id } = useParams<{
    id: string;
  }>();
  const { userId } = useApp();
  const { data: me } = useMe();
  const { data: o, isLoading, error } = useQuery<Opp>({ queryKey: ["/api/opportunities", id] });
  const { data: busy } = useQuery<Busy[]>({ queryKey: ["/api/me/busy"], enabled: !!userId });
  const { data: prefs } = useQuery<Prefs | null>({
    queryKey: ["/api/me/preferences"],
    enabled: !!userId,
  });
  if (isLoading)
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="mt-6 h-40 rounded-2xl" />
      </div>
    );
  if (error || !o)
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-serif text-2xl font-semibold">This listing isn't available</h1>
        <p className="mt-2 text-muted-foreground">
          It may be private to members, or it was removed by the organization.
        </p>
        <Button asChild className="mt-6">
          <Link href="/discover">Back to Discover</Link>
        </Button>
      </div>
    );
  const rec = { reasons: [] as string[] };
  if (o.restricted)
    return (
      <div className="mx-auto max-w-3xl px-5 py-20">
        <Link href="/discover" className="text-sm underline">
          Back to Discover
        </Link>
        <h1 className="mt-8 font-serif text-4xl">Members-only activity</h1>
        <p className="mt-5 text-muted-foreground">
          {o.org.name} shares private event information through its own channels. Signing in here
          does not confirm club membership or unlock these details.
        </p>
        <Button asChild className="mt-6">
          <Link href={`/organizations/${o.org.slug}`}>Contact the organization</Link>
        </Button>
      </div>
    );
  const ext = o.externalUrl && !o.restricted;
  const img = CAT_IMG[o.category] ?? "./images/hero-atrium.jpg";
  return (
    <div>
      <div className="relative isolate overflow-hidden">
        <img src={img} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0c2c20]/95 via-[#0c2c20]/85 to-[#0c2c20]/50" />
        <div className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6">
          <Link
            href="/discover"
            className="inline-flex items-center gap-1 text-sm text-white/75 hover:text-white"
            data-testid="link-back"
          >
            <ArrowLeft className="h-4 w-4" />
            All opportunities
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#FFB81C] px-2.5 py-0.5 text-xs font-semibold text-[#10291f]">
              {o.kind === "recruitment" ? "Recruiting" : o.category}
            </span>
            <StatusPill o={o} />
            <VisibilityPill v={o.visibility} restricted={o.restricted} />
          </div>
          <h1
            className={`mt-3 max-w-3xl font-serif text-3xl font-semibold leading-tight text-white text-balance sm:text-4xl ${o.status === "canceled" ? "line-through decoration-2" : ""}`}
            data-testid="text-title"
          >
            {o.title}
          </h1>
          <Link
            href={`/organizations/${o.org.slug}`}
            className="mt-4 inline-flex items-center gap-2.5 text-white/90 hover:text-white"
            data-testid="link-org"
          >
            <OrgMark short={o.org.short} accent={o.org.accent} size="sm" />
            {o.org.name}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {o.status !== "scheduled" && o.changeNote && (
            <div
              className={`rounded-xl border p-4 ${o.status === "canceled" ? "border-destructive/30 bg-destructive/5" : "border-[#FFB81C]/50 bg-accent/50"}`}
              data-testid="text-change-note"
            >
              <div className="text-sm font-semibold">
                {o.status === "canceled" ? "This event was canceled" : "This event changed"}
              </div>
              <p className="mt-1 text-sm text-foreground/80">{o.changeNote}</p>
            </div>
          )}
          {o.restricted && (
            <div className="flex gap-3 rounded-xl border bg-secondary/50 p-4 text-sm">
              <Users className="h-5 w-5 shrink-0 text-primary dark:text-[#FFB81C]" />
              <div>
                <span className="font-semibold">A look inside membership.</span> Time and location
                are shared with members only. This preview exists so you can see what being part of{" "}
                {o.org.short} is like.
              </div>
            </div>
          )}
          <section>
            <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              What you'll gain
            </h2>
            <p className="mt-2 font-serif text-xl leading-snug" data-testid="text-gain">
              {o.gain}
            </p>
          </section>
          <section>
            <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              About
            </h2>
            <p className="mt-2 leading-relaxed text-foreground/85">{o.summary}</p>
          </section>
          <section className="rounded-xl border-l-4 border-[#FFB81C] bg-card p-5">
            <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Your next step
            </h2>
            <p className="mt-2 font-medium">{o.nextStep}</p>
          </section>
          {rec.reasons.length > 0 && (
            <section className="flex gap-2 rounded-xl bg-accent/60 p-4 text-sm text-accent-foreground">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <span className="font-semibold">Why this might fit you: </span>
                {rec.reasons.join(" · ")}
              </div>
            </section>
          )}
          {!o.restricted && o.kind === "event" && (
            <section>
              <h2 className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Official status (reported by the club)
              </h2>
              <OfficialStatus connect={o.connectStatus} room={o.roomStatus} />
              <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Listing an event on the hub doesn't approve it or reserve a room. Those happen
                through Baylor Connect and Foster's reservation process.
              </p>
            </section>
          )}
          <div className="flex flex-wrap items-center gap-2 border-t pt-5 text-xs text-muted-foreground">
            <span>Source: {o.source}</span>
            <span>·</span>
            <span>Updated {new Date(o.updatedAt).toLocaleDateString()}</span>
            {o.isSample ? (
              <>
                <span>·</span>
                <span className="rounded bg-secondary px-1.5 py-0.5">Sample content</span>
              </>
            ) : null}
            <span className="ml-auto">
              <CorrectionDialog orgId={o.orgId} oppId={o.id} />
            </span>
          </div>
        </div>

        <aside className="md:sticky md:top-24 md:self-start">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            {o.kind === "recruitment" && o.startsAt ? (
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Application deadline
                </div>
                <div className="mt-1 font-serif text-3xl font-semibold tabular">
                  {Math.max(0, daysUntil(o.startsAt))} days
                </div>
                <div className="text-sm text-muted-foreground">
                  {relDay(o.startsAt)} ·{" "}
                  {new Date(o.startsAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                {o.joinProcess && (
                  <div className="mt-3 text-sm">
                    <span className="text-muted-foreground">Process: </span>
                    {o.joinProcess}
                  </div>
                )}
              </div>
            ) : o.startsAt && o.endsAt ? (
              <div className="space-y-2.5">
                <Fact icon={Clock}>
                  <span className="text-sm">
                    <span className="font-semibold">{relDay(o.startsAt)}</span> ·{" "}
                    {fmtRange(o.startsAt, o.endsAt)}
                  </span>
                </Fact>
                {o.location && (
                  <Fact icon={MapPin}>
                    <span className="text-sm">{o.location}</span>
                  </Fact>
                )}
                <div className="flex flex-col gap-1.5 pt-1">
                  <TriFacts food={o.food} open={o.openToNonmembers} />
                </div>
                <div className="text-xs text-muted-foreground">
                  {o.years.length ? `Eligible: ${o.years.join(", ")}` : "All class years"}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Happens {o.approx}. Details are shared with members.
              </div>
            )}
            <div className="mt-5 flex flex-col gap-2">
              {ext && (
                <Button asChild className="w-full" data-testid="button-external">
                  <a href={o.externalUrl!} target="_blank" rel="noopener noreferrer">
                    {o.externalLabel ?? "Open official listing"}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
              {o.restricted && (
                <Button asChild className="w-full">
                  <Link href={`/organizations/${o.org.slug}`}>See how to join {o.org.short}</Link>
                </Button>
              )}
              {!o.restricted && o.kind === "event" && o.status !== "canceled" && (
                <Button
                  variant="outline"
                  className="w-full"
                  data-testid="button-ics"
                  onClick={() => downloadCalendar(o)}
                >
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Add to calendar (.ics)
                </Button>
              )}
              {o.canEdit && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/workspace" data-testid="link-edit">
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit in club workspace
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
