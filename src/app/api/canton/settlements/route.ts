import { NextResponse } from "next/server";
import { z } from "zod";

import { getCantonConfig } from "@/lib/canton/config";
import { proposeSettlementOnLedger } from "@/lib/canton/cantonflow-commands";
import { authorizeCantonRole } from "@/lib/auth/session";

const settlementSchema = z.object({
  fundingAgreementContractId: z.string().min(1),
  settlementReference: z.string().min(1),
  preparedAt: z.string().min(1),
  idempotencyKey: z.string().min(1).max(160).optional(),
});

export async function POST(request: Request) {
  const authorization = await authorizeCantonRole(["supplier"]);
  if ("response" in authorization) return authorization.response;

  const parsed = settlementSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid settlement payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await proposeSettlementOnLedger(getCantonConfig("supplier"), parsed.data);
    return NextResponse.json({ status: "submitted", ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Canton submission failed" },
      { status: 502 },
    );
  }
}
