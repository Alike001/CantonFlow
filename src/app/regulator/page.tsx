import Link from "next/link";
import { CheckCircle2, FileSearch, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const events = [
  "Invoice financing request opened",
  "Three eligible lenders invited",
  "Private bid window active",
  "No sensitive bid terms disclosed to observer",
];

export default function RegulatorPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">
              Regulator workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Compliance metadata without commercial leakage
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Observers can verify workflow status and audit metadata without
              seeing confidential lender pricing or invoice documents.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/sign-in">
              Switch role
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
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
                    Metadata visible to oversight participants
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {events.map((event) => (
                  <div key={event} className="flex items-center gap-3 rounded-lg border bg-slate-50 p-4">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm text-slate-700">
                      {event}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <h2 className="mt-4 font-semibold text-slate-950">
                Controlled visibility
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                This page demonstrates why regulated finance needs Canton:
                oversight does not have to mean public disclosure of commercial
                terms.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
