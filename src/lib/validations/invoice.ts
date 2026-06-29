import { z } from "zod";

export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(3, "Invoice number is required"),

  buyer: z.string().min(2, "Buyer name is required"),

  amount: z.coerce.number().positive("Invoice amount must be greater than zero"),

  currency: z.string().length(3, "Use a 3-letter currency code"),

  dueDate: z.string().min(1, "Due date is required"),

  requestedAmount: z.coerce.number().positive("Requested financing must be greater than zero"),

  minimumRate: z.coerce.number().min(1, "Rate must be at least 1%").max(100, "Rate must be below 100%"),
}).refine((invoice) => invoice.requestedAmount <= invoice.amount, {
  path: ["requestedAmount"],
  message: "Requested financing cannot exceed invoice amount",
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
