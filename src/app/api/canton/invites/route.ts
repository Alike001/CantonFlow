import { NextResponse } from "next/server";
import { z } from "zod";

import { getCantonConfig } from "@/lib/canton/config";
import { inviteLenderOnLedger } from "@/lib/canton/cantonflow-commands";

const inviteSchema = z.object({
  invoiceRequestContractId: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = inviteSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid invite payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await inviteLenderOnLedger(getCantonConfig(), parsed.data);
    return NextResponse.json({ status: "submitted", ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Canton submission failed" },
      { status: 502 },
    );
  }
}
