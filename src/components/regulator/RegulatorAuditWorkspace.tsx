"use client";

import type { ReactNode } from "react";
import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  EyeOff,
  FileSearch,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ACCEPTED_BID_STORAGE_KEY,
  DEMO_BIDS_STORAGE_KEY,
  FUNDING_AGREEMENT_PROOF_STORAGE_KEY,
  FUNDING_BID_PROOF_STORAGE_KEY,
  INVOICE_REQUEST_PROOF_STORAGE_KEY,
  LENDER_INVITE_PROOF_STORAGE_KEY,
  SETTLEMENT_PROOF_STORAGE_KEY,
  type ConfidentialBid,
} from "@/data/demoBids";

type LedgerProof = {
  updateId?: string;
  completionOffset?: string | number;
  createdContractId?: string;
  settlementReference?: string;
};

type AuditStep = {
  label: string;
  description: string;
  proof: LedgerProof | null;
};

type RegulatorSnapshot = {
  proofs: {
    invoice: LedgerProof | null;
    invite: LedgerProof | null;
    bid: LedgerProof | null;
    agreement: LedgerProof | null;
    settlement: LedgerProof | null;
  };
  acceptedBidId: string;
  bids: ConfidentialBid[];
};

const emptySnapshot: RegulatorSnapshot = {
  proofs: {
    invoice: null,
    invite: null,
    bid: null,
    agreement: null,
    settlement: null,
  },
  acceptedBidId: "",
  bids: [],
};

function readProof(key: string) {
  if (typeof window === "undefined") return null;

  const value = window.localStorage.getItem(key);
  if (!value) return null;

  try {
    return JSON.parse(value) as LedgerProof;
  } catch {
    return null;
  }
}

function readBids() {
  if (typeof window === "undefined") return [];

  const value = window.localStorage.getItem(DEMO_BIDS_STORAGE_KEY);
  if (!value) return [];

  try {
    return JSON.parse(value) as ConfidentialBid[];
  } catch {
    return [];
  }
}

function readRegulatorSnapshot() {
  if (typeof window === "undefined") {
    return JSON.stringify(emptySnapshot);
  }

  return JSON.stringify({
    proofs: {
      invoice: readProof(INVOICE_REQUEST_PROOF_STORAGE_KEY),
      invite: readProof(LENDER_INVITE_PROOF_STORAGE_KEY),
      bid: readProof(FUNDING_BID_PROOF_STORAGE_KEY),
      agreement: readProof(FUNDING_AGREEMENT_PROOF_STORAGE_KEY),
      settlement: readProof(SETTLEMENT_PROOF_STORAGE_KEY),
    },
    acceptedBidId: window.localStorage.getItem(ACCEPTED_BID_STORAGE_KEY) || "",
    bids: readBids(),
  } satisfies RegulatorSnapshot);
}

function subscribeToStorage(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export default function RegulatorAuditWorkspace() {
  const snapshot = useSyncExternalStore(
    subscribeToStorage,
    readRegulatorSnapshot,
    () => JSON.stringify(emptySnapshot),
  );
  const { proofs, acceptedBidId, bids } = useMemo(
    () => JSON.parse(snapshot) as RegulatorSnapshot,
    [snapshot],
  );

  const auditSteps = useMemo<AuditStep[]>(
    () => [
      {
        label: "Invoice request opened",
        description: "Supplier created an invoice financing request.",
        proof: proofs.invoice,
      },
      {
        label: "Lender selectively invited",
        description: "A lender received a scoped view of the opportunity.",
        proof: proofs.invite,
      },
      {
        label: "Private funding bid submitted",
        description: "Bid exists, but commercial terms are redacted here.",
        proof: proofs.bid,
      },
      {
        label: "Funding agreement accepted",
        description: "Supplier and winning lender share the agreement.",
        proof: proofs.agreement,
      },
      {
        label: "Settlement instruction prepared",
        description: "Settlement readiness is visible for oversight.",
        proof: proofs.settlement,
      },
    ],
    [proofs],
  );

  const completedSteps = auditSteps.filter((step) => step.proof).length;
  const ledgerBackedBidCount = bids.filter((bid) => bid.fundingBidContractId).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">
              Regulator workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Compliance metadata without commercial leakage
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Observers can verify workflow status and ledger evidence without
              seeing confidential lender pricing or invoice documents.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/sign-in">
              Switch role
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Lifecycle status" value={`${completedSteps}/5`} />
          <Metric label="Ledger-backed bids" value={String(ledgerBackedBidCount)} />
          <Metric label="Accepted offer" value={acceptedBidId ? "Recorded" : "Pending"} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <Card className="rounded-lg border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 p-3">
                  <FileSearch className="h-5 w-5 text-slate-800" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-950">
                    Workflow audit trail
                  </h2>
                  <p className="text-sm text-slate-500">
                    Ledger metadata visible to oversight participants
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {auditSteps.map((step) => (
                  <div key={step.label} className="rounded-lg border bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <CheckCircle2
                          className={
                            step.proof
                              ? "mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                              : "mt-0.5 h-5 w-5 shrink-0 text-slate-300"
                          }
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {step.label}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      <Badge variant={step.proof ? "default" : "secondary"}>
                        {step.proof ? "On-ledger" : "Pending"}
                      </Badge>
                    </div>

                    {step.proof ? (
                      <dl className="mt-4 grid gap-2 border-t pt-4 text-xs sm:grid-cols-2">
                        <div>
                          <dt className="font-semibold uppercase tracking-wide text-slate-500">
                            Update ID
                          </dt>
                          <dd className="mt-1 break-all font-mono text-slate-900">
                            {step.proof.updateId || "Unavailable"}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold uppercase tracking-wide text-slate-500">
                            Offset
                          </dt>
                          <dd className="mt-1 font-mono text-slate-900">
                            {step.proof.completionOffset || "Unavailable"}
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="font-semibold uppercase tracking-wide text-slate-500">
                            Contract ID
                          </dt>
                          <dd className="mt-1 break-all font-mono text-slate-900">
                            {step.proof.createdContractId || "Unavailable"}
                          </dd>
                        </div>
                      </dl>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <aside className="space-y-4">
            <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                <h2 className="mt-4 font-semibold text-slate-950">
                  Controlled visibility
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This page demonstrates why regulated finance needs Canton:
                  oversight can verify workflow state without public disclosure
                  of commercial terms.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-slate-200 shadow-sm">
              <CardContent className="space-y-4 p-5">
                <h2 className="font-semibold text-slate-950">
                  Redacted from regulator
                </h2>
                <RedactionRow icon={<EyeOff className="h-4 w-4" />} label="Competing lender bid pricing" />
                <RedactionRow icon={<LockKeyhole className="h-4 w-4" />} label="Full invoice document" />
                <RedactionRow icon={<EyeOff className="h-4 w-4" />} label="Private lender notes" />
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function RedactionRow({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-700">
      {icon}
      {label}
    </div>
  );
}
