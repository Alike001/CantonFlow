import LenderBidWorkspace from "@/components/lender/LenderBidWorkspace";
import { requireWorkspaceRole } from "@/lib/auth/session";

export default async function LenderPage({
  searchParams,
}: {
  searchParams: Promise<{ lender?: string }>;
}) {
  const { lender } = await searchParams;
  const role = await requireWorkspaceRole(
    ["lenderA", "lenderB"],
    lender === "lenderB" ? "lenderB" : "lenderA",
  );
  return <LenderBidWorkspace lender={role as "lenderA" | "lenderB"} />;
}
