import { ShieldCheck } from "lucide-react";

import CantonEnvironmentBadge from "@/components/canton/CantonEnvironmentBadge";

export default function LedgerProofPanel() {
  return (
    <aside className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ledger connection</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">Role-scoped Canton view</h3>
        </div>
        <CantonEnvironmentBadge />
      </div>
      <div className="mt-5 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        Dashboard records are queried from the configured supplier party. The browser does not store contract IDs or proof states.
      </div>
    </aside>
  );
}
