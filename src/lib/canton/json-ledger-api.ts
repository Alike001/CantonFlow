import type { CantonConfig } from "./config";

type JsonObject = Record<string, unknown>;

interface SubmitAndWaitRequest {
  commands: JsonObject[];
  workflowId: string;
  applicationId: string;
  userId: string;
  commandId: string;
  deduplicationPeriod: { Empty: Record<string, never> };
  actAs: string[];
  readAs: string[];
  submissionId: string;
  disclosedContracts: unknown[];
  domainId: string;
  packageIdSelectionPreference: string[];
}

export interface SubmitAndWaitResponse {
  updateId: string;
  completionOffset: number | string;
  [key: string]: unknown;
}

interface ActiveContractsRequest {
  filter: {
    filtersByParty: Record<string, never>;
    filtersForAnyParty: {
      cumulative: Array<{
        identifierFilter: {
          WildcardFilter: {
            value: {
              includeCreatedEventBlob: boolean;
            };
          };
        };
      }>;
    };
  };
  verbose: boolean;
  activeAtOffset: number | string;
}

export interface ActiveContractEntry {
  workflowId?: string;
  contractEntry?: {
    JsActiveContract?: {
      createdEvent?: {
        offset?: number | string;
        contractId?: string;
        templateId?: string;
        createArgument?: Record<string, unknown>;
      };
    };
  };
}

export function buildCreateCommand(templateId: string, createArguments: JsonObject) {
  return {
    CreateCommand: {
      templateId,
      createArguments,
    },
  };
}

export function buildExerciseCommand(
  templateId: string,
  contractId: string,
  choice: string,
  choiceArgument: JsonObject,
) {
  return {
    ExerciseCommand: {
      templateId,
      contractId,
      choice,
      choiceArgument,
    },
  };
}

export async function submitAndWait(
  config: CantonConfig,
  params: {
    commands: JsonObject[];
    workflowId: string;
    commandIdPrefix: string;
    actAs: string[];
    readAs?: string[];
  },
): Promise<SubmitAndWaitResponse> {
  const commandId = `${params.commandIdPrefix}-${Date.now()}`;
  const payload: SubmitAndWaitRequest = {
    commands: params.commands,
    workflowId: params.workflowId,
    applicationId: config.applicationId,
    userId: config.userId,
    commandId,
    deduplicationPeriod: { Empty: {} },
    actAs: params.actAs,
    readAs: params.readAs || [],
    submissionId: commandId,
    disclosedContracts: [],
    domainId: "",
    packageIdSelectionPreference: [],
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (config.ledgerApiToken) {
    headers.Authorization = `Bearer ${config.ledgerApiToken}`;
  }

  const response = await fetch(
    `${config.jsonLedgerApiUrl.replace(/\/$/, "")}/v2/commands/submit-and-wait`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Canton JSON API command failed (${response.status}): ${body}`);
  }

  return response.json() as Promise<SubmitAndWaitResponse>;
}

export async function queryActiveContracts(
  config: CantonConfig,
  activeAtOffset: number | string,
): Promise<ActiveContractEntry[]> {
  const payload: ActiveContractsRequest = {
    filter: {
      filtersByParty: {},
      filtersForAnyParty: {
        cumulative: [
          {
            identifierFilter: {
              WildcardFilter: {
                value: {
                  includeCreatedEventBlob: false,
                },
              },
            },
          },
        ],
      },
    },
    verbose: false,
    activeAtOffset,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (config.ledgerApiToken) {
    headers.Authorization = `Bearer ${config.ledgerApiToken}`;
  }

  const response = await fetch(
    `${config.jsonLedgerApiUrl.replace(/\/$/, "")}/v2/state/active-contracts`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Canton JSON API active contract query failed (${response.status}): ${body}`);
  }

  return response.json() as Promise<ActiveContractEntry[]>;
}

export function findCreatedContractIdAtOffset(
  contracts: ActiveContractEntry[],
  templateId: string,
  offset: number | string,
) {
  const normalizedOffset = String(offset);

  return contracts.find((entry) => {
    const event = entry.contractEntry?.JsActiveContract?.createdEvent;
    return (
      event?.templateId === templateId &&
      String(event.offset) === normalizedOffset &&
      event.contractId
    );
  })?.contractEntry?.JsActiveContract?.createdEvent?.contractId;
}
