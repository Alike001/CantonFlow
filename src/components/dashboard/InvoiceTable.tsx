import { mockInvoices } from "@/data/mockInvoices";
import StatusBadge from "./StatusBadge";

export default function InvoiceTable() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr className="text-left">
            <th className="px-6 py-4">Invoice</th>
            <th className="px-6 py-4">Buyer</th>
            <th className="px-6 py-4">Amount</th>
            <th className="px-6 py-4">Due Date</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>

        <tbody>
          {mockInvoices.map((invoice) => (
            <tr
              key={invoice.id}
              className="border-t"
            >
              <td className="px-6 py-4 font-medium">
                {invoice.invoiceNumber}
              </td>

              <td className="px-6 py-4">
                {invoice.buyer}
              </td>

              <td className="px-6 py-4">
                $
                {invoice.amount.toLocaleString()}
              </td>

              <td className="px-6 py-4">
                {invoice.dueDate}
              </td>

              <td className="px-6 py-4">
                <StatusBadge
                  status={invoice.status}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}