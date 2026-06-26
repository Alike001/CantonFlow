import { z } from "zod";

export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(3, "Invoice number is required"),

  buyer: z.string().min(2, "Buyer name is required"),

  amount: z.coerce.number().positive(),

  currency: z.string(),

  dueDate: z.string(),

  requestedAmount: z.coerce.number().positive(),

  minimumRate: z.coerce.number().min(1).max(100),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;