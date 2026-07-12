export interface CantonConfig {
  applicationId: string;
  jsonLedgerApiUrl: string;
  ledgerApiToken: string;
  userId: string;
  packageId: string;
  parties: {
    supplier: string;
    buyer: string;
    regulator: string;
    lender: string;
  };
}

const REQUIRED_ENV = [
  "JSON_LEDGER_API_URL",
  "CANTONFLOW_PACKAGE_ID",
  "CANTONFLOW_SUPPLIER_PARTY",
  "CANTONFLOW_BUYER_PARTY",
  "CANTONFLOW_REGULATOR_PARTY",
  "CANTONFLOW_LENDER_PARTY",
] as const;

export function getMissingCantonEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

  if (
    !process.env.LEDGER_API_TOKEN &&
    process.env.CANTONFLOW_ALLOW_UNAUTHENTICATED_JSON_API !== "true"
  ) {
    missing.push("LEDGER_API_TOKEN" as (typeof REQUIRED_ENV)[number]);
  }

  return missing;
}

export function getCantonConfig(): CantonConfig {
  const missing = getMissingCantonEnv();

  if (missing.length > 0) {
    throw new Error(`Missing Canton environment: ${missing.join(", ")}`);
  }

  return {
    applicationId: process.env.CANTONFLOW_APPLICATION_ID || "cantonflow",
    jsonLedgerApiUrl: process.env.JSON_LEDGER_API_URL!,
    ledgerApiToken: process.env.LEDGER_API_TOKEN || "",
    userId: process.env.CANTONFLOW_USER_ID || "supplier",
    packageId: process.env.CANTONFLOW_PACKAGE_ID!,
    parties: {
      supplier: process.env.CANTONFLOW_SUPPLIER_PARTY!,
      buyer: process.env.CANTONFLOW_BUYER_PARTY!,
      regulator: process.env.CANTONFLOW_REGULATOR_PARTY!,
      lender: process.env.CANTONFLOW_LENDER_PARTY!,
    },
  };
}

export function cantonTemplateId(
  config: Pick<CantonConfig, "packageId">,
  template: string,
) {
  return `${config.packageId}:CantonFlow:${template}`;
}
