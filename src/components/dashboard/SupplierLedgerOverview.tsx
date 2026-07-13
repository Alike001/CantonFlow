"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BadgeCheck, FileText, HandCoins, Loader2, RefreshCw, Wallet } from "lucide-react";

import InvoiceTable, { type InvoiceRow } from "@/components/dashboard/InvoiceTable";
import LedgerProofPanel from "@/components/dashboard/LedgerProofPanel";
import RecentActivity, { type ActivityRow } from "@/components/dashboard/RecentActivity";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";

type LedgerContract = {
  contractId: string;
  template: string;
  createdAt: string | null;
  payload: Record<string, unknown>;
};

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

export default function SupplierLedgerOverview() {
  const [contracts, setContracts] = useState<LedgerContract[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadWorkspace() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/canton/supplier-workspace", { cache: "no-store" });
      const payload = (await response.json()) as { contracts?: LedgerContract[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not load supplier workspace");
      setContracts(payload.contracts || []);
    } catch (workspaceError) {
      setError(workspaceError instanceof Error ? workspaceError.message : "Could not load supplier workspace");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const initial = window.setTimeout(() => { void loadWorkspace(); }, 0);
    return () => window.clearTimeout(initial);
  }, []);

  const invoices = useMemo<InvoiceRow[]>(() => contracts.filter((contract) => contract.template === "InvoiceRequest").map((contract) => ({
    contractId: contract.contractId,
    invoiceNumber: stringValue(contract.payload.invoiceNumber),
    buyerProfile: stringValue(contract.payload.buyerProfile),
    amount: Number(contract.payload.amount || 0).toLocaleString(),
    currency: stringValue(contract.payload.currency),
    dueDate: stringValue(contract.payload.dueDate),
    status: "Funding Open",
  })), [contracts]);
  const bids = useMemo(() => contracts.filter((contract) => contract.template === "FundingBid"), [contracts]);
  const agreements = useMemo(() => contracts.filter((contract) => contract.template === "FundingAgreement"), [contracts]);
  const settlements = useMemo(() => contracts.filter((contract) => contract.template === "SettlementInstruction"), [contracts]);
  const activities = useMemo<ActivityRow[]>(() => contracts.slice().sort((left, right) => (right.createdAt || "").localeCompare(left.createdAt || "")).slice(0, 4).map((contract) => ({
    id: contract.contractId,
    title: `${contract.template} active`,
    description: stringValue(contract.payload.invoiceNumber) || "CantonFlow workflow record",
    time: contract.createdAt || "On-ledger",
  })), [contracts]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end"><Button variant="outline" onClick={() => void loadWorkspace()} disabled={isLoading}><RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh ledger view</Button></div>
      {error ? <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><p className="break-words">{error}</p></div> : null}
      {isLoading ? <div className="flex items-center gap-3 rounded-lg border bg-white p-5 text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading supplier contracts</div> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Funding requests" value={String(invoices.length)} subtitle="Active InvoiceRequest contracts" icon={FileText} />
        <StatCard title="Private bids" value={String(bids.length)} subtitle="Visible to this supplier" icon={HandCoins} />
        <StatCard title="Accepted agreements" value={String(agreements.length)} subtitle="Commercial terms remain party-private" icon={Wallet} />
        <StatCard title="Settlement instructions" value={String(settlements.length)} subtitle="Coordination records only" icon={BadgeCheck} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="min-w-0"><h3 className="mb-4 text-lg font-semibold">Active invoice requests</h3><InvoiceTable invoices={invoices} /></section>
        <div className="space-y-6"><LedgerProofPanel /><RecentActivity activities={activities} /></div>
      </div>
    </div>
  );
}
