import LenderBidWorkspace from "@/components/lender/LenderBidWorkspace";

export default async function LenderPage({
  searchParams,
}: {
  searchParams: Promise<{ lender?: string }>;
}) {
  const { lender } = await searchParams;
  return <LenderBidWorkspace lender={lender === "lenderB" ? "lenderB" : "lenderA"} />;
}
