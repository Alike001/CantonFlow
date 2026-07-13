import { NextResponse } from "next/server";
import { z } from "zod";

import { getCantonConfig } from "@/lib/canton/config";
import { createInvoiceRequestOnLedger } from "@/lib/canton/cantonflow-commands";

const invoiceRequestSchema = z.object({
  invoiceId: z.string().min(1),
  invoiceNumber: z.string().min(1),
  buyerProfile: z.string().min(1),
  amount: z.string().min(1),
  currency: z.string().min(3).max(8),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  requestedAdvance: z.string().min(1),
  minimumDiscountRate: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = invoiceRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid invoice request payload",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const result = await createInvoiceRequestOnLedger(
      getCantonConfig("supplier"),
      parsed.data,
    );

    return NextResponse.json({
      status: "submitted",
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Canton submission failed",
      },
      { status: 502 },
    );
  }
}
