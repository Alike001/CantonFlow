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
- Supplier dashboard ledger proof panel with local update IDs
- Working upload invoice form with validation, ledger submission, lender invitation, and update ID display
- Lender workspace for submitting confidential financing bids to the Canton JSON API route
- Supplier marketplace for reviewing private offers, accepting ledger-backed bids, and preparing settlement instructions
- DAML contract model for invoice requests, private bids, funding agreements, and settlement instructions
- Clean navigation across all live routes
- Production build verification

## Product Flow

1. Open the landing page.
2. Click `Launch Product`.
3. Choose a role on the entry screen.
4. Continue as Supplier to review the dashboard.
5. Open `Upload` and submit the prefilled invoice form to create an `InvoiceRequest` and fresh `LenderInvite`.
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

## Local On-Ledger Proof

CantonFlow has been executed end to end on a local Canton sandbox through the app's server-side JSON API routes.

Package ID:

```text
d26e00e71f06ecd7dac3746c13f5d347ed0faae6e0fa0c6a9e385486a02b98c0
```

Local ledger execution:

| Step | Update ID | Offset |
| --- | --- | --- |
| `InvoiceRequest` created | `122097e25256a541f06c27ce4da57babb80ef6eb48161c5cc5b8fa867df5b8ab16b5` | `17` |
| `LenderInvite` created | `12200d4bb126c762a3b48197db2ab7e7aaf7a0458c13c264a95ec2aa2bce34036939` | `20` |
| `FundingBid` submitted | `1220be6483f710f7d6dd1a88f22f9c3ab5de348dd3c393ef7fa76cc60d3d04743005` | `23` |
| `FundingAgreement` accepted | `122079df4bcb87e3e14ae5dda290c3101a128c1ddf425c5f9950695c67d69fe84139` | `26` |
| `SettlementInstruction` prepared | `12209626362a513904a03fee188d79ec1e8e3d1fec2b2d2254dd652cf25ab02e06e0` | `29` |

DevNet proof will replace the local proof after Seaport shared-validator access is enabled for the project wallet.

## Remaining Milestones

See [MILESTONES.md](./MILESTONES.md).

## Canton Architecture

See [docs/CANTON_ARCHITECTURE.md](./docs/CANTON_ARCHITECTURE.md).

## Canton DevNet Deployment

Final qualification requires the Daml contracts to run on Canton DevNet. See [docs/DEVNET_DEPLOYMENT.md](./docs/DEVNET_DEPLOYMENT.md).

The app now includes server-side Canton JSON API routes for DevNet readiness, supplier invoice submission, lender bid submission, bid acceptance, and settlement preparation:

- `GET /api/canton/status`
- `POST /api/canton/invoice-requests`
- `POST /api/canton/invites`
- `POST /api/canton/bids`
- `POST /api/canton/agreements`
- `POST /api/canton/settlements`
