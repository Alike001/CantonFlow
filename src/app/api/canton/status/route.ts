import { NextResponse } from "next/server";

import { getMissingCantonEnv } from "@/lib/canton/config";

export async function GET() {
  const missing = getMissingCantonEnv();

  return NextResponse.json({
    ready: missing.length === 0,
    missing,
    required: [
      "JSON_LEDGER_API_URL",
      "LEDGER_API_TOKEN",
      "CANTONFLOW_PACKAGE_ID",
      "CANTONFLOW_SUPPLIER_PARTY",
      "CANTONFLOW_BUYER_PARTY",
      "CANTONFLOW_REGULATOR_PARTY",
      "CANTONFLOW_LENDER_PARTY",
    ],
  });
}
