import type { Opp, Tri } from "@/lib/app";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Ban,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  EyeOff,
  Lock,
  Users,
  UtensilsCrossed,
} from "lucide-react";
export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <img
      src="./images/clubs/baylor-logo.svg"
      alt="Baylor University"
      className={cn("object-contain", className)}
    />
  );
}
export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-4">
      <img
        src="./images/clubs/baylor-print.svg"
        alt="Baylor University"
        className="h-9 w-[105px] object-contain dark:hidden sm:w-[125px]"
      />
      <img
        src="./images/clubs/baylor-logo.svg"
        alt="Baylor University"
        className="hidden h-9 w-[105px] object-contain dark:block sm:w-[125px]"
      />
      <span className="leading-none">
        <span className="block border-l pl-4 text-[13px] font-semibold tracking-normal sm:text-[15px]">
          Business Council
        </span>
        {!compact && (
          <span className="mt-1 block border-l pl-4 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Hankamer
          </span>
        )}
      </span>
    </span>
  );
}
export function OrgMark({
  short,
  accent,
  size = "md",
  className,
}: {
  short: string;
  accent: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims =
    size === "sm"
      ? "h-9 w-12 p-1.5 text-xs"
      : size === "lg"
        ? "h-16 w-24 p-3 text-xl"
        : "h-12 w-16 p-2 text-sm";
  return (
    <span
      aria-hidden
      data-club-mark={short}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded border border-[#154734]/15 bg-white font-bold leading-none tracking-[-0.02em] text-[#154734]",
        dims,
        className,
      )}
    >
      {short}
    </span>
  );
}
export function StatusPill({ o }: { o: Pick<Opp, "status" | "changeNote"> }) {
  if (o.status === "canceled")
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
        data-testid="status-canceled"
      >
        <Ban className="h-3 w-3" />
        Canceled
      </span>
    );
  if (o.status === "changed")
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground"
        data-testid="status-changed"
      >
        <AlertTriangle className="h-3 w-3" />
        Updated
      </span>
    );
  return null;
}
export function VisibilityPill({ v, restricted }: { v: Opp["visibility"]; restricted?: boolean }) {
  if (v === "public") return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
      <Lock className="h-3 w-3" />
      Members only
    </span>
  );
}
export function Fact({
  icon: Icon,
  children,
  muted,
}: {
  icon: any;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs",
        muted ? "text-muted-foreground" : "text-foreground/80",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {children}
    </span>
  );
}
export function TriFacts({ food, open }: { food: Tri; open: Tri }) {
  return (
    <>
      <Fact icon={UtensilsCrossed} muted={food !== "yes"}>
        {food === "yes" ? "Food provided" : food === "no" ? "No food" : "Food: not specified"}
      </Fact>
      <Fact icon={open === "no" ? EyeOff : Users} muted={open === "unknown"}>
        {open === "yes"
          ? "Open to non-members"
          : open === "no"
            ? "Members only"
            : "Audience: not specified"}
      </Fact>
    </>
  );
}
const CONNECT_LABEL: Record<string, string> = {
  not_started: "Not yet submitted",
  submitted: "Submitted (reported)",
  approved: "Approved (reported)",
};
const ROOM_LABEL: Record<string, string> = {
  not_needed: "No room needed",
  to_request: "Room still to request",
  requested: "Requested (reported)",
  confirmed: "Confirmed (reported)",
};
export function OfficialStatus({ connect, room }: { connect: string; room: string }) {
  if (connect === "hidden") return null;
  const cIcon =
    connect === "approved" ? CalendarCheck : connect === "submitted" ? CalendarClock : CalendarX;
  const rIcon =
    room === "confirmed" ? CalendarCheck : room === "requested" ? CalendarClock : CalendarX;
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <div className="rounded-lg border bg-card px-3 py-2.5">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Baylor Connect approval
        </div>
        <Fact icon={cIcon}>{CONNECT_LABEL[connect] ?? connect}</Fact>
      </div>
      <div className="rounded-lg border bg-card px-3 py-2.5">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Foster room
        </div>
        <Fact icon={rIcon}>{ROOM_LABEL[room] ?? room}</Fact>
      </div>
    </div>
  );
}
export { CONNECT_LABEL, ROOM_LABEL };
