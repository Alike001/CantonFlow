import { NextResponse } from "next/server";

import { getCantonConfig, getMissingCantonEnv } from "@/lib/canton/config";
import { getLedgerEnd } from "@/lib/canton/json-ledger-api";

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

  if (missing.length > 0) {
    return NextResponse.json({
      ready: false,
      configured: false,
      connected: false,
      environment: "Not configured",
      jsonLedgerApiUrl: null,
      packageId: null,
      missing,
      required: [
        "JSON_LEDGER_API_URL",
        "LEDGER_API_TOKEN or DEVNET_M2M_*",
        "CANTONFLOW_PACKAGE_ID",
        "CANTONFLOW_SUPPLIER_PARTY",
        "CANTONFLOW_BUYER_PARTY",
        "CANTONFLOW_REGULATOR_PARTY",
        "CANTONFLOW_LENDER_A_PARTY",
        "CANTONFLOW_LENDER_B_PARTY",
      ],
    });
  }

  const config = getCantonConfig();

  try {
    const ledgerEnd = await getLedgerEnd(config);

    return NextResponse.json({
      ready: true,
      configured: true,
      connected: true,
      environment: getEnvironmentLabel(config.jsonLedgerApiUrl),
      jsonLedgerApiUrl: config.jsonLedgerApiUrl,
      packageId: config.packageId,
      ledgerEnd,
      missing: [],
    });
  } catch (error) {
    return NextResponse.json({
      ready: false,
      configured: true,
      connected: false,
      environment: getEnvironmentLabel(config.jsonLedgerApiUrl),
      jsonLedgerApiUrl: config.jsonLedgerApiUrl,
      packageId: config.packageId,
      missing: [],
      error: error instanceof Error ? error.message : "Canton JSON API is unavailable",
    });
  }
}
