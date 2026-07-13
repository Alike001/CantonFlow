"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  EyeOff,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type LedgerContract = {
  contractId: string;
  template: string;
  createdAt: string | null;
  payload: Record<string, unknown>;
};

type AgreementSubmission = {
  updateId?: string;
  completionOffset?: string | number;
  createdContractId?: string;
  error?: string;
};

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function formatAmount(value: unknown, currency = "USD") {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Not available";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SupplierMarketplace() {
  const [contracts, setContracts] = useState<LedgerContract[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null);
  const [submission, setSubmission] = useState<AgreementSubmission | null>(null);

  const bids = useMemo(
    () => contracts.filter((contract) => contract.template === "FundingBid"),
    [contracts],
  );
  const agreements = useMemo(
    () => contracts.filter((contract) => contract.template === "FundingAgreement"),
    [contracts],
  );

  async function loadWorkspace() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/canton/supplier-workspace", {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        contracts?: LedgerContract[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Could not load supplier workspace");
      }

      setContracts(payload.contracts || []);
    } catch (workspaceError) {
      setError(
        workspaceError instanceof Error
          ? workspaceError.message
          : "Could not load supplier workspace",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const initial = window.setTimeout(() => { void loadWorkspace(); }, 0);
    return () => window.clearTimeout(initial);
  }, []);

  async function acceptBid(bid: LedgerContract) {
    setAcceptingBidId(bid.contractId);
    setError("");
    setSubmission(null);

    try {
      const response = await fetch("/api/canton/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fundingBidContractId: bid.contractId,
          acceptedAt: new Date().toISOString(),
        }),
      });
      const payload = (await response.json()) as AgreementSubmission;

      if (!response.ok) {
        throw new Error(payload.error || "Ledger agreement submission failed");
      }

      setSubmission(payload);
      await loadWorkspace();
    } catch (acceptError) {
      setError(
        acceptError instanceof Error
          ? acceptError.message
          : "Ledger agreement submission failed",
      );
    } finally {
      setAcceptingBidId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => void loadWorkspace()} disabled={isLoading}>
          <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          Refresh ledger view
        </Button>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="break-words">{error}</p>
        </div>
      ) : null}

      {submission ? (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">FundingAgreement created on-ledger.</p>
            <p className="mt-1 text-emerald-800">The bid is consumed and the supplier and winning lender now share the agreement.</p>
            <p className="mt-2 break-all font-mono text-xs">{submission.createdContractId || "Contract lookup pending"}</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {isLoading ? (
            <Card className="rounded-lg border-slate-200 shadow-sm">
              <CardContent className="flex items-center gap-3 p-6 text-sm text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading private offers from Canton
              </CardContent>
            </Card>
          ) : bids.length === 0 ? (
            <Card className="rounded-lg border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <h2 className="font-semibold text-slate-950">No active lender bids</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This supplier party has no FundingBid contracts to review. Bids appear here only after a lender submits one on-ledger.
                </p>
              </CardContent>
            </Card>
          ) : (
            bids.map((bid) => {
              const payload = bid.payload;
              const currency = stringValue(payload.currency) || "USD";
              const isAccepting = acceptingBidId === bid.contractId;

              return (
                <Card key={bid.contractId} className="rounded-lg border-slate-200 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-semibold text-slate-950">{stringValue(payload.invoiceNumber)}</h2>
                          <Badge>Private bid</Badge>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">Visible only to this supplier and the issuing lender.</p>
                      </div>
                      <Button onClick={() => void acceptBid(bid)} disabled={isAccepting}>
                        {isAccepting ? <><Loader2 className="h-4 w-4 animate-spin" />Accepting</> : "Accept bid"}
                      </Button>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <Metric label="Advance" value={formatAmount(payload.advanceAmount, currency)} />
                      <Metric label="Discount rate" value={`${stringValue(payload.discountRate)}%`} />
                      <Metric label="Term" value={`${stringValue(payload.settlementDays)} days`} />
                    </div>

                    <div className="mt-4 rounded-lg border bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Private lender note</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{stringValue(payload.lenderNote)}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <aside className="space-y-4">
          <Card className="rounded-lg border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <h2 className="mt-4 font-semibold text-slate-950">Agreement status</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {agreements.length} active FundingAgreement{agreements.length === 1 ? "" : "s"} visible to this supplier party.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <EyeOff className="h-6 w-6 text-slate-600" />
              <h2 className="mt-4 font-semibold text-slate-950">Confidential bidding</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Competing lenders are not stakeholders in each other&apos;s FundingBid contracts, so they cannot read competing pricing from Canton.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value || "Not available"}</p>
    </div>
  );
}
