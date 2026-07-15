import RegulatorAuditWorkspace from "@/components/regulator/RegulatorAuditWorkspace";
import { requireWorkspaceRole } from "@/lib/auth/session";

export default async function RegulatorPage() {
  await requireWorkspaceRole(["regulator"]);

  return <RegulatorAuditWorkspace />;
}
