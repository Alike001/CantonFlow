import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  isCantonRole,
  isLocalRoleSelectionEnabled,
  type WorkspaceRole,
} from "@/lib/auth/roles";
import type { CantonRole } from "@/lib/canton/config";

type Authorization =
  | { role: CantonRole }
  | { response: NextResponse };

export async function authorizeCantonRole(
  allowedRoles: readonly CantonRole[],
  localRole?: string | null,
): Promise<Authorization> {
  if (isLocalRoleSelectionEnabled()) {
    const role = localRole && isCantonRole(localRole) ? localRole : allowedRoles[0];

    if (!allowedRoles.includes(role)) {
      return {
        response: NextResponse.json({ error: "Canton party is not authorized for this action" }, { status: 403 }),
      };
    }

    return { role };
  }

  const session = await auth();
  const role = session?.user?.cantonRole;

  if (!role) {
    return {
      response: NextResponse.json({ error: "Authentication is required" }, { status: 401 }),
    };
  }

  if (!isCantonRole(role) || !allowedRoles.includes(role)) {
    return {
      response: NextResponse.json({ error: "Canton party is not authorized for this action" }, { status: 403 }),
    };
  }

  return { role };
}

export async function getWorkspaceRole(localRole?: string | null): Promise<WorkspaceRole | null> {
  if (isLocalRoleSelectionEnabled()) {
    return localRole === "lenderB" ? "lenderB" : localRole === "lenderA" ? "lenderA" : null;
  }

  const session = await auth();
  const role = session?.user?.cantonRole;
  return role === "supplier" || role === "lenderA" || role === "lenderB" || role === "regulator" ? role : null;
}

export async function requireWorkspaceRole(
  allowedRoles: readonly WorkspaceRole[],
  localRole?: string | null,
) {
  if (isLocalRoleSelectionEnabled() && !localRole) {
    return allowedRoles[0];
  }

  const role = await getWorkspaceRole(localRole);

  if (!role || !allowedRoles.includes(role)) {
    redirect("/sign-in");
  }

  return role;
}
