import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import UploadInvoiceForm from "@/components/dashboard/UploadInvoiceForm";

export default function UploadInvoicePage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Upload Invoice"
        description="Submit a new invoice for confidential financing on CantonFlow."
      />

      <UploadInvoiceForm />
    </DashboardLayout>
  );
}