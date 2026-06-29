import type { ReactNode } from "react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";

const offers = [
  {
    lender: "Institutional Lender A",
    advance: "$256,000",
    rate: "4.8%",
    term: "62 days",
    status: "Best offer",
  },
  {
    lender: "Private Credit Desk B",
    advance: "$248,000",
    rate: "5.1%",
    term: "60 days",
    status: "Eligible",
  },
  {
    lender: "Trade Finance Fund C",
    advance: "$240,000",
    rate: "5.4%",
    term: "65 days",
    status: "Eligible",
  },
];

export default function MarketplacePage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Confidential Marketplace"
        description="Review private lender offers without exposing competing bids or sensitive invoice documents."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {offers.map((offer) => (
            <Card key={offer.lender} className="rounded-lg border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold text-slate-950">
                        {offer.lender}
                      </h2>

                      <Badge variant={offer.status === "Best offer" ? "default" : "secondary"}>
                        {offer.status}
                      </Badge>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      Offer terms are visible to the supplier and issuing lender only.
                    </p>
                  </div>

                  <Button variant={offer.status === "Best offer" ? "default" : "outline"}>
                    Review Offer
                  </Button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Metric label="Advance" value={offer.advance} />
                  <Metric label="Discount rate" value={offer.rate} />
                  <Metric label="Term" value={offer.term} />
                </div>
              </CardContent>
            </Card>
          ))}
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
                  label="Awarded deal can settle atomically"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 bg-slate-950 text-white shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-emerald-300">
                Demo narration
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                This screen is the strongest Canton story: lenders compete, but
                commercially sensitive bids are disclosed only to the parties
                that need them.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </DashboardLayout>
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
