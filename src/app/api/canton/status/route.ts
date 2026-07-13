import { NextResponse } from "next/server";

import { getCantonConfig, getMissingCantonEnv } from "@/lib/canton/config";

function getEnvironmentLabel(url?: string) {
  if (!url) return "Not configured";

  if (
    url.includes("localhost") ||
    url.includes("127.0.0.1") ||
    url.includes("0.0.0.0")
  ) {
    return "Local Sandbox";
  }

  if (url.toLowerCase().includes("devnet")) {
    return "Canton DevNet";
  }

  return "External Validator";
}

export async function GET() {
  const missing = getMissingCantonEnv();
  const config = missing.length === 0 ? getCantonConfig() : null;

  return NextResponse.json({
    ready: missing.length === 0,
    environment: getEnvironmentLabel(config?.jsonLedgerApiUrl),
    jsonLedgerApiUrl: config?.jsonLedgerApiUrl || null,
    packageId: config?.packageId || null,
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
