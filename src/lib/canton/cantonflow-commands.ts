import { cantonTemplateId, type CantonConfig } from "./config";
import {
  buildCreateCommand,
  buildExerciseCommand,
  submitAndWait,
} from "./json-ledger-api";

export interface CreateInvoiceRequestInput {
  invoiceId: string;
  invoiceNumber: string;
  buyerProfile: string;
  amount: string;
  currency: string;
  dueDate: string;
  requestedAdvance: string;
  minimumDiscountRate: string;
  visibility?: {
    buyerVisibleToLenders?: boolean;
    invoicePdfVisibleToLenders?: boolean;
    regulatorCanSeeCommercialTerms?: boolean;
  };
}

export function createInvoiceRequestArguments(
  config: CantonConfig,
  input: CreateInvoiceRequestInput,
) {
  return {
    supplier: config.parties.supplier,
    buyer: config.parties.buyer,
    regulator: config.parties.regulator,
    invoiceId: input.invoiceId,
    invoiceNumber: input.invoiceNumber,
    buyerProfile: input.buyerProfile,
    amount: input.amount,
    currency: input.currency,
    dueDate: input.dueDate,
    requestedAdvance: input.requestedAdvance,
    minimumDiscountRate: input.minimumDiscountRate,
    visibility: {
      buyerVisibleToLenders: input.visibility?.buyerVisibleToLenders ?? false,
      invoicePdfVisibleToLenders:
        input.visibility?.invoicePdfVisibleToLenders ?? false,
      regulatorCanSeeCommercialTerms:
        input.visibility?.regulatorCanSeeCommercialTerms ?? false,
    },
  };
}

export async function createInvoiceRequestOnLedger(
  config: CantonConfig,
  input: CreateInvoiceRequestInput,
) {
  return submitAndWait(config, {
    workflowId: "cantonflow-invoice-request",
    commandIdPrefix: "invoice-request",
    actAs: [config.parties.supplier],
    readAs: [config.parties.buyer, config.parties.regulator],
    commands: [
      buildCreateCommand(
        cantonTemplateId(config, "InvoiceRequest"),
        createInvoiceRequestArguments(config, input),
      ),
    ],
  });
}

export async function inviteLenderOnLedger(
  config: CantonConfig,
  input: { invoiceRequestContractId: string },
) {
  return submitAndWait(config, {
    workflowId: "cantonflow-invite-lender",
    commandIdPrefix: "invite-lender",
    actAs: [config.parties.supplier],
    readAs: [config.parties.lender, config.parties.regulator],
    commands: [
      buildExerciseCommand(
        cantonTemplateId(config, "InvoiceRequest"),
        input.invoiceRequestContractId,
        "InviteLender",
        { lender: config.parties.lender },
      ),
    ],
  });
}

export async function submitFundingBidOnLedger(
  config: CantonConfig,
  input: {
    lenderInviteContractId: string;
    advanceAmount: string;
    discountRate: string;
    settlementDays: string | number;
    lenderNote: string;
    submittedAt: string;
  },
) {
  return submitAndWait(config, {
    workflowId: "cantonflow-submit-funding-bid",
    commandIdPrefix: "submit-funding-bid",
    actAs: [config.parties.lender],
    readAs: [config.parties.supplier],
    commands: [
      buildExerciseCommand(
        cantonTemplateId(config, "LenderInvite"),
        input.lenderInviteContractId,
        "SubmitFundingBid",
        {
          advanceAmount: input.advanceAmount,
          discountRate: input.discountRate,
          settlementDays: String(input.settlementDays),
          lenderNote: input.lenderNote,
          submittedAt: input.submittedAt,
        },
      ),
    ],
  });
}

export async function acceptFundingBidOnLedger(
  config: CantonConfig,
  input: { fundingBidContractId: string; acceptedAt: string },
) {
  return submitAndWait(config, {
    workflowId: "cantonflow-accept-funding-bid",
    commandIdPrefix: "accept-funding-bid",
    actAs: [config.parties.supplier],
    readAs: [config.parties.lender, config.parties.regulator],
    commands: [
      buildExerciseCommand(
        cantonTemplateId(config, "FundingBid"),
        input.fundingBidContractId,
        "AcceptBid",
        { acceptedAt: input.acceptedAt },
      ),
    ],
  });
}

export async function prepareSettlementOnLedger(
  config: CantonConfig,
  input: {
    fundingAgreementContractId: string;
    settlementReference: string;
    preparedAt: string;
  },
) {
  return submitAndWait(config, {
    workflowId: "cantonflow-prepare-settlement",
    commandIdPrefix: "prepare-settlement",
    actAs: [config.parties.supplier, config.parties.lender],
    readAs: [config.parties.regulator],
    commands: [
      buildExerciseCommand(
        cantonTemplateId(config, "FundingAgreement"),
        input.fundingAgreementContractId,
        "PrepareSettlement",
        {
          settlementReference: input.settlementReference,
          preparedAt: input.preparedAt,
        },
      ),
    ],
  });
}
