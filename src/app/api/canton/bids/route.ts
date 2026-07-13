import { NextResponse } from "next/server";
import { z } from "zod";

import { getCantonConfig } from "@/lib/canton/config";
import { submitFundingBidOnLedger } from "@/lib/canton/cantonflow-commands";

const bidSchema = z.object({
  lenderInviteContractId: z.string().min(1),
  advanceAmount: z.string().min(1),
  discountRate: z.string().min(1),
  settlementDays: z.union([z.string().min(1), z.number().int().positive()]),
  lenderNote: z.string().min(1),
  submittedAt: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = bidSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid bid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await submitFundingBidOnLedger(getCantonConfig("lender"), parsed.data);
    return NextResponse.json({ status: "submitted", ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Canton submission failed" },
      { status: 502 },
    );
  }
}
