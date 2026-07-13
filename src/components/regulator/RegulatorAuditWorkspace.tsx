"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  EyeOff,
  FileSearch,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CantonEnvironmentBadge from "@/components/canton/CantonEnvironmentBadge";

type LedgerContract = {
  contractId: string;
  template: string;
  createdAt: string | null;
  payload: Record<string, unknown>;
};

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function stageLabel(stage: string) {
  return stage.replace(/^Audit/, "").replace(/([a-z])([A-Z])/g, "$1 $2");
}

export default function RegulatorAuditWorkspace() {
  const [events, setEvents] = useState<LedgerContract[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const bidEvents = useMemo(
    () => events.filter((event) => stringValue(event.payload.stage) === "AuditBidSubmitted"),
    [events],
  );
  const agreementEvents = useMemo(
    () => events.filter((event) => stringValue(event.payload.stage) === "AuditBidAccepted"),
    [events],
  );

  async function loadWorkspace() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/canton/regulator-workspace", {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        contracts?: LedgerContract[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Could not load regulator workspace");
      }

      setEvents(
        (payload.contracts || []).sort((left, right) =>
          (right.createdAt || "").localeCompare(left.createdAt || ""),
        ),
      );
    } catch (workspaceError) {
      setError(
        workspaceError instanceof Error
          ? workspaceError.message
          : "Could not load regulator workspace",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const initial = window.setTimeout(() => { void loadWorkspace(); }, 0);
    return () => window.clearTimeout(initial);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">Regulator workspace</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Lifecycle oversight without commercial terms</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              This workspace queries only WorkflowAuditEvent contracts visible to the configured regulator party.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => void loadWorkspace()} disabled={isLoading}>
              <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh
            </Button>
            <Button asChild variant="outline"><Link href="/sign-in">Switch workspace</Link></Button>
          </div>
        </div>

        <CantonEnvironmentBadge />

        {error ? (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="break-words">{error}</p>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Audit events" value={String(events.length)} />
          <Metric label="Bid events" value={String(bidEvents.length)} />
          <Metric label="Accepted agreements" value={String(agreementEvents.length)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <Card className="rounded-lg border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 p-3"><FileSearch className="h-5 w-5 text-slate-800" /></div>
                <div>
                  <h2 className="font-semibold text-slate-950">On-ledger audit events</h2>
                  <p className="text-sm text-slate-500">Metadata-only records from Canton</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {isLoading ? (
                  <div className="flex items-center gap-3 rounded-lg border bg-slate-50 p-4 text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading audit contracts</div>
                ) : events.length === 0 ? (
                  <div className="rounded-lg border bg-slate-50 p-4 text-sm leading-6 text-slate-500">No WorkflowAuditEvent contracts are visible to this regulator party.</div>
                ) : (
                  events.map((event) => (
                    <div key={event.contractId} className="rounded-lg border bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-950">{stageLabel(stringValue(event.payload.stage))}</p>
                            <p className="mt-1 text-sm text-slate-500">{stringValue(event.payload.invoiceNumber)}</p>
                          </div>
                        </div>
                        <Badge>On-ledger</Badge>
                      </div>
                      <dl className="mt-4 grid gap-2 border-t pt-4 text-xs sm:grid-cols-2">
                        <div><dt className="font-semibold uppercase tracking-wide text-slate-500">Occurred</dt><dd className="mt-1 font-mono text-slate-900">{stringValue(event.payload.occurredAt)}</dd></div>
                        <div><dt className="font-semibold uppercase tracking-wide text-slate-500">Contract</dt><dd className="mt-1 break-all font-mono text-slate-900">{event.contractId}</dd></div>
                      </dl>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <aside className="space-y-4">
            <Card className="rounded-lg border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                <h2 className="mt-4 font-semibold text-slate-950">Contract boundary</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Regulators observe WorkflowAuditEvent only. Commercial contracts do not list the regulator as a stakeholder.</p>
              </CardContent>
            </Card>
            <Card className="rounded-lg border-slate-200 shadow-sm">
              <CardContent className="space-y-4 p-5">
                <h2 className="font-semibold text-slate-950">Not visible here</h2>
                <RedactionRow label="Invoice amount and requested advance" />
                <RedactionRow label="Lender pricing and lender notes" />
                <RedactionRow label="Settlement reference and funding terms" />
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <Card className="rounded-lg border-slate-200 shadow-sm"><CardContent className="p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p></CardContent></Card>;
}

function RedactionRow({ label }: { label: string }) {
  return <div className="flex items-center gap-3 text-sm text-slate-600"><EyeOff className="h-4 w-4 text-slate-500" />{label}</div>;
}
