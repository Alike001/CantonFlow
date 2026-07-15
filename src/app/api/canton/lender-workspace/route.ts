import { NextRequest, NextResponse } from "next/server";

import { getCantonConfig } from "@/lib/canton/config";
import { readRoleContracts } from "@/lib/canton/read-models";
import { authorizeCantonRole } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const localLender = request.nextUrl.searchParams.get("lender") === "lenderB" ? "lenderB" : "lenderA";
  const authorization = await authorizeCantonRole(["lenderA", "lenderB"], localLender);
  if ("response" in authorization) return authorization.response;
  const lender = authorization.role as "lenderA" | "lenderB";

  try {
    const contracts = await readRoleContracts(getCantonConfig(lender), [
      "LenderInvite",
      "FundingBid",
      "FundingAgreement",
      "SettlementProposal",
      "SettlementInstruction",
    ]);

    return NextResponse.json({ lender, contracts });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Canton query failed" },
      { status: 502 },
    );
  }
}
