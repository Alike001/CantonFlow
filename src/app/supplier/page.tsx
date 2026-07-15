import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import SupplierLedgerOverview from "@/components/dashboard/SupplierLedgerOverview";
import { requireWorkspaceRole } from "@/lib/auth/session";

export default async function SupplierPage() {
  await requireWorkspaceRole(["supplier"]);

  return (
  <DashboardLayout>
    <div className="space-y-6">
      <PageHeader
        title="Supplier Dashboard"
        description="Monitor invoices, confidential bids, and settlement readiness from the supplier workspace."
      />

      <WelcomeBanner />

      <SupplierLedgerOverview />
    </div>
  </DashboardLayout>
);
}
