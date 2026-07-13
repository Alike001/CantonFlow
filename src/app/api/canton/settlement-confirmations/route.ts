import { NextResponse } from "next/server";
import { z } from "zod";

import { getCantonConfig } from "@/lib/canton/config";
import { confirmSettlementOnLedger } from "@/lib/canton/cantonflow-commands";

const confirmationSchema = z.object({
  settlementProposalContractId: z.string().min(1),
  confirmedAt: z.string().min(1),
  idempotencyKey: z.string().min(1).max(160).optional(),
});

export async function POST(request: Request) {
  const parsed = confirmationSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid settlement confirmation payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await confirmSettlementOnLedger(getCantonConfig("lender"), parsed.data);
    return NextResponse.json({ status: "submitted", ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Canton submission failed" },
      { status: 502 },
    );
  }
}
