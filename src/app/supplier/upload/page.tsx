import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import UploadInvoiceForm from "@/components/dashboard/UploadInvoiceForm";

export default function UploadInvoicePage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Create Receivables RFQ"
        description="Create a confidential financing request from receivable data held in your existing system."
      />

      <UploadInvoiceForm />
    </DashboardLayout>
  );
}
