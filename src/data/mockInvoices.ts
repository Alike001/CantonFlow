import { Invoice } from "@/types/invoice";

export const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2026-001",
    buyer: "ABC Manufacturing Ltd.",
    amount: 250000,
    currency: "USD",
    dueDate: "2026-07-25",
    status: "Funding Open",
  },
  {
    id: "2",
    invoiceNumber: "INV-2026-002",
    buyer: "Global Retail Group",
    amount: 180000,
    currency: "USD",
    dueDate: "2026-08-05",
    status: "Funded",
  },
  {
    id: "3",
    invoiceNumber: "INV-2026-003",
    buyer: "Prime Logistics",
    amount: 95000,
    currency: "USD",
    dueDate: "2026-08-12",
    status: "Settled",
  },
];