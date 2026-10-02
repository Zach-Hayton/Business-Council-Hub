import { Logo, OrgMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { type Opp } from "@/lib/app";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, Maximize2, Minimize2, UtensilsCrossed } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
const WACO_TZ = "America/Chicago";
function timeParts(iso: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: WACO_TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(new Date(iso));
  return {
    clock: `${parts.find((p) => p.type === "hour")?.value}:${parts.find((p) => p.type === "minute")?.value}`,
    period: parts.find((p) => p.type === "dayPeriod")?.value ?? "",
  };
}
function bucket(iso: string) {
  const h = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: WACO_TZ,
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date(iso)),
  );
  return h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening";
}
export function TodayBoard({ bare }: { bare?: boolean }) {
  const { data: items } = useQuery<Opp[]>({ queryKey: ["/api/today"], refetchInterval: 60000 });
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  const list = (items ?? []).filter((o) => o.endsAt! >= now.toISOString());
  const groups = ["Morning", "Afternoon", "Evening"]
    .map((g) => [g, list.filter((o) => bucket(o.startsAt!) === g)] as const)
    .filter(([, l]) => l.length);
  const publicSite = window.location.href.split("#")[0].split("?")[0];
  const hubUrl = publicSite + "#/discover";
  return (
    <div
      className={`relative overflow-hidden bg-[#082d21] text-[#f6f1e4] ${bare ? "min-h-screen" : "rounded-2xl"}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[#FFB81C]" />
      <div
        className={`relative p-5 sm:p-8 ${bare ? "mx-auto max-w-[1800px] lg:p-12 2xl:px-16 2xl:py-14" : "lg:p-10"}`}
      >
        <header className="flex flex-col gap-5 border-b border-white/15 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <Logo className="h-9 w-24" />
              <span className="border-l border-white/25 pl-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#FFB81C]">
                Today at Foster
              </span>
            </div>
            <h1
              className={`mt-6 font-serif font-semibold leading-none text-white ${bare ? "text-[clamp(2rem,4vw,4.5rem)]" : "text-[clamp(2rem,4vw,3.5rem)]"}`}
            >
              {now.toLocaleDateString("en-US", {
                timeZone: WACO_TZ,
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h1>
          </div>
          <div className="hidden items-center gap-2 text-sm text-white/55 sm:flex">
            <CalendarDays className="h-4 w-4" />
            Public events happening today
          </div>
        </header>
        <div
          className={`mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[minmax(0,1fr)_270px] ${bare ? "2xl:mt-10 2xl:grid-cols-[minmax(0,1fr)_320px] 2xl:gap-12" : ""}`}
        >
          <div className="space-y-8">
            {groups.length === 0 && (
              <p className="text-2xl text-white/70">
                No more public events today. Scan the code to plan the rest of your week.
              </p>
            )}
            {groups.map(([g, l]) => (
              <section key={g}>
                <h2 className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.22em] text-[#FFCF57]">
                  {g}
                </h2>
                <ul className="space-y-2">
                  {l.map((o) => {
                    const live = o.status !== "canceled" && o.startsAt! <= now.toISOString();
                    const start = timeParts(o.startsAt!);
                    const end = o.endsAt ? timeParts(o.endsAt) : null;
                    return (
                      <li
                        key={o.id}
                        className={`grid gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4 sm:grid-cols-[118px_minmax(0,1fr)] sm:items-center sm:p-5 ${bare ? "2xl:min-h-[150px] 2xl:grid-cols-[150px_minmax(0,1fr)] 2xl:gap-6 2xl:p-7" : ""}`}
                        data-testid={`row-today-${o.id}`}
                      >
                        <div className="border-b border-white/10 pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-5">
                          <div className="flex items-baseline gap-1 whitespace-nowrap text-[#FFB81C]">
                            <span
                              className={`font-serif text-2xl font-semibold tabular-nums sm:text-3xl ${bare ? "2xl:text-4xl" : ""}`}
                            >
                              {start.clock}
                            </span>
                            <span className="text-xs font-semibold">{start.period}</span>
                          </div>
                          <div className="mt-1 whitespace-nowrap text-[11px] uppercase tracking-[0.12em] text-white/45">
                            {end ? `until ${end.clock} ${end.period}` : ""}
                          </div>
                        </div>
                        <div className="min-w-0 sm:pl-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {live && (
                              <span className="rounded-full bg-[#FFB81C] px-2 py-0.5 text-xs font-bold uppercase text-[#0c2c20]">
                                Happening now
                              </span>
                            )}
                            {o.status === "changed" && (
                              <span className="rounded-full border border-[#FFB81C] px-2 py-0.5 text-xs font-semibold text-[#FFB81C]">
                                Updated
                              </span>
                            )}
                            {o.status === "canceled" && (
                              <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-200">
                                Canceled
                              </span>
                            )}
                          </div>
                          <div
                            className={`mt-1 text-xl font-semibold leading-tight text-white sm:text-2xl ${bare ? "2xl:text-3xl" : ""} ${o.status === "canceled" ? "line-through opacity-60" : ""}`}
                          >
                            {o.title}
                          </div>
                          <div
                            className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/65 ${bare ? "2xl:gap-x-5 2xl:text-base" : ""}`}
                          >
                            <span className="inline-flex min-w-0 items-center gap-2">
                              <OrgMark
                                short={o.org.short}
                                accent={o.org.accent}
                                size="sm"
                                className="h-7 w-10 p-1 text-[10px]"
                              />
                              <span className="truncate">{o.org.name}</span>
                            </span>
                            {o.location && (
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                {o.location}
                              </span>
                            )}
                            {o.food === "yes" && (
                              <span className="inline-flex items-center gap-1.5 text-[#FFD47A]">
                                <UtensilsCrossed className="h-3.5 w-3.5" />
                                Food provided
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
          <aside className="flex flex-col items-center gap-3 self-start rounded-xl bg-[#f7f2e7] p-5 text-center text-[#0c2c20] lg:sticky lg:top-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#154734]/65">
              More at Hankamer
            </div>
            <QRCodeSVG
              value={hubUrl}
              className={`h-auto w-full max-w-[190px] ${bare ? "2xl:max-w-[250px]" : ""}`}
              fgColor="#154734"
              bgColor="#f7f2e7"
              marginSize={2}
            />
            <div className="font-serif text-xl font-semibold leading-tight">
              Plan the rest of your week
            </div>
            <div className="text-xs leading-relaxed text-[#0c2c20]/65">
              {publicSite
                ? "Scan to browse upcoming events."
                : "Scan to open the hub, then choose Discover."}
            </div>
            {!bare && (
              <Link
                href="/discover"
                className="mt-1 text-sm font-semibold underline underline-offset-4"
              >
                Open Discover
              </Link>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
export default function Today() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-primary dark:text-[#FFB81C]">
            Around Foster
          </div>
          <h1 className="mt-1 font-serif text-3xl font-semibold">What's happening today</h1>
          <p className="mt-2 text-muted-foreground">Today's public events, all in one place.</p>
        </div>
        <Button asChild variant="outline" data-testid="button-screen-mode">
          <Link href="/screen">
            <Maximize2 className="mr-2 h-4 w-4" />
            Open screen mode
          </Link>
        </Button>
      </div>
      <TodayBoard />
    </div>
  );
}
export function ScreenMode() {
  return (
    <div className="relative">
      <TodayBoard bare />
      <Link
        href="/today"
        className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/20"
        data-testid="link-exit-screen"
      >
        <Minimize2 className="h-3.5 w-3.5" />
        Exit
      </Link>
    </div>
  );
}
