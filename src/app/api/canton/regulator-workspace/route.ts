import { NextResponse } from "next/server";

import { getCantonConfig } from "@/lib/canton/config";
import { readRoleContracts } from "@/lib/canton/read-models";
import { authorizeCantonRole } from "@/lib/auth/session";

export async function GET() {
  const authorization = await authorizeCantonRole(["regulator"]);
  if ("response" in authorization) return authorization.response;

  try {
    const contracts = await readRoleContracts(getCantonConfig("regulator"), [
      "WorkflowAuditEvent",
    ]);

    return NextResponse.json({ contracts });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Canton query failed" },
      { status: 502 },
    );
  }
}
