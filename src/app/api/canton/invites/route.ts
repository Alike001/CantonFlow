import { NextResponse } from "next/server";
import { z } from "zod";

import { getCantonConfig } from "@/lib/canton/config";
import { inviteLenderOnLedger } from "@/lib/canton/cantonflow-commands";
import { authorizeCantonRole } from "@/lib/auth/session";

const inviteSchema = z.object({
  fundingRoundContractId: z.string().min(1),
  lender: z.enum(["lenderA", "lenderB"]),
  idempotencyKey: z.string().min(1).max(160).optional(),
});

export async function POST(request: Request) {
  const authorization = await authorizeCantonRole(["supplier"]);
  if ("response" in authorization) return authorization.response;

  const parsed = inviteSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid invite payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await inviteLenderOnLedger(getCantonConfig("supplier"), parsed.data);
    return NextResponse.json({ status: "submitted", ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Canton submission failed" },
      { status: 502 },
    );
  }
}
