import type { CantonRole } from "@/lib/canton/config";

export const workspaceRoles = ["supplier", "lenderA", "lenderB", "regulator"] as const;
export type WorkspaceRole = (typeof workspaceRoles)[number];

function isWorkspaceRole(value: unknown): value is WorkspaceRole {
  return typeof value === "string" && workspaceRoles.includes(value as WorkspaceRole);
}

export function isLocalRoleSelectionEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.CANTONFLOW_ALLOW_LOCAL_ROLE_SELECTION === "true"
  );
}

export function isOidcConfigured() {
  return Boolean(
    process.env.AUTH_SECRET &&
      process.env.CANTONFLOW_OIDC_ISSUER &&
      process.env.CANTONFLOW_OIDC_CLIENT_ID &&
      process.env.CANTONFLOW_OIDC_CLIENT_SECRET &&
      process.env.CANTONFLOW_OIDC_SUBJECT_ROLES,
  );
}

export function isEvaluationAccessConfigured() {
  return Boolean(
    process.env.AUTH_SECRET && process.env.CANTONFLOW_EVALUATION_ACCESS_CODE,
  );
}

export function getRoleForSubject(subject: string | undefined): WorkspaceRole | null {
  if (!subject) return null;

  try {
    const mapping: unknown = JSON.parse(process.env.CANTONFLOW_OIDC_SUBJECT_ROLES || "{}");

    if (!mapping || typeof mapping !== "object") return null;
    const role = (mapping as Record<string, unknown>)[subject];
    return isWorkspaceRole(role) ? role : null;
  } catch {
    return null;
  }
}

export function isCantonRole(role: string): role is CantonRole {
  return role === "supplier" || role === "buyer" || role === "regulator" || role === "lenderA" || role === "lenderB";
}
