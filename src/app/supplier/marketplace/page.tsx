import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import SupplierMarketplace from "@/components/marketplace/SupplierMarketplace";

export default function MarketplacePage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Confidential Marketplace"
        description="Review private lender offers without exposing competing bids or sensitive invoice documents."
      />

      <SupplierMarketplace />
    </DashboardLayout>
  );
}
