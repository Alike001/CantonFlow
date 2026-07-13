"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { invoiceSchema } from "@/lib/validations/invoice";

type FormState = {
  invoiceNumber: string;
  buyer: string;
  amount: string;
  currency: string;
  dueDate: string;
  requestedAmount: string;
  minimumRate: string;
};

type LedgerSubmission = {
  status?: string;
  updateId?: string;
  completionOffset?: string | number;
};

const initialFormState: FormState = {
  invoiceNumber: "INV-2026-004",
  buyer: "Northstar Components Ltd.",
  amount: "320000",
  currency: "USD",
  dueDate: "2026-08-30",
  requestedAmount: "256000",
  minimumRate: "4.5",
};

export default function UploadInvoiceForm() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submission, setSubmission] = useState<LedgerSubmission | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const financingRatio = useMemo(() => {
    const amount = Number(form.amount);
    const requested = Number(form.requestedAmount);

    if (!amount || !requested) return 0;

    return Math.round((requested / amount) * 100);
  }, [form.amount, form.requestedAmount]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
    setSubmission(null);
    setSubmitError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = invoiceSchema.safeParse(form);

    if (!result.success) {
      const nextErrors: Partial<Record<keyof FormState, string>> = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormState;
        nextErrors[field] = issue.message;
      });

      setErrors(nextErrors);
      setSubmission(null);
      setSubmitError(null);
      return;
    }

    setErrors({});
    setSubmission(null);
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/canton/invoice-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: `receivable-${result.data.invoiceNumber.toLowerCase()}`,
          invoiceNumber: result.data.invoiceNumber,
          buyerProfile: result.data.buyer,
          amount: result.data.amount.toFixed(1),
          currency: result.data.currency,
          dueDate: result.data.dueDate,
          requestedAdvance: result.data.requestedAmount.toFixed(1),
          minimumDiscountRate: result.data.minimumRate.toFixed(1),
          visibility: {
            buyerVisibleToLenders: false,
            invoicePdfVisibleToLenders: false,
            regulatorCanSeeCommercialTerms: false,
          },
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Invoice submission failed");
      }

      setSubmission(payload);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Invoice submission failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card className="rounded-lg border-slate-200 shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <h2 className="text-lg font-semibold">
                Invoice Details
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                This workflow validates the receivable and prepares it for a
                confidential lender RFQ.
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <FieldError message={errors.invoiceNumber}>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={form.invoiceNumber}
                    onChange={(event) => updateField("invoiceNumber", event.target.value)}
                    placeholder="INV-2026-004"
                  />
                </FieldError>

                <FieldError message={errors.buyer}>
                  <Label htmlFor="buyer">Buyer Name</Label>
                  <Input
                    id="buyer"
                    value={form.buyer}
                    onChange={(event) => updateField("buyer", event.target.value)}
                    placeholder="ABC Manufacturing Ltd."
                  />
                </FieldError>

                <FieldError message={errors.amount}>
                  <Label htmlFor="amount">Invoice Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    value={form.amount}
                    onChange={(event) => updateField("amount", event.target.value)}
                  />
                </FieldError>

                <FieldError message={errors.currency}>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={form.currency}
                    onChange={(event) => updateField("currency", event.target.value.toUpperCase())}
                    placeholder="USD"
                    maxLength={3}
                  />
                </FieldError>

                <FieldError message={errors.dueDate}>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={(event) => updateField("dueDate", event.target.value)}
                  />
                </FieldError>

                <FieldError message={errors.requestedAmount}>
                  <Label htmlFor="requestedAmount">Requested Financing</Label>
                  <Input
                    id="requestedAmount"
                    type="number"
                    min="1"
                    value={form.requestedAmount}
                    onChange={(event) => updateField("requestedAmount", event.target.value)}
                  />
                </FieldError>

                <FieldError message={errors.minimumRate}>
                  <Label htmlFor="minimumRate">Maximum Discount Rate (%)</Label>
                  <Input
                    id="minimumRate"
                    type="number"
                    min="1"
                    max="100"
                    step="0.1"
                    value={form.minimumRate}
                    onChange={(event) => updateField("minimumRate", event.target.value)}
                  />
                </FieldError>

                <div className="md:col-span-2">
                  <Label htmlFor="invoiceFile">
                    Upload Invoice (PDF)
                  </Label>

                  <Input id="invoiceFile" type="file" accept="application/pdf" className="mt-2" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-slate-700" />
                <div>
                  <p className="text-sm font-medium text-slate-950">
                    Financing request preview
                  </p>
                  <p className="text-sm text-slate-500">
                    {financingRatio}% advance requested against invoice value
                  </p>
                </div>
              </div>
            </div>

            {submission ? (
              <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium">
                    InvoiceRequest created on-ledger.
                  </p>
                  <p className="mt-1 text-emerald-800">
                    The supplier party created a CantonFlow invoice request for
                    confidential lender bidding.
                  </p>
                  <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                    <div>
                      <dt className="font-semibold uppercase tracking-wide text-emerald-700">
                        Update ID
                      </dt>
                      <dd className="mt-1 break-all font-mono text-emerald-950">
                        {submission.updateId || "Pending"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold uppercase tracking-wide text-emerald-700">
                        Offset
                      </dt>
                      <dd className="mt-1 font-mono text-emerald-950">
                        {submission.completionOffset || "Pending"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            ) : null}

            {submitError ? (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium">Ledger submission failed.</p>
                  <p className="mt-1 break-words text-red-800">
                    {submitError}
                  </p>
                </div>
              </div>
            ) : null}

            <Button className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting to ledger
                </>
              ) : (
                "Submit Invoice"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <aside className="space-y-4">
        <Card className="rounded-lg border-slate-200 shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <LockKeyhole className="h-5 w-5 text-slate-700" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">
                  Selective disclosure
                </h3>
                <p className="text-sm text-slate-500">
                  Buyer, invoice, and pricing details are scoped by role.
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Visible to lenders
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Credit tier, due date, requested advance, and anonymized buyer profile.
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Hidden until award
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Supplier identity, full invoice PDF, and competing lender bids.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-slate-200 shadow-sm">
          <CardContent className="flex items-start gap-3 p-5">
            <ShieldCheck className="mt-1 h-5 w-5 text-emerald-600" />
            <p className="text-sm leading-6 text-slate-600">
              This form submits through the app server to Canton JSON API
              routes, keeping ledger credentials out of the browser.
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function FieldError({
  children,
  message,
}: {
  children: React.ReactNode;
  message?: string;
}) {
  return (
    <div className="space-y-2">
      {children}

      {message ? (
        <p className="text-xs font-medium text-red-600">
          {message}
        </p>
      ) : null}
    </div>
  );
}
