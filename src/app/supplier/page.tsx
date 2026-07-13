import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import InvoiceTable from "@/components/dashboard/InvoiceTable";
import RecentActivity from "@/components/dashboard/RecentActivity";
import LedgerProofPanel from "@/components/dashboard/LedgerProofPanel";
import {
  FileText,
  Wallet,
  HandCoins,
  BadgeCheck,
} from "lucide-react";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";

export default function SupplierPage() {
  return (
  <DashboardLayout>
    <div className="space-y-6">
      <PageHeader
        title="Supplier Dashboard"
        description="Monitor invoices, confidential bids, and settlement readiness from the supplier workspace."
      />

      <WelcomeBanner />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Uploaded invoices"
          value="24"
          subtitle="3 ready for bids"
          icon={FileText}
        />

        <StatCard
          title="Confidential bids"
          value="7"
          subtitle="Across active invoices"
          icon={HandCoins}
        />

        <StatCard
          title="Funds Raised"
          value="$1.25M"
          subtitle="Accepted financing"
          icon={Wallet}
        />

        <StatCard
          title="Settlement Rate"
          value="100%"
          subtitle="Completed workflows"
          icon={BadgeCheck}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">
              Recent Invoices
            </h3>
          </div>

          <InvoiceTable />
        </section>

        <div className="space-y-6">
          <LedgerProofPanel />
          <RecentActivity />
        </div>
      </div>
    </div>
  </DashboardLayout>
);
}
