import { CheckCircle2, Clock3, ShieldCheck } from "lucide-react";

const packageId =
  "d26e00e71f06ecd7dac3746c13f5d347ed0faae6e0fa0c6a9e385486a02b98c0";

const proofSteps = [
  {
    label: "InvoiceRequest",
    offset: "17",
    updateId: "122097e25256a541f06c27ce4da57babb80ef6eb48161c5cc5b8fa867df5b8ab16b5",
  },
  {
    label: "LenderInvite",
    offset: "20",
    updateId: "12200d4bb126c762a3b48197db2ab7e7aaf7a0458c13c264a95ec2aa2bce34036939",
  },
  {
    label: "FundingBid",
    offset: "23",
    updateId: "1220be6483f710f7d6dd1a88f22f9c3ab5de348dd3c393ef7fa76cc60d3d04743005",
  },
  {
    label: "FundingAgreement",
    offset: "26",
    updateId: "122079df4bcb87e3e14ae5dda290c3101a128c1ddf425c5f9950695c67d69fe84139",
  },
  {
    label: "SettlementInstruction",
    offset: "29",
    updateId: "12209626362a513904a03fee188d79ec1e8e3d1fec2b2d2254dd652cf25ab02e06e0",
  },
];

export default function LedgerProofPanel() {
  return (
    <aside className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Ledger proof
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">
            Local verified workflow
          </h3>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Verified
        </span>
      </div>

      <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-slate-600" />
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Package ID
            </p>
            <p className="mt-1 break-all font-mono text-xs leading-5 text-slate-800">
              {packageId}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {proofSteps.map((step) => (
          <div
            key={step.label}
            className="rounded-lg border border-slate-200 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <p className="truncate text-sm font-medium text-slate-950">
                  {step.label}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                #{step.offset}
              </span>
            </div>

            <p className="mt-2 line-clamp-1 break-all font-mono text-xs text-slate-500">
              {step.updateId}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          DevNet proof will replace these local update IDs after Seaport shared
          validator access is enabled.
        </p>
      </div>
    </aside>
  );
}
