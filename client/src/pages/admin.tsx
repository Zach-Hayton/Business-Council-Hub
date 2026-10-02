import { OrgMark } from "@/components/brand";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { freshness, useMe } from "@/lib/app";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertTriangle, Flag, History, RotateCcw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { FreshDot } from "./organizations";
interface Overview {
  orgs: {
    id: number;
    slug: string;
    name: string;
    short: string;
    accent: string;
    lastReviewed: string;
    inFeedback: number;
    primaryEditor: string | null;
    backupEditor: string | null;
    upcoming: number;
  }[];
  totals: Record<string, number>;
  corrections: {
    id: number;
    orgName: string;
    note: string;
    status: string;
    at: string;
  }[];
  audit: {
    id: number;
    at: string;
    summary: string;
    orgName?: string;
  }[];
}
export default function Admin() {
  const { data: me } = useMe();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery<Overview>({
    queryKey: ["/api/admin/overview"],
    enabled: me?.role === "admin",
  });
  const reset = useMutation({
    mutationFn: async () => (await apiRequest("POST", "/api/admin/reset")).json(),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setOpen(false);
      toast({ title: "Sample data restored" });
    },
  });
  if (me?.role !== "admin")
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" />
        <h1 className="mt-4 font-serif text-2xl font-semibold">Admins only</h1>
        <p className="mt-2 text-muted-foreground">
          Choose “Council Admin” from the demo account menu.
        </p>
      </div>
    );
  if (isLoading || !data)
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  const stale = data.orgs.filter((o) => freshness(o.lastReviewed).level === "stale");
  const noBackup = data.orgs.filter((o) => !o.backupEditor);
  return (
    <div>
      <PageHeader
        eyebrow="Council admin"
        title="Platform health"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-reset">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset sample data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Restore sample data?</DialogTitle>
                <DialogDescription>
                  All edits made during the demo will be replaced with the original seeded content.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => reset.mutate()}
                  disabled={reset.isPending}
                  data-testid="button-confirm-reset"
                >
                  Restore
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        Freshness, ownership and corrections across every organization — the things that decide
        whether students trust what they see.
      </PageHeader>
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          {[
            ["Organizations", data.totals.orgs],
            ["Upcoming listings", data.totals.upcoming],
            ["Changed", data.totals.changed],
            ["Canceled", data.totals.canceled],
            ["Stale profiles", stale.length],
            ["Open corrections", data.corrections.filter((c) => c.status === "open").length],
          ].map(([l, n]) => (
            <div key={l as string} className="rounded-xl border bg-card p-4">
              <div className="text-xs text-muted-foreground">{l}</div>
              <div
                className="mt-1 font-serif text-3xl font-semibold tabular"
                data-testid={`stat-${String(l).toLowerCase().replace(/\s/g, "-")}`}
              >
                {n}
              </div>
            </div>
          ))}
        </div>

        {(stale.length > 0 || noBackup.length > 0) && (
          <div className="flex items-start gap-3 rounded-xl border border-[#FFB81C]/60 bg-accent/50 p-4 text-sm text-accent-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              {stale.length} profiles haven't been reviewed in over 120 days and {noBackup.length}{" "}
              organizations have no backup editor. Nudge them before the next semester handover.
            </div>
          </div>
        )}

        <section>
          <h2 className="font-sans text-lg font-semibold tracking-normal">Organizations</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border bg-card">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">Organization</th>
                  <th className="p-3">Freshness</th>
                  <th className="p-3">Primary editor</th>
                  <th className="p-3">Backup</th>
                  <th className="p-3 text-right">Upcoming</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.orgs
                  .sort((a, b) => a.lastReviewed.localeCompare(b.lastReviewed))
                  .map((o) => (
                    <tr key={o.id} data-testid={`row-admin-org-${o.slug}`}>
                      <td className="p-3">
                        <Link
                          href={`/organizations/${o.slug}`}
                          className="flex items-center gap-2.5 hover:underline"
                        >
                          <OrgMark short={o.short} accent={o.accent} size="sm" />
                          {o.name}
                          {o.inFeedback ? (
                            <span className="rounded bg-secondary px-1.5 text-[10px] uppercase text-secondary-foreground">
                              Consulted
                            </span>
                          ) : null}
                        </Link>
                      </td>
                      <td className="p-3">
                        <FreshDot lastReviewed={o.lastReviewed} />
                      </td>
                      <td className="p-3">
                        {o.primaryEditor ?? (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </td>
                      <td className="p-3">
                        {o.backupEditor ?? <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="p-3 text-right tabular">{o.upcoming}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Flag className="h-4 w-4" />
              Corrections queue
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {data.corrections.map((c) => (
                <li key={c.id} className="rounded-lg bg-secondary/40 p-3">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">{c.orgName}</span>
                    <span
                      className={
                        c.status === "open"
                          ? "text-xs font-semibold text-[#9a6b00] dark:text-[#FFB81C]"
                          : "text-xs text-muted-foreground"
                      }
                    >
                      {c.status}
                    </span>
                  </div>
                  <div className="mt-1 text-foreground/80">{c.note}</div>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <History className="h-4 w-4" />
              Change history
            </h2>
            <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto text-sm">
              {data.audit.map((a) => (
                <li key={a.id} className="flex justify-between gap-3">
                  <span>
                    {a.orgName ? <span className="font-medium">{a.orgName}: </span> : null}
                    {a.summary}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(a.at).toLocaleString("en-US", {
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
      </div>
    </div>
  );
}
