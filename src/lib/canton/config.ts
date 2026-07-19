export interface CantonConfig {
  applicationId: string;
  jsonLedgerApiUrl: string;
  ledgerApiToken: string;
  userId: string;
  packageId: string;
  packageName?: string;
  parties: {
    supplier: string;
    buyer: string;
    regulator: string;
    lenderA: string;
    lenderB: string;
  };
}

export type CantonRole = "supplier" | "buyer" | "regulator" | "lenderA" | "lenderB";

const REQUIRED_ENV = [
  "JSON_LEDGER_API_URL",
  "CANTONFLOW_PACKAGE_ID",
  "CANTONFLOW_SUPPLIER_PARTY",
  "CANTONFLOW_BUYER_PARTY",
  "CANTONFLOW_REGULATOR_PARTY",
  "CANTONFLOW_LENDER_A_PARTY",
  "CANTONFLOW_LENDER_B_PARTY",
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

function getUserId(role: CantonRole) {
  const roleKey = {
    supplier: "CANTONFLOW_SUPPLIER_USER_ID",
    buyer: "CANTONFLOW_BUYER_USER_ID",
    regulator: "CANTONFLOW_REGULATOR_USER_ID",
    lenderA: "CANTONFLOW_LENDER_A_USER_ID",
    lenderB: "CANTONFLOW_LENDER_B_USER_ID",
  }[role];
  return process.env[roleKey] || process.env.CANTONFLOW_USER_ID || role;
}

export function getCantonConfig(role: CantonRole = "supplier"): CantonConfig {
  const missing = getMissingCantonEnv();

  if (missing.length > 0) {
    throw new Error(`Missing Canton environment: ${missing.join(", ")}`);
  }

  return {
    applicationId: process.env.CANTONFLOW_APPLICATION_ID || "cantonflow",
    jsonLedgerApiUrl: process.env.JSON_LEDGER_API_URL!,
    ledgerApiToken: process.env.LEDGER_API_TOKEN || "",
    userId: getUserId(role),
    packageId: process.env.CANTONFLOW_PACKAGE_ID!,
    packageName: process.env.CANTONFLOW_PACKAGE_NAME || "cantonflow",
    parties: {
      supplier: process.env.CANTONFLOW_SUPPLIER_PARTY!,
      buyer: process.env.CANTONFLOW_BUYER_PARTY!,
      regulator: process.env.CANTONFLOW_REGULATOR_PARTY!,
      lenderA: process.env.CANTONFLOW_LENDER_A_PARTY!,
      lenderB: process.env.CANTONFLOW_LENDER_B_PARTY!,
    },
  };
}

export function cantonTemplateId(
  config: Pick<CantonConfig, "packageId">,
  template: string,
) {
  return `${config.packageId}:CantonFlow:${template}`;
}

export function cantonQueryTemplateId(
  config: Pick<CantonConfig, "packageName">,
  template: string,
) {
  return `#${config.packageName || "cantonflow"}:CantonFlow:${template}`;
}
