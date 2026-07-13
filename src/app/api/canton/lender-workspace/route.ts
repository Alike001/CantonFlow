import { NextResponse } from "next/server";

import { getCantonConfig } from "@/lib/canton/config";
import { readRoleContracts } from "@/lib/canton/read-models";

export async function GET() {
  try {
    const contracts = await readRoleContracts(getCantonConfig("lender"), [
      "LenderInvite",
      "FundingBid",
      "FundingAgreement",
    ]);

    return NextResponse.json({ contracts });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Canton query failed" },
      { status: 502 },
    );
  }
}
