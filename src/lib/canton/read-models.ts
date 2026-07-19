import { cantonQueryTemplateId, type CantonConfig } from "./config";
import {
  queryCurrentActiveContracts,
  type ActiveContractEntry,
} from "./json-ledger-api";

export type LedgerContract = {
  contractId: string;
  template: string;
  createdAt: string | null;
  payload: Record<string, unknown>;
};

function toLedgerContract(entry: ActiveContractEntry): LedgerContract | null {
  const event = entry.contractEntry?.JsActiveContract?.createdEvent;

  if (!event?.contractId || !event.templateId || !event.createArgument) {
    return null;
  }

  return {
    contractId: event.contractId,
    template: event.templateId.split(":").at(-1) || event.templateId,
    createdAt: event.createdAt || null,
    payload: event.createArgument,
  };
}

export async function readRoleContracts(
  config: CantonConfig,
  templates: string[],
) {
  const templateIds = templates.map((template) => cantonQueryTemplateId(config, template));
  const entries = await queryCurrentActiveContracts(config, templateIds);

  return entries
    .map(toLedgerContract)
    .filter((contract): contract is LedgerContract => contract !== null);
}
