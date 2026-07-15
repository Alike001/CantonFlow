import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import SupplierMarketplace from "@/components/marketplace/SupplierMarketplace";
import { requireWorkspaceRole } from "@/lib/auth/session";

export default async function MarketplacePage() {
  await requireWorkspaceRole(["supplier"]);

  return (
    <DashboardLayout>
      <PageHeader
        title="Confidential Marketplace"
        description="Review private lender offers without exposing competing bids or buyer legal identity."
      />

      <SupplierMarketplace />
    </DashboardLayout>
  );
}
