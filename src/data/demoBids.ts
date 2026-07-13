export const DEMO_BIDS_STORAGE_KEY = "cantonflow:confidentialBids";
export const ACCEPTED_BID_STORAGE_KEY = "cantonflow:acceptedBidId";
export const FUNDING_AGREEMENT_STORAGE_KEY = "cantonflow:fundingAgreementContractId";
export const SETTLEMENT_PROOF_STORAGE_KEY = "cantonflow:settlementProof";

export interface ConfidentialBid {
  id: string;
  invoice: string;
  lender: string;
  advance: string;
  rate: string;
  term: string;
  note: string;
  submittedAt: string;
  source: "seed" | "lender";
  fundingBidContractId?: string;
}

export const seedBids: ConfidentialBid[] = [
  {
    id: "seed-bid-1",
    invoice: "INV-2026-004",
    lender: "Institutional Lender A",
    advance: "$256,000",
    rate: "4.8%",
    term: "62 days",
    note: "Best advance ratio with standard settlement conditions.",
    submittedAt: "Seed offer",
    source: "seed",
  },
  {
    id: "seed-bid-2",
    invoice: "INV-2026-004",
    lender: "Private Credit Desk B",
    advance: "$248,000",
    rate: "5.1%",
    term: "60 days",
    note: "Competitive offer with expedited settlement review.",
    submittedAt: "Seed offer",
    source: "seed",
  },
  {
    id: "seed-bid-3",
    invoice: "INV-2026-001",
    lender: "Trade Finance Fund C",
    advance: "$240,000",
    rate: "5.4%",
    term: "65 days",
    note: "Offer subject to buyer payment confirmation.",
    submittedAt: "Seed offer",
    source: "seed",
  },
];

export function formatCurrency(value: string) {
  const amount = Number(value);

  if (!amount) return "$0";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
