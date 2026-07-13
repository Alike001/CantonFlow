"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ACCEPTED_BID_STORAGE_KEY,
  DEMO_BIDS_STORAGE_KEY,
  FUNDING_AGREEMENT_STORAGE_KEY,
  SETTLEMENT_PROOF_STORAGE_KEY,
  type ConfidentialBid,
  seedBids,
} from "@/data/demoBids";

type AgreementSubmission = {
  status?: string;
  updateId?: string;
  completionOffset?: string | number;
  createdContractId?: string;
  contractLookupWarning?: string;
  error?: string;
};

type SettlementSubmission = AgreementSubmission & {
  settlementReference?: string;
};

export default function SupplierMarketplace() {
  const [storedBids] = useState<ConfidentialBid[]>(() => {
    if (typeof window === "undefined") return [];

    const stored = window.localStorage.getItem(DEMO_BIDS_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as ConfidentialBid[]) : [];
  });
  const [acceptedBidId, setAcceptedBidId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;

    return window.localStorage.getItem(ACCEPTED_BID_STORAGE_KEY);
  });
  const [agreementSubmission, setAgreementSubmission] =
    useState<AgreementSubmission | null>(null);
  const [settlementSubmission, setSettlementSubmission] =
    useState<SettlementSubmission | null>(() => {
      if (typeof window === "undefined") return null;

      const stored = window.localStorage.getItem(SETTLEMENT_PROOF_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as SettlementSubmission) : null;
    });
  const [fundingAgreementContractId, setFundingAgreementContractId] =
    useState<string>(() => {
      if (typeof window === "undefined") return "";

      return window.localStorage.getItem(FUNDING_AGREEMENT_STORAGE_KEY) || "";
    });
  const [ledgerError, setLedgerError] = useState("");
  const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null);
  const [preparingSettlementId, setPreparingSettlementId] = useState<string | null>(null);

  const offers = useMemo(() => {
    const storedIds = new Set(storedBids.map((bid) => bid.id));
    const fallbackBids = seedBids.filter((bid) => !storedIds.has(bid.id));

    return [...storedBids, ...fallbackBids];
  }, [storedBids]);

  async function acceptOffer(offer: ConfidentialBid) {
    setAcceptingBidId(offer.id);
    setLedgerError("");
    setAgreementSubmission(null);
    setSettlementSubmission(null);
    setFundingAgreementContractId("");
    window.localStorage.removeItem(FUNDING_AGREEMENT_STORAGE_KEY);
    window.localStorage.removeItem(SETTLEMENT_PROOF_STORAGE_KEY);

    try {
      if (offer.fundingBidContractId) {
        const response = await fetch("/api/canton/agreements", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fundingBidContractId: offer.fundingBidContractId,
            acceptedAt: new Date().toISOString(),
          }),
        });

        const payload = (await response.json()) as AgreementSubmission;

        if (!response.ok) {
          throw new Error(payload?.error || "Ledger agreement submission failed");
        }

        setAgreementSubmission(payload);

        if (payload.createdContractId) {
          window.localStorage.setItem(
            FUNDING_AGREEMENT_STORAGE_KEY,
            payload.createdContractId,
          );
          setFundingAgreementContractId(payload.createdContractId);
        }
      } else if (offer.source === "lender") {
        throw new Error(
          "This lender bid is missing a FundingBid contract ID. Submit the lender bid again, then accept the ledger-backed offer.",
        );
      }

      window.localStorage.setItem(ACCEPTED_BID_STORAGE_KEY, offer.id);
      setAcceptedBidId(offer.id);
    } catch (error) {
      setLedgerError(
        error instanceof Error
          ? error.message
          : "Ledger agreement submission failed",
      );
    } finally {
      setAcceptingBidId(null);
    }
  }

  async function prepareSettlement(offer: ConfidentialBid) {
    if (!fundingAgreementContractId) {
      setLedgerError(
        "This accepted offer is missing a FundingAgreement contract ID. Accept a ledger-backed bid before preparing settlement.",
      );
      return;
    }

    setPreparingSettlementId(offer.id);
    setLedgerError("");

    try {
      const settlementReference = `CF-SETTLE-${Date.now()}`;
      const response = await fetch("/api/canton/settlements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fundingAgreementContractId,
          settlementReference,
          preparedAt: new Date().toISOString(),
        }),
      });

      const payload = (await response.json()) as SettlementSubmission;

      if (!response.ok) {
        throw new Error(payload.error || "Ledger settlement submission failed");
      }

      const proof = {
        ...payload,
        settlementReference,
      };

      window.localStorage.setItem(SETTLEMENT_PROOF_STORAGE_KEY, JSON.stringify(proof));
      setSettlementSubmission(proof);
    } catch (error) {
      setLedgerError(
        error instanceof Error
          ? error.message
          : "Ledger settlement submission failed",
      );
    } finally {
      setPreparingSettlementId(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {offers.map((offer) => {
          const isAccepted = acceptedBidId === offer.id;
          const isLenderSubmitted = offer.source === "lender";
          const isAccepting = acceptingBidId === offer.id;
          const isPreparingSettlement = preparingSettlementId === offer.id;

          return (
            <Card key={offer.id} className="rounded-lg border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold text-slate-950">
                        {offer.lender}
                      </h2>

                      <Badge variant={isAccepted ? "default" : "secondary"}>
                        {isAccepted ? "Accepted" : isLenderSubmitted ? "New private bid" : "Eligible"}
                      </Badge>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      Offer for {offer.invoice}. Terms are visible only to the
                      supplier and issuing lender.
                    </p>
                  </div>

                  <Button
                    variant={isAccepted ? "secondary" : "default"}
                    disabled={isAccepted || isAccepting}
                    onClick={() => acceptOffer(offer)}
                  >
                    {isAccepting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Preparing agreement
                      </>
                    ) : isAccepted ? (
                      "Funding agreement prepared"
                    ) : (
                      "Accept offer"
                    )}
                  </Button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Metric label="Advance" value={offer.advance} />
                  <Metric label="Discount rate" value={offer.rate} />
                  <Metric label="Term" value={offer.term} />
                </div>

                <div className="mt-4 rounded-lg border bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Private lender note
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {offer.note}
                  </p>
                </div>

                {isAccepted ? (
                  <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        Funding agreement prepared.
                      </p>
                      <p className="mt-1 text-emerald-800">
                        {offer.fundingBidContractId
                          ? "A Canton FundingAgreement was created for this accepted offer."
                          : "Demo offer accepted locally. Ledger acceptance requires a FundingBid contract ID."}
                      </p>
                      {agreementSubmission && offer.fundingBidContractId ? (
                        <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                          <div>
                            <dt className="font-semibold uppercase tracking-wide text-emerald-700">
                              Update ID
                            </dt>
                            <dd className="mt-1 break-all font-mono text-emerald-950">
                              {agreementSubmission.updateId || "Pending"}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-semibold uppercase tracking-wide text-emerald-700">
                              Offset
                            </dt>
                            <dd className="mt-1 font-mono text-emerald-950">
                              {agreementSubmission.completionOffset || "Pending"}
                            </dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="font-semibold uppercase tracking-wide text-emerald-700">
                              FundingAgreement contract
                            </dt>
                            <dd className="mt-1 break-all font-mono text-emerald-950">
                              {agreementSubmission.createdContractId || "Lookup pending"}
                            </dd>
                          </div>
                        </dl>
                      ) : null}

                      {agreementSubmission?.contractLookupWarning ? (
                        <p className="mt-2 text-xs leading-5 text-emerald-800">
                          Agreement was submitted, but the contract ID lookup
                          did not complete. Query active contracts before
                          preparing settlement.
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button
                          size="sm"
                          disabled={
                            !offer.fundingBidContractId ||
                            !fundingAgreementContractId ||
                            Boolean(settlementSubmission) ||
                            isPreparingSettlement
                          }
                          onClick={() => prepareSettlement(offer)}
                        >
                          {isPreparingSettlement ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Preparing settlement
                            </>
                          ) : settlementSubmission ? (
                            "Settlement prepared"
                          ) : (
                            "Prepare settlement"
                          )}
                        </Button>

                        {!fundingAgreementContractId && offer.fundingBidContractId ? (
                          <p className="text-xs leading-5 text-emerald-800">
                            Agreement contract ID required before settlement.
                          </p>
                        ) : null}
                      </div>

                      {settlementSubmission ? (
                        <dl className="mt-4 grid gap-2 rounded-lg border border-emerald-200 bg-white/60 p-3 text-xs sm:grid-cols-2">
                          <div>
                            <dt className="font-semibold uppercase tracking-wide text-emerald-700">
                              Settlement reference
                            </dt>
                            <dd className="mt-1 break-all font-mono text-emerald-950">
                              {settlementSubmission.settlementReference}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-semibold uppercase tracking-wide text-emerald-700">
                              Offset
                            </dt>
                            <dd className="mt-1 font-mono text-emerald-950">
                              {settlementSubmission.completionOffset || "Pending"}
                            </dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="font-semibold uppercase tracking-wide text-emerald-700">
                              SettlementInstruction update
                            </dt>
                            <dd className="mt-1 break-all font-mono text-emerald-950">
                              {settlementSubmission.updateId || "Pending"}
                            </dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="font-semibold uppercase tracking-wide text-emerald-700">
                              SettlementInstruction contract
                            </dt>
                            <dd className="mt-1 break-all font-mono text-emerald-950">
                              {settlementSubmission.createdContractId || "Lookup pending"}
                            </dd>
                          </div>
                        </dl>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}

        {ledgerError ? (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="break-words">
              {ledgerError}
            </p>
          </div>
        ) : null}
      </div>

      <aside className="space-y-4">
        <Card className="rounded-lg border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <LockKeyhole className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <h3 className="font-semibold text-slate-950">
                  Privacy model
                </h3>
                <p className="text-sm text-slate-500">
                  Canton-style selective disclosure
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <PrivacyRow
                icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                label="Supplier sees all offers"
              />
              <PrivacyRow
                icon={<EyeOff className="h-4 w-4 text-slate-500" />}
                label="Lenders cannot see each other"
              />
              <PrivacyRow
                icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />}
                label="Accepted offer creates settlement-ready agreement"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-slate-200 bg-slate-950 text-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-emerald-300">
              Workflow narration
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              This workflow is the Canton story: lenders compete privately,
              the supplier can compare offers, and accepted terms can become a
              permissioned settlement workflow.
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
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

function PrivacyRow({
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
