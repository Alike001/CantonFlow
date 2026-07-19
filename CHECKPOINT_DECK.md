# CantonFlow Final Submission Deck

## 1. CantonFlow

**Confidential receivables RFQs for institutional trade finance**

Encode Club x Canton Foundation Build on Canton Hackathon

Suppliers request working capital. Eligible lenders compete privately. CantonFlow coordinates the financing workflow without exposing commercial terms to every market participant.

## 2. The Problem

Invoice financing is commercially sensitive. A supplier does not want every lender to see its buyer, cash-flow pressure, requested advance, or acceptable discount rate. Lenders do not want competing lenders to see their pricing or appetite.

Public-by-default finance infrastructure makes this workflow difficult to adopt. Institutions need a shared process with deliberately restricted visibility.

## 3. The Product

CantonFlow is a professional receivables-RFQ workspace:

1. A supplier opens a financing RFQ.
2. The supplier privately invites eligible lenders.
3. Each lender submits a confidential funding bid.
4. The supplier selects one bid and creates a shared funding agreement.
5. Supplier and winning lender coordinate a settlement instruction.

This is not a wallet or token dashboard. It is an operational trade-finance workflow.

## 4. Why Canton

The confidentiality model is implemented in Daml contract stakeholders:

- `FundingBid` is visible to the bidding lender and supplier.
- Competing lenders are not stakeholders in each other’s bids.
- The regulator receives a separate metadata-only `WorkflowAuditEvent`, not financing terms.
- A supplier accepts a bid by consuming the funding round, preventing another acceptance from that same round.

Canton is essential here because the product requires shared workflow state and selective disclosure at the contract level.

## 5. Live DevNet Proof

CantonFlow is deployed to the Encode Hackathon Seaport `5N Sandbox` Canton DevNet validator.

- DAR package: `8e13ff7aa3f44145da0bbcfc560667b0d014db8d751651085367d5945996c42b`
- Real workflow: RFQ, two lender invitations, two bids, funding agreement, settlement instruction
- `FundingAgreement` update: `12209450d8d77d78e51f9d28575bc34dc7e412c6aa5431d15dd5286c3b5d914d2be1`
- `SettlementInstruction` update: `1220be6eb562d49e6dac1c8d8d5e33c4a5a5711c42baba869f44c5d4e7c6839ff188`
- Final completion offset: `4454900`

The settlement instruction coordinates the next step; CantonFlow does not claim to transfer money or settle an asset today.

## 6. Product Demo

Show the workflow in this order:

1. Landing page: confidential invoice-financing RFQs, not generic DeFi.
2. Supplier workspace: open a receivables RFQ and invite lenders.
3. Lender workspace: submit a funding bid.
4. Supplier marketplace: review and accept a private bid.
5. Regulator workspace: show lifecycle metadata only.
6. DevNet evidence: deployed DAR plus update IDs and on-ledger lifecycle output.

The demo proves what the UI cannot merely claim: Daml contracts ran on Canton DevNet with distinct supplier, buyer, regulator, lender A, and lender B parties.

## 7. Judge Alignment

**Technical execution**: Next.js product, Daml contracts, automated API tests, Daml lifecycle tests, and a completed DevNet lifecycle.

**Originality**: Private lender competition for receivables financing, with a regulator audit trail that does not expose lender pricing.

**User experience**: Enterprise dashboard patterns rather than crypto-wallet interactions.

**Real-world applicability**: Invoice financing is a concrete working-capital workflow where privacy materially affects adoption.

## 8. Roadmap

- Configure production OIDC so every signed-in user maps to one authorized Canton role.
- Complete the Vercel DevNet integration using server-side M2M token refresh.
- Add buyer attestation and document evidence before claiming verified invoices.
- Integrate a real payment or tokenized-deposit rail before claiming asset settlement.
