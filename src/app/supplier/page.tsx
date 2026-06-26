import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import InvoiceTable from "@/components/dashboard/InvoiceTable";
import RecentActivity from "@/components/dashboard/RecentActivity";
import {
  FileText,
  Wallet,
  HandCoins,
  BadgeCheck,
} from "lucide-react";

export default function SupplierPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold">
            Supplier Dashboard
          </h2>

          <p className="mt-2 text-slate-500">
            Monitor invoices, funding requests and settlements.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Invoices"
            value="24"
            subtitle="Submitted"
            icon={FileText}
          />

          <StatCard
            title="Funding Requests"
            value="7"
            subtitle="Active"
            icon={HandCoins}
          />

          <StatCard
            title="Funds Raised"
            value="$1.25M"
            subtitle="Total"
            icon={Wallet}
          />

          <StatCard
            title="Settlement Rate"
            value="100%"
            subtitle="Completed"
            icon={BadgeCheck}
          />
        </div>

       <div>
            <h3 className="mb-4 text-xl font-semibold">
                Recent Invoices
            </h3>

            <InvoiceTable />
        </div>

        <RecentActivity />
      </div>
    </DashboardLayout>
  );
}