import { mockInvoices } from "@/data/mockInvoices";
import StatusBadge from "./StatusBadge";

export default function InvoiceTable() {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-slate-50">
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-5 py-3">Invoice</th>
            <th className="px-5 py-3">Buyer</th>
            <th className="px-5 py-3">Amount</th>
            <th className="px-5 py-3">Due Date</th>
            <th className="px-5 py-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {mockInvoices.map((invoice) => (
            <tr
              key={invoice.id}
              className="border-t text-slate-700"
            >
              <td className="px-5 py-4 font-medium text-slate-950">
                {invoice.invoiceNumber}
              </td>

              <td className="px-5 py-4">
                {invoice.buyer}
              </td>

              <td className="px-5 py-4 font-medium">
                $
                {invoice.amount.toLocaleString()}
              </td>

              <td className="px-5 py-4">
                {invoice.dueDate}
              </td>

              <td className="px-5 py-4">
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
