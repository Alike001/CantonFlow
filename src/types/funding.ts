export interface FundingRequest {
  id: string;

  invoiceId: string;

  requestedAmount: number;

  maximumRate: number;

  biddingEnds: string;
}
