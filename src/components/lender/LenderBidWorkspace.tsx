"use client";

import type { ReactNode } from "react";
import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  EyeOff,
  Landmark,
  Loader2,
  LockKeyhole,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DEMO_BIDS_STORAGE_KEY,
  type ConfidentialBid,
  formatCurrency,
} from "@/data/demoBids";

const opportunities = [
  {
    invoice: "INV-2026-004",
    buyerProfile: "Investment-grade manufacturing buyer",
    advance: "$256,000",
    due: "2026-08-30",
  },
  {
    invoice: "INV-2026-001",
    buyerProfile: "Enterprise procurement counterparty",
    advance: "$190,000",
    due: "2026-07-25",
  },
];

const initialForm = {
  advance: "252000",
  rate: "4.9",
  term: "61",
  note: "Can settle quickly after invoice verification.",
  inviteContractId:
    "0083a7049273f33ad09f265395b932a16da4d6c65d5f53ba84f8a939c6f4e81723ca12122012414e486b4df66c0bf3fb0af2b0e218c144cab979c1e76f2e969150fff620a5",
};

type LedgerSubmission = {
  status?: string;
  updateId?: string;
  completionOffset?: string | number;
  createdContractId?: string;
  contractLookupWarning?: string;
};

export default function LenderBidWorkspace() {
  const [selectedInvoice, setSelectedInvoice] = useState(opportunities[0].invoice);
  const [form, setForm] = useState(initialForm);
  const [submittedBid, setSubmittedBid] = useState<ConfidentialBid | null>(() => {
    if (typeof window === "undefined") return null;

    const stored = window.localStorage.getItem(DEMO_BIDS_STORAGE_KEY);
    if (!stored) return null;

    const bids = JSON.parse(stored) as ConfidentialBid[];
    return bids.find((bid) => bid.source === "lender") || null;
  });
  const [error, setError] = useState("");
  const [ledgerError, setLedgerError] = useState("");
  const [ledgerSubmission, setLedgerSubmission] =
    useState<LedgerSubmission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
    setLedgerError("");
    setLedgerSubmission(null);
  }

  async function submitBid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!Number(form.advance) || !Number(form.rate) || !Number(form.term)) {
      setError("Advance, discount rate, and term must be valid numbers.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setLedgerError("");
    setLedgerSubmission(null);

    try {
      let ledgerPayload: LedgerSubmission | null = null;

      if (form.inviteContractId.trim()) {
        const response = await fetch("/api/canton/bids", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lenderInviteContractId: form.inviteContractId.trim(),
            advanceAmount: Number(form.advance).toFixed(1),
            discountRate: Number(form.rate).toFixed(1),
            settlementDays: Number(form.term),
            lenderNote: form.note,
            submittedAt: new Date().toISOString(),
          }),
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Ledger bid submission failed");
        }

        ledgerPayload = payload;
        setLedgerSubmission(payload);
      }

      const newBid: ConfidentialBid = {
        id: `lender-bid-${Date.now()}`,
        invoice: selectedInvoice,
        lender: "Atlas Private Credit",
        advance: formatCurrency(form.advance),
        rate: `${form.rate}%`,
        term: `${form.term} days`,
        note: form.note,
        submittedAt: new Date().toLocaleString(),
        source: "lender",
        fundingBidContractId: ledgerPayload?.createdContractId,
      };

      const stored = window.localStorage.getItem(DEMO_BIDS_STORAGE_KEY);
      const existing = stored ? (JSON.parse(stored) as ConfidentialBid[]) : [];
      const withoutPreviousLenderBid = existing.filter((bid) => bid.source !== "lender");

      window.localStorage.setItem(
        DEMO_BIDS_STORAGE_KEY,
        JSON.stringify([newBid, ...withoutPreviousLenderBid])
      );

      setSubmittedBid(newBid);
    } catch (submissionError) {
      setLedgerError(
        submissionError instanceof Error
          ? submissionError.message
          : "Ledger bid submission failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">
              Lender workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Submit confidential invoice financing bids
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Lenders can evaluate permitted deal fields and submit private
              terms without seeing competing lender offers.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/sign-in">
              Switch role
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {opportunities.map((opportunity) => (
              <Card
                key={opportunity.invoice}
                className="rounded-lg border-slate-200 shadow-sm"
              >
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">
                        {opportunity.invoice}
                      </h2>
                      <p className="mt-2 text-sm text-slate-500">
                        {opportunity.buyerProfile}
                      </p>
                    </div>

                    <Button
                      variant={selectedInvoice === opportunity.invoice ? "default" : "outline"}
                      onClick={() => setSelectedInvoice(opportunity.invoice)}
                    >
                      Bid on invoice
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Metric label="Requested advance" value={opportunity.advance} />
                    <Metric label="Due date" value={opportunity.due} />
                  </div>
                </CardContent>
              </Card>
            ))}

            {submittedBid ? (
              <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium">
                    Confidential bid submitted for {submittedBid.invoice}.
                  </p>
                  <p className="mt-1 text-emerald-800">
                    The supplier can now review this offer. Competing lenders
                    cannot see these terms.
                  </p>
                  {ledgerSubmission ? (
                    <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="font-semibold uppercase tracking-wide text-emerald-700">
                          Update ID
                        </dt>
                        <dd className="mt-1 break-all font-mono text-emerald-950">
                          {ledgerSubmission.updateId || "Pending"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold uppercase tracking-wide text-emerald-700">
                          Offset
                        </dt>
                        <dd className="mt-1 font-mono text-emerald-950">
                          {ledgerSubmission.completionOffset || "Pending"}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="font-semibold uppercase tracking-wide text-emerald-700">
                          FundingBid contract
                        </dt>
                        <dd className="mt-1 break-all font-mono text-emerald-950">
                          {ledgerSubmission.createdContractId || "Lookup pending"}
                        </dd>
                      </div>
                    </dl>
                  ) : null}
                  {ledgerSubmission?.contractLookupWarning ? (
                    <p className="mt-2 text-xs leading-5 text-emerald-800">
                      Bid was submitted, but the contract ID lookup did not
                      complete. Use the ledger proof query to retrieve the
                      FundingBid contract before accepting.
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <h2 className="text-lg font-semibold text-slate-950">
                  Private bid terms
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Terms are disclosed only to the supplier and this lender in
                  the CantonFlow workflow.
                </p>

                <form className="mt-5 space-y-4" onSubmit={submitBid}>
                  <div className="space-y-2">
                    <Label htmlFor="selectedInvoice">Invoice</Label>
                    <Input id="selectedInvoice" value={selectedInvoice} readOnly />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inviteContractId">
                      LenderInvite contract ID
                    </Label>
                    <Input
                      id="inviteContractId"
                      value={form.inviteContractId}
                      onChange={(event) =>
                        updateField("inviteContractId", event.target.value)
                      }
                    />
                    <p className="text-xs leading-5 text-slate-500">
                      Populated from the verified local ledger flow. Replace
                      this with the DevNet invite contract ID after deployment.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="space-y-2">
                      <Label htmlFor="advance">Advance amount</Label>
                      <Input
                        id="advance"
                        type="number"
                        min="1"
                        value={form.advance}
                        onChange={(event) => updateField("advance", event.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rate">Discount rate (%)</Label>
                      <Input
                        id="rate"
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={form.rate}
                        onChange={(event) => updateField("rate", event.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="term">Settlement days</Label>
                      <Input
                        id="term"
                        type="number"
                        min="1"
                        value={form.term}
                        onChange={(event) => updateField("term", event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Private note</Label>
                    <Textarea
                      id="note"
                      value={form.note}
                      onChange={(event) => updateField("note", event.target.value)}
                    />
                  </div>

                  {error ? (
                    <p className="text-sm font-medium text-red-600">
                      {error}
                    </p>
                  ) : null}

                  {ledgerError ? (
                    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <p className="break-words">
                        {ledgerError}
                      </p>
                    </div>
                  ) : null}

                  <Button className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting to ledger
                      </>
                    ) : (
                      "Submit confidential bid"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-slate-200 bg-slate-950 text-white shadow-sm">
              <CardContent className="space-y-5 p-5">
                <div className="w-fit rounded-lg bg-white/10 p-3">
                  <Landmark className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Lender privacy boundary
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    This view hides supplier identity, invoice PDF, and other
                    lenders&apos; bids until the workflow permits disclosure.
                  </p>
                </div>

                <div className="space-y-3 border-t border-white/10 pt-5">
                  <PrivacyLine icon={<LockKeyhole className="h-4 w-4" />} text="Bid terms remain private" />
                  <PrivacyLine icon={<EyeOff className="h-4 w-4" />} text="Competing offers are hidden" />
                </div>
              </CardContent>
            </Card>
          </div>
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
    <div className="rounded-lg border bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function PrivacyLine({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">
      {icon}
      {text}
    </div>
  );
}
