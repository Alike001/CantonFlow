import { NextResponse } from "next/server";
import { z } from "zod";

import { getCantonConfig } from "@/lib/canton/config";
import { acceptFundingBidOnLedger } from "@/lib/canton/cantonflow-commands";
import { authorizeCantonRole } from "@/lib/auth/session";

const agreementSchema = z.object({
  fundingBidContractId: z.string().min(1),
  fundingRoundContractId: z.string().min(1),
  acceptedAt: z.string().min(1),
  idempotencyKey: z.string().min(1).max(160).optional(),
});

export async function POST(request: Request) {
  const authorization = await authorizeCantonRole(["supplier"]);
  if ("response" in authorization) return authorization.response;

  const parsed = agreementSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid agreement payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await acceptFundingBidOnLedger(getCantonConfig("supplier"), parsed.data);
    return NextResponse.json({ status: "submitted", ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Canton submission failed" },
      { status: 502 },
    );
  }
}
