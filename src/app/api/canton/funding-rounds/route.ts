import { NextResponse } from "next/server";
import { z } from "zod";

import { openFundingRoundOnLedger } from "@/lib/canton/cantonflow-commands";
import { getCantonConfig } from "@/lib/canton/config";

const fundingRoundSchema = z.object({
  invoiceRequestContractId: z.string().min(1),
  idempotencyKey: z.string().min(1).max(160).optional(),
});

export async function POST(request: Request) {
  const parsed = fundingRoundSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid funding round payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await openFundingRoundOnLedger(
      getCantonConfig("supplier"),
      parsed.data,
    );
    return NextResponse.json({ status: "submitted", ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Canton submission failed" },
      { status: 502 },
    );
  }
}
