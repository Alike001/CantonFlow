export type InvoiceStatus =
  | "Draft"
  | "Funding Open"
  | "Funded"
  | "Settled";

export interface Invoice {
  id: string;

  invoiceNumber: string;

  buyer: string;

  amount: number;

  currency: string;

  dueDate: string;

  status: InvoiceStatus;
}