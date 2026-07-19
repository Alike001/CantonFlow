import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env.devnet");
const evidencePath = resolve(root, "tmp/cantonflow-devnet-lifecycle.json");

function readEnv(path) {
  const values = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator === -1) continue;
    values[line.slice(0, separator)] = line.slice(separator + 1);
  }
  return values;
}

const env = readEnv(envPath);
const required = [
  "JSON_LEDGER_API_URL",
  "LEDGER_API_TOKEN",
  "CANTONFLOW_PACKAGE_ID",
  "CANTONFLOW_SUPPLIER_PARTY",
  "CANTONFLOW_BUYER_PARTY",
  "CANTONFLOW_REGULATOR_PARTY",
  "CANTONFLOW_LENDER_A_PARTY",
  "CANTONFLOW_LENDER_B_PARTY",
];
const missing = required.filter((key) => !env[key]);

if (missing.length) {
  throw new Error(`Missing DevNet configuration: ${missing.join(", ")}`);
}

const apiUrl = env.JSON_LEDGER_API_URL.replace(/\/$/, "");
const template = (name) => `${env.CANTONFLOW_PACKAGE_ID}:CantonFlow:${name}`;
const queryTemplate = (name) => `#${env.CANTONFLOW_PACKAGE_NAME || "cantonflow"}:CantonFlow:${name}`;
const runId = `devnet-${new Date().toISOString().replace(/[-:.TZ]/g, "")}`;
const parties = {
  supplier: env.CANTONFLOW_SUPPLIER_PARTY,
  buyer: env.CANTONFLOW_BUYER_PARTY,
  regulator: env.CANTONFLOW_REGULATOR_PARTY,
  lenderA: env.CANTONFLOW_LENDER_A_PARTY,
  lenderB: env.CANTONFLOW_LENDER_B_PARTY,
};

async function request(path, method, body) {
  const response = await fetch(`${apiUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.LEDGER_API_TOKEN}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) {
    throw new Error(`Ledger API ${method} ${path} failed (${response.status}): ${await response.text()}`);
  }
  return response.json();
}

const authenticated = await request("/v2/authenticated-user", "GET");
const userId = authenticated.user?.id;
if (!userId) throw new Error("Ledger API did not return an authenticated user ID.");

async function submit(label, actAs, commands) {
  const result = await request("/v2/commands/submit-and-wait", "POST", {
    commands,
    workflowId: `cantonflow-${label}-${runId}`,
    applicationId: "cantonflow-devnet-lifecycle",
    userId,
    commandId: `cantonflow-${label}-${runId}`,
    deduplicationPeriod: { Empty: {} },
    actAs,
    readAs: [],
    submissionId: `cantonflow-${label}-${runId}`,
    disclosedContracts: [],
    domainId: "",
    packageIdSelectionPreference: [],
  });
  return result;
}

function create(templateId, createArguments) {
  return { CreateCommand: { templateId, createArguments } };
}

function exercise(templateId, contractId, choice, choiceArgument) {
  return { ExerciseCommand: { templateId, contractId, choice, choiceArgument } };
}

async function createdContractId(offset, templateName) {
  const templateId = queryTemplate(templateName);
  const contracts = await request("/v2/state/active-contracts", "POST", {
    filter: {
      filtersByParty: {},
      filtersForAnyParty: {
        cumulative: [{
          identifierFilter: {
            TemplateFilter: { value: { templateId, includeCreatedEventBlob: false } },
          },
        }],
      },
    },
    verbose: false,
    activeAtOffset: offset,
  });
  const contract = contracts.find((entry) => {
    const event = entry.contractEntry?.JsActiveContract?.createdEvent;
    return event?.templateId?.endsWith(`:CantonFlow:${templateName}`) && String(event.offset) === String(offset);
  });
  const contractId = contract?.contractEntry?.JsActiveContract?.createdEvent?.contractId;
  if (!contractId) throw new Error(`Could not locate ${templateName} created at offset ${offset}.`);
  return contractId;
}

const now = () => new Date().toISOString();
const invoiceId = `${runId}-rfq`;
const invoiceNumber = `CF-${runId.slice(-12)}`;
const evidence = { runId, invoiceId, invoiceNumber, userId, parties, updates: {} };

const invoice = await submit("invoice", [parties.supplier], [
  create(template("InvoiceRequest"), {
    supplier: parties.supplier,
    buyer: parties.buyer,
    regulator: parties.regulator,
    invoiceId,
    invoiceNumber,
    buyerProfile: "Investment-grade manufacturing buyer",
    amount: "320000.0",
    currency: "USD",
    dueDate: "2026-09-30",
    requestedAdvance: "252000.0",
    maximumDiscountRate: "5.0",
  }),
  create(template("WorkflowAuditEvent"), {
    eventOwner: parties.supplier,
    supplier: parties.supplier,
    regulator: parties.regulator,
    invoiceId,
    invoiceNumber,
    stage: "AuditInvoiceSubmitted",
    occurredAt: now(),
  }),
]);
const invoiceContractId = await createdContractId(invoice.completionOffset, "InvoiceRequest");
evidence.updates.invoice = { ...invoice, contractId: invoiceContractId };

const opened = await submit("open-round", [parties.supplier], [
  exercise(template("InvoiceRequest"), invoiceContractId, "OpenFundingRound", {}),
]);
let roundContractId = await createdContractId(opened.completionOffset, "FundingRound");
evidence.updates.opened = { ...opened, contractId: roundContractId };

const inviteA = await submit("invite-lender-a", [parties.supplier], [
  exercise(template("FundingRound"), roundContractId, "InviteLender", { lender: parties.lenderA, occurredAt: now() }),
]);
const inviteAContractId = await createdContractId(inviteA.completionOffset, "LenderInvite");
roundContractId = await createdContractId(inviteA.completionOffset, "FundingRound");
evidence.updates.inviteA = { ...inviteA, contractId: inviteAContractId, nextRoundContractId: roundContractId };

const inviteB = await submit("invite-lender-b", [parties.supplier], [
  exercise(template("FundingRound"), roundContractId, "InviteLender", { lender: parties.lenderB, occurredAt: now() }),
]);
const inviteBContractId = await createdContractId(inviteB.completionOffset, "LenderInvite");
roundContractId = await createdContractId(inviteB.completionOffset, "FundingRound");
evidence.updates.inviteB = { ...inviteB, contractId: inviteBContractId, nextRoundContractId: roundContractId };

const bidA = await submit("bid-lender-a", [parties.lenderA], [
  exercise(template("LenderInvite"), inviteAContractId, "SubmitFundingBid", {
    advanceAmount: "252000.0",
    discountRate: "4.9",
    settlementDays: "61",
    lenderNote: "Can settle after receivables verification.",
    submittedAt: now(),
  }),
]);
const bidAContractId = await createdContractId(bidA.completionOffset, "FundingBid");
evidence.updates.bidA = { ...bidA, contractId: bidAContractId };

const bidB = await submit("bid-lender-b", [parties.lenderB], [
  exercise(template("LenderInvite"), inviteBContractId, "SubmitFundingBid", {
    advanceAmount: "250000.0",
    discountRate: "4.7",
    settlementDays: "60",
    lenderNote: "Competitive confidential funding offer.",
    submittedAt: now(),
  }),
]);
const bidBContractId = await createdContractId(bidB.completionOffset, "FundingBid");
evidence.updates.bidB = { ...bidB, contractId: bidBContractId };

const accepted = await submit("accept-bid", [parties.supplier], [
  exercise(template("FundingBid"), bidAContractId, "AcceptBid", {
    fundingRoundToClose: roundContractId,
    acceptedAt: now(),
  }),
]);
const agreementContractId = await createdContractId(accepted.completionOffset, "FundingAgreement");
evidence.updates.accepted = { ...accepted, contractId: agreementContractId };

const proposed = await submit("propose-settlement", [parties.supplier], [
  exercise(template("FundingAgreement"), agreementContractId, "ProposeSettlement", {
    settlementReference: `coordination-${runId}`,
    preparedAt: now(),
  }),
]);
const proposalContractId = await createdContractId(proposed.completionOffset, "SettlementProposal");
evidence.updates.proposed = { ...proposed, contractId: proposalContractId };

const confirmed = await submit("confirm-settlement", [parties.lenderA], [
  exercise(template("SettlementProposal"), proposalContractId, "ConfirmSettlement", { confirmedAt: now() }),
]);
const instructionContractId = await createdContractId(confirmed.completionOffset, "SettlementInstruction");
evidence.updates.confirmed = { ...confirmed, contractId: instructionContractId };

mkdirSync(resolve(root, "tmp"), { recursive: true });
writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`DevNet lifecycle completed. Evidence saved to ${evidencePath}.`);
