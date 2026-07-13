import StatusBadge from "./StatusBadge";

export type InvoiceRow = {
  contractId: string;
  invoiceNumber: string;
  buyerProfile: string;
  amount: string;
  currency: string;
  dueDate: string;
  status: "Draft" | "Funding Open" | "Funded" | "Settled";
};

export default function InvoiceTable({ invoices }: { invoices: InvoiceRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-slate-50">
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-5 py-3">Invoice</th>
            <th className="px-5 py-3">Buyer profile</th>
            <th className="px-5 py-3">Amount</th>
            <th className="px-5 py-3">Due Date</th>
            <th className="px-5 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr className="border-t"><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No invoice requests are visible to this supplier party.</td></tr>
          ) : invoices.map((invoice) => (
            <tr key={invoice.contractId} className="border-t text-slate-700">
              <td className="px-5 py-4 font-medium text-slate-950">{invoice.invoiceNumber}</td>
              <td className="px-5 py-4">{invoice.buyerProfile}</td>
              <td className="px-5 py-4 font-medium">{invoice.amount} {invoice.currency}</td>
              <td className="px-5 py-4">{invoice.dueDate}</td>
              <td className="px-5 py-4"><StatusBadge status={invoice.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
