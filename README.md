# CantonFlow

CantonFlow is a confidential receivables RFQ product for suppliers and institutional lenders. Suppliers open financing requests, approved lenders submit private bids, and the winning offer becomes a Canton-modeled funding agreement with a settlement instruction.

Built for the Encode Club x Canton Foundation Build on Canton Hackathon.

## Why CantonFlow

Invoice financing depends on sensitive commercial data: buyer names, invoice PDFs, discount rates, lender appetite, and supplier cash-flow needs. Public-by-default workflows are a poor fit for this market.

CantonFlow focuses on the workflows institutions actually need:

- Confidential lender bidding
- Selective disclosure by participant role
- Permissioned invoice financing workflows
- DAML-modeled funding agreements and settlement instructions
- Professional UX for suppliers, lenders, and regulated finance teams

## Product Scope

Implemented:

- Landing page with Canton-specific privacy narrative
- Role entry with supplier, lender, and regulator workspaces
- Supplier dashboard with responsive layout
- KPI cards, recent invoice table, and activity stream
- Working upload invoice form with validation and success state
- Lender workspace for submitting confidential financing bids
- Supplier marketplace for reviewing and accepting private offers
- DAML contract model for invoice requests, private bids, funding agreements, and settlement instructions
- Clean navigation across all live routes
- Production build verification

## Product Flow

1. Open the landing page.
2. Click `Launch Product`.
3. Choose a role on the entry screen.
4. Continue as Supplier to review the dashboard.
5. Open `Upload` and submit the prefilled invoice form.
6. Open `Marketplace`.
7. Switch to Lender and submit a confidential bid.
8. Return as Supplier and accept the private offer.
9. Switch to Regulator to show metadata-only oversight.
10. Explain how lender offers remain confidential and selectively disclosed.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- Zod validation
- DAML contract model

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run build
./scripts/install-dpm.sh
HOME=$PWD/.home .tools/dpm/dpm build
```

## Remaining Milestones

See [MILESTONES.md](./MILESTONES.md).

## Canton Architecture

See [docs/CANTON_ARCHITECTURE.md](./docs/CANTON_ARCHITECTURE.md).

## Canton DevNet Deployment

Final qualification requires the Daml contracts to run on Canton DevNet. See [docs/DEVNET_DEPLOYMENT.md](./docs/DEVNET_DEPLOYMENT.md).
