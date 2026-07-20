"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  EyeOff,
  Landmark,
  Loader2,
  LockKeyhole,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type LedgerContract = {
  contractId: string;
  template: string;
  createdAt: string | null;
  payload: Record<string, unknown>;
};

type LedgerSubmission = {
  updateId?: string;
  completionOffset?: string | number;
  createdContractId?: string;
};

const initialForm = {
  advance: "252000",
  rate: "4.9",
  term: "61",
  note: "Funding available after receivables review.",
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

export default function LenderBidWorkspace({ lender = "lenderA" }: { lender?: "lenderA" | "lenderB" }) {
  const [contracts, setContracts] = useState<LedgerContract[]>([]);
  const [selectedInviteId, setSelectedInviteId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submission, setSubmission] = useState<LedgerSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmingProposalId, setConfirmingProposalId] = useState<string | null>(null);
  const [settlementSubmission, setSettlementSubmission] = useState<LedgerSubmission | null>(null);
  const bidSubmissionKey = useRef<string | null>(null);
  const settlementKeys = useRef(new Map<string, string>());

  const invites = useMemo(
    () => contracts.filter((contract) => contract.template === "LenderInvite"),
    [contracts],
  );
  const submittedBids = useMemo(
    () => contracts.filter((contract) => contract.template === "FundingBid"),
    [contracts],
  );
  const settlementProposals = useMemo(
    () => contracts.filter((contract) => contract.template === "SettlementProposal"),
    [contracts],
  );
  const selectedInvite =
    invites.find((invite) => invite.contractId === selectedInviteId) || invites[0];

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/canton/lender-workspace?lender=${lender}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        contracts?: LedgerContract[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Could not load lender workspace");
      }

      const nextContracts = payload.contracts || [];
      setContracts(nextContracts);
      setSelectedInviteId((current) => {
        if (current && nextContracts.some((contract) => contract.contractId === current)) {
          return current;
        }

        return nextContracts.find((contract) => contract.template === "LenderInvite")?.contractId || "";
      });
    } catch (workspaceError) {
      setError(
        workspaceError instanceof Error
          ? workspaceError.message
          : "Could not load lender workspace",
      );
    } finally {
      setIsLoading(false);
    }
  }, [lender]);

  useEffect(() => {
    const initial = window.setTimeout(() => { void loadWorkspace(); }, 0);
    return () => window.clearTimeout(initial);
  }, [loadWorkspace]);

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSubmission(null);
    bidSubmissionKey.current = null;
  }

  async function submitBid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedInvite) {
      setError("There is no lender opportunity available on the configured ledger.");
      return;
    }

    if (!Number(form.advance) || !Number(form.rate) || !Number(form.term)) {
      setError("Advance, discount rate, and term must be valid numbers.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSubmission(null);
    const idempotencyKey = bidSubmissionKey.current || crypto.randomUUID();
    bidSubmissionKey.current = idempotencyKey;

    try {
      const response = await fetch("/api/canton/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lenderInviteContractId: selectedInvite.contractId,
          advanceAmount: Number(form.advance).toFixed(1),
          discountRate: Number(form.rate).toFixed(1),
          settlementDays: Number(form.term),
          lenderNote: form.note,
          submittedAt: new Date().toISOString(),
          lender,
          idempotencyKey,
        }),
      });
      const payload = (await response.json()) as LedgerSubmission & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Ledger bid submission failed");
      }

      setSubmission(payload);
      bidSubmissionKey.current = null;
      await loadWorkspace();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Ledger bid submission failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmSettlement(proposal: LedgerContract) {
    setConfirmingProposalId(proposal.contractId);
    setError("");
    setSettlementSubmission(null);
    const idempotencyKey = settlementKeys.current.get(proposal.contractId) || crypto.randomUUID();
    settlementKeys.current.set(proposal.contractId, idempotencyKey);

    try {
      const response = await fetch("/api/canton/settlement-confirmations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settlementProposalContractId: proposal.contractId,
          confirmedAt: new Date().toISOString(),
          lender,
          idempotencyKey,
        }),
      });
      const payload = (await response.json()) as LedgerSubmission & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Settlement confirmation failed");
      }

      setSettlementSubmission(payload);
      settlementKeys.current.delete(proposal.contractId);
      await loadWorkspace();
    } catch (confirmationError) {
      setError(
        confirmationError instanceof Error
          ? confirmationError.message
          : "Settlement confirmation failed",
      );
    } finally {
      setConfirmingProposalId(null);
    }
  }

  const invitePayload = selectedInvite?.payload;
  const currency = stringValue(invitePayload?.currency) || "USD";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">
              Lender workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              Submit confidential financing bids
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Opportunities below are active LenderInvite contracts visible to the
              configured lender party.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => void loadWorkspace()} disabled={isLoading}>
              <RefreshCw className={isLoading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Refresh
            </Button>
            <Button asChild variant="outline">
              <Link href="/sign-in">Switch workspace</Link>
            </Button>
          </div>
        </div>

        {error ? (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="break-words">{error}</p>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="space-y-4">
            {isLoading ? (
              <Card className="rounded-lg border-slate-200 shadow-sm">
                <CardContent className="flex items-center gap-3 p-6 text-sm text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading active lender contracts
                </CardContent>
              </Card>
            ) : invites.length === 0 ? (
              <Card className="rounded-lg border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="font-semibold text-slate-950">No active opportunities</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    A supplier must create a financing request and issue a LenderInvite
                    before this lender can submit a bid.
                  </p>
                </CardContent>
              </Card>
            ) : (
              invites.map((invite) => {
                const payload = invite.payload;
                const isSelected = invite.contractId === selectedInvite?.contractId;
                const inviteCurrency = stringValue(payload.currency) || "USD";

                return (
                  <button
                    key={invite.contractId}
                    type="button"
                    onClick={() => setSelectedInviteId(invite.contractId)}
                    className={`w-full rounded-lg border bg-white p-5 text-left shadow-sm transition ${
                      isSelected ? "border-violet-500 ring-1 ring-violet-200" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                          Active lender invite
                        </p>
                        <h2 className="mt-2 text-lg font-semibold text-slate-950">
                          {stringValue(payload.invoiceNumber)}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {stringValue(payload.buyerProfile)}
                        </p>
                      </div>
                      <Landmark className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <Metric label="Invoice value" value={formatAmount(payload.amount, inviteCurrency)} />
                      <Metric label="Requested advance" value={formatAmount(payload.requestedAdvance, inviteCurrency)} />
                      <Metric label="Due date" value={stringValue(payload.dueDate)} />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <Card className="h-fit rounded-lg border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-slate-100 p-2">
                  <LockKeyhole className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-950">Submit a private bid</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Only the lender and supplier receive the FundingBid contract.
                  </p>
                </div>
              </div>

              <form className="mt-6 space-y-5" onSubmit={submitBid}>
                <div>
                  <Label htmlFor="advance">Advance amount</Label>
                  <Input id="advance" type="number" min="1" value={form.advance} onChange={(event) => updateField("advance", event.target.value)} />
                </div>
                <div>
                  <Label htmlFor="rate">Discount rate (%)</Label>
                  <Input id="rate" type="number" min="0.1" step="0.1" value={form.rate} onChange={(event) => updateField("rate", event.target.value)} />
                </div>
                <div>
                  <Label htmlFor="term">Settlement days</Label>
                  <Input id="term" type="number" min="1" value={form.term} onChange={(event) => updateField("term", event.target.value)} />
                </div>
                <div>
                  <Label htmlFor="note">Lender note</Label>
                  <Textarea id="note" value={form.note} onChange={(event) => updateField("note", event.target.value)} />
                </div>
                <Button className="w-full" disabled={!selectedInvite || isSubmitting}>
                  {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting to ledger</> : "Submit confidential bid"}
                </Button>
              </form>

              {submission ? (
                <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <div className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0" /><div>
                    <p className="font-medium">FundingBid created on-ledger.</p>
                    <p className="mt-2 break-all font-mono text-xs">{submission.createdContractId || "Contract lookup pending"}</p>
                  </div></div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {!isLoading && submittedBids.length > 0 ? (
          <Card className="rounded-lg border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <h2 className="font-semibold text-slate-950">Your active bids</h2>
              <div className="mt-4 space-y-3">
                {submittedBids.map((bid) => (
                  <div key={bid.contractId} className="rounded-lg border bg-slate-50 p-4 text-sm">
                    <p className="font-medium text-slate-950">{stringValue(bid.payload.invoiceNumber)}</p>
                    <p className="mt-1 text-slate-500">
                      {formatAmount(bid.payload.advanceAmount, currency)} at {stringValue(bid.payload.discountRate)}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && settlementProposals.length > 0 ? (
          <Card className="rounded-lg border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <h2 className="font-semibold text-slate-950">Settlement approvals</h2>
              <p className="mt-1 text-sm text-slate-500">Confirm supplier proposals visible to this lender party.</p>
              <div className="mt-4 space-y-3">
                {settlementProposals.map((proposal) => {
                  const isConfirming = confirmingProposalId === proposal.contractId;
                  return (
                    <div key={proposal.contractId} className="flex flex-col gap-3 rounded-lg border bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-slate-950">{stringValue(proposal.payload.invoiceNumber)}</p>
                        <p className="mt-1 break-all text-xs text-slate-500">Reference: {stringValue(proposal.payload.settlementReference)}</p>
                      </div>
                      <Button size="sm" onClick={() => void confirmSettlement(proposal)} disabled={isConfirming}>
                        {isConfirming ? <><Loader2 className="h-4 w-4 animate-spin" />Confirming</> : "Confirm settlement"}
                      </Button>
                    </div>
                  );
                })}
              </div>
              {settlementSubmission ? (
                <div className="mt-4 flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-medium">SettlementInstruction created on-ledger.</p>
                    <p className="mt-1 break-all font-mono text-xs">{settlementSubmission.createdContractId || "Contract lookup pending"}</p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <EyeOff className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
          Other lenders are not stakeholders in your FundingBid, so they cannot query its terms from Canton.
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-950">{value || "Not available"}</p>
    </div>
  );
}
