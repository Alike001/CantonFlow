import { cantonTemplateId, type CantonConfig } from "./config";
import { buildCreateCommand, submitAndWait } from "./json-ledger-api";

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
