import { cantonTemplateId, type CantonConfig } from "./config";
import {
  buildCreateCommand,
  buildExerciseCommand,
  findCreatedContractIdAtOffset,
  queryActiveContracts,
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
  idempotencyKey?: string;
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
  };
}

export async function createInvoiceRequestOnLedger(
  config: CantonConfig,
  input: CreateInvoiceRequestInput,
) {
  const result = await submitAndWait(config, {
    workflowId: "cantonflow-invoice-request",
    commandId: `cantonflow-invoice-request-${input.idempotencyKey || input.invoiceId}`,
    actAs: [config.parties.supplier],
    commands: [
      buildCreateCommand(
        cantonTemplateId(config, "InvoiceRequest"),
        createInvoiceRequestArguments(config, input),
      ),
      buildCreateCommand(cantonTemplateId(config, "WorkflowAuditEvent"), {
        eventOwner: config.parties.supplier,
        supplier: config.parties.supplier,
        regulator: config.parties.regulator,
        invoiceId: input.invoiceId,
        invoiceNumber: input.invoiceNumber,
        stage: "AuditInvoiceSubmitted",
        occurredAt: new Date().toISOString(),
      }),
    ],
  });

  try {
    const invoiceRequestTemplateId = cantonTemplateId(config, "InvoiceRequest");
    const contracts = await queryActiveContracts(config, result.completionOffset);
    const createdContractId = findCreatedContractIdAtOffset(
      contracts,
      invoiceRequestTemplateId,
      result.completionOffset,
    );

    return {
      ...result,
      createdContractId,
    };
  } catch (error) {
    return {
      ...result,
      createdContractId: undefined,
      contractLookupWarning:
        error instanceof Error ? error.message : "InvoiceRequest contract lookup failed",
    };
  }
}

export async function inviteLenderOnLedger(
  config: CantonConfig,
  input: { invoiceRequestContractId: string; idempotencyKey?: string },
) {
  const result = await submitAndWait(config, {
    workflowId: "cantonflow-invite-lender",
    commandId: `cantonflow-invite-lender-${input.idempotencyKey || input.invoiceRequestContractId}`,
    actAs: [config.parties.supplier],
    commands: [
      buildExerciseCommand(
        cantonTemplateId(config, "InvoiceRequest"),
        input.invoiceRequestContractId,
        "InviteLender",
        { lender: config.parties.lender, occurredAt: new Date().toISOString() },
      ),
    ],
  });

  try {
    const lenderInviteTemplateId = cantonTemplateId(config, "LenderInvite");
    const contracts = await queryActiveContracts(config, result.completionOffset);
    const createdContractId = findCreatedContractIdAtOffset(
      contracts,
      lenderInviteTemplateId,
      result.completionOffset,
    );

    return {
      ...result,
      createdContractId,
    };
  } catch (error) {
    return {
      ...result,
      createdContractId: undefined,
      contractLookupWarning:
        error instanceof Error ? error.message : "LenderInvite contract lookup failed",
    };
  }
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
    idempotencyKey?: string;
  },
) {
  const result = await submitAndWait(config, {
    workflowId: "cantonflow-submit-funding-bid",
    commandId: `cantonflow-submit-funding-bid-${input.idempotencyKey || input.lenderInviteContractId}`,
    actAs: [config.parties.lender],
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

  try {
    const fundingBidTemplateId = cantonTemplateId(config, "FundingBid");
    const contracts = await queryActiveContracts(config, result.completionOffset);
    const createdContractId = findCreatedContractIdAtOffset(
      contracts,
      fundingBidTemplateId,
      result.completionOffset,
    );

    return {
      ...result,
      createdContractId,
    };
  } catch (error) {
    return {
      ...result,
      createdContractId: undefined,
      contractLookupWarning:
        error instanceof Error ? error.message : "FundingBid contract lookup failed",
    };
  }
}

export async function acceptFundingBidOnLedger(
  config: CantonConfig,
  input: { fundingBidContractId: string; acceptedAt: string; idempotencyKey?: string },
) {
  const result = await submitAndWait(config, {
    workflowId: "cantonflow-accept-funding-bid",
    commandId: `cantonflow-accept-funding-bid-${input.idempotencyKey || input.fundingBidContractId}`,
    actAs: [config.parties.supplier],
    commands: [
      buildExerciseCommand(
        cantonTemplateId(config, "FundingBid"),
        input.fundingBidContractId,
        "AcceptBid",
        { acceptedAt: input.acceptedAt },
      ),
    ],
  });

  try {
    const fundingAgreementTemplateId = cantonTemplateId(config, "FundingAgreement");
    const contracts = await queryActiveContracts(config, result.completionOffset);
    const createdContractId = findCreatedContractIdAtOffset(
      contracts,
      fundingAgreementTemplateId,
      result.completionOffset,
    );

    return {
      ...result,
      createdContractId,
    };
  } catch (error) {
    return {
      ...result,
      createdContractId: undefined,
      contractLookupWarning:
        error instanceof Error ? error.message : "FundingAgreement contract lookup failed",
    };
  }
}

export async function proposeSettlementOnLedger(
  config: CantonConfig,
  input: {
    fundingAgreementContractId: string;
    settlementReference: string;
    preparedAt: string;
    idempotencyKey?: string;
  },
) {
  const result = await submitAndWait(config, {
    workflowId: "cantonflow-propose-settlement",
    commandId: `cantonflow-propose-settlement-${input.idempotencyKey || input.fundingAgreementContractId}`,
    actAs: [config.parties.supplier],
    commands: [
      buildExerciseCommand(
        cantonTemplateId(config, "FundingAgreement"),
        input.fundingAgreementContractId,
        "ProposeSettlement",
        {
          settlementReference: input.settlementReference,
          preparedAt: input.preparedAt,
        },
      ),
    ],
  });

  try {
    const settlementProposalTemplateId = cantonTemplateId(config, "SettlementProposal");
    const contracts = await queryActiveContracts(config, result.completionOffset);
    const createdContractId = findCreatedContractIdAtOffset(
      contracts,
      settlementProposalTemplateId,
      result.completionOffset,
    );

    return {
      ...result,
      createdContractId,
    };
  } catch (error) {
    return {
      ...result,
      createdContractId: undefined,
      contractLookupWarning:
        error instanceof Error ? error.message : "SettlementProposal contract lookup failed",
    };
  }
}

export async function confirmSettlementOnLedger(
  config: CantonConfig,
  input: {
    settlementProposalContractId: string;
    confirmedAt: string;
    idempotencyKey?: string;
  },
) {
  const result = await submitAndWait(config, {
    workflowId: "cantonflow-confirm-settlement",
    commandId: `cantonflow-confirm-settlement-${input.idempotencyKey || input.settlementProposalContractId}`,
    actAs: [config.parties.lender],
    commands: [
      buildExerciseCommand(
        cantonTemplateId(config, "SettlementProposal"),
        input.settlementProposalContractId,
        "ConfirmSettlement",
        { confirmedAt: input.confirmedAt },
      ),
    ],
  });

  try {
    const settlementInstructionTemplateId = cantonTemplateId(config, "SettlementInstruction");
    const contracts = await queryActiveContracts(config, result.completionOffset);
    const createdContractId = findCreatedContractIdAtOffset(
      contracts,
      settlementInstructionTemplateId,
      result.completionOffset,
    );

    return {
      ...result,
      createdContractId,
    };
  } catch (error) {
    return {
      ...result,
      createdContractId: undefined,
      contractLookupWarning:
        error instanceof Error ? error.message : "SettlementInstruction contract lookup failed",
    };
  }
}
