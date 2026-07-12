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
