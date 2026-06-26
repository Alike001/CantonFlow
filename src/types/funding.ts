export interface FundingRequest {
  id: string;

  invoiceId: string;

  requestedAmount: number;

  minimumRate: number;

  biddingEnds: string;
}