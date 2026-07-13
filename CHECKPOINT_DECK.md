# CantonFlow Checkpoint Deck

## 1. Title

CantonFlow: Confidential Invoice Financing for Institutional Trade Finance

Encode Club x Canton Foundation Build on Canton Hackathon

## 2. Problem

SMEs need faster access to working capital, but invoice financing exposes sensitive commercial data: buyers, invoice documents, rates, lender appetite, and supplier cash-flow pressure.

Traditional public-chain lending flows are not credible for this workflow because institutions cannot expose deal terms to the market.

## 3. Solution

CantonFlow gives suppliers a professional invoice financing workspace where they can upload unpaid invoices and receive private funding offers from eligible lenders.

The core product thesis is simple: only the parties involved should see the transaction details.

## 4. Why Canton

Canton is the right infrastructure because the product depends on:

- Selective disclosure
- Confidential bidding
- Permissioned workflows
- Institutional privacy
- Atomic settlement

The product is designed around those strengths instead of generic crypto wallet behavior.

## 5. Product Flow

1. Landing page: explain the privacy-first invoice financing use case.
2. Supplier dashboard: show invoice pipeline, confidential bids, and settlement activity.
3. Upload invoice: submit a financing request with validation.
4. Marketplace: show private lender offers where competing lenders cannot see each other.
5. Close: show the Canton Daml lifecycle and DevNet deployment path.

## 6. What Works Today

- Responsive landing page
- Supplier dashboard
- Upload invoice flow with validation and ledger update ID display
- Confidential marketplace screen
- Lender bid submission workflow
- Supplier bid acceptance state
- Regulator metadata-only view
- DAML contract model for the workflow lifecycle
- Local Canton sandbox execution through JSON API routes
- On-ledger local update IDs captured for invoice request, lender invite, bid, agreement, and settlement
- Dashboard ledger proof panel for judge-visible protocol evidence
- Navigation across all live routes
- Production build passes

## 7. Judge Alignment

Technical execution:
The app builds successfully, uses a clean Next.js structure, keeps reusable dashboard components, and includes a DAML contract model for the Canton workflow.

Originality:
The focus is private invoice financing with confidential lender competition, not a generic token dashboard.

User experience:
The interface is closer to Stripe, Mercury, or Brex than a crypto wallet.

Real-world applicability:
Invoice financing is a real trade finance need where privacy materially matters.

## 8. Next Milestones

- Deploy the compiled Daml package to Canton DevNet
- Repeat the local JSON API flow on the Seaport shared DevNet validator
- Add invoice detail visibility matrix
- Live deployment and 3-minute product video
