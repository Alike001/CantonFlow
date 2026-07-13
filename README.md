# CantonFlow

CantonFlow is a confidential receivables RFQ product for suppliers and institutional lenders. Suppliers open financing requests, approved lenders submit private bids, and the winning offer becomes a shared Canton funding agreement.

Built for the Encode Club x Canton Foundation Build on Canton Hackathon.

## Why CantonFlow

Invoice financing depends on sensitive commercial data: buyer names, invoice PDFs, discount rates, lender appetite, and supplier cash-flow needs. Public-by-default workflows are a poor fit for this market.

CantonFlow focuses on the workflows institutions actually need:

- Confidential lender bidding
- Contract-level selective disclosure by participant role
- Permissioned invoice financing workflows
- DAML-modeled funding agreements, settlement coordination, and regulator audit events
- Professional UX for suppliers, lenders, and regulated finance teams

## Product Scope

Implemented:

- Landing page with Canton-specific privacy narrative
- Role entry with supplier, lender, and regulator workspaces
- Supplier dashboard with responsive layout
- KPI cards, recent invoice table, and activity stream
- Supplier, lender, and regulator workspaces backed by role-specific Canton reads
- Canton environment badge for Local Sandbox, DevNet, or external validator status
- Working funding-request form with validation, ledger submission, lender invitation, and update ID display
- Lender workspace for querying active invitations and submitting confidential financing bids
- Supplier marketplace for querying private offers and accepting ledger-backed bids
- Regulator workspace for querying metadata-only `WorkflowAuditEvent` contracts
- DAML contract model for invoice requests, private bids, funding agreements, settlement coordination, and metadata-only audit events
- Clean navigation across all live routes
- Production build verification

## Product Flow

1. Open the landing page.
2. Click `Launch Product`.
3. Choose a role on the entry screen.
4. Continue as Supplier to review the dashboard.
5. Open `Upload` and create a funding request to create an `InvoiceRequest` and fresh `LenderInvite`.
6. Open `Marketplace`.
7. Switch to Lender and submit a confidential bid.
8. Return as Supplier and accept the private offer.
9. Switch to Regulator to query metadata-only `WorkflowAuditEvent` records.
10. Explain how lender offers remain confidential because competing lenders and regulators are not stakeholders in `FundingBid`.

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
npm run local:up
```

This starts the local Canton sandbox, provisions local parties, writes ignored `.env.local` values, and starts the app. Open `http://localhost:3000`.

Prerequisites: Node.js, a JDK, and `curl`. The first run downloads the Daml tooling through the project setup script.

## Verification

```bash
npm run lint
npm run build
npm run test:daml
./scripts/install-dpm.sh
HOME=$PWD/.home .tools/dpm/dpm build
```

## Local On-Ledger Proof

CantonFlow has been executed end to end on a local Canton sandbox through the app's server-side JSON API routes.

Current local package ID:

```text
b3652ee39ac6b6dc2cf458d032acf8335078412a110336090dc7a1a334de8ed8
```

Local ledger execution:

| Step | Update ID | Offset |
| --- | --- | --- |
| `InvoiceRequest` created | `1220ad340409895ce5c34e9a13da9d7834d1ee1cab03d71e72781f417083f7c6b7c0` | `20` |
| `LenderInvite` created | `1220ad144d919550a39a8cecde91eeda5fb5328aca7eaa362900bfa10b686255d882` | `23` |
| `FundingBid` submitted | `1220fac191b01932d9d9851e5cdffe5dda4cc6cdade6012b61cda487d6b34380ad02` | `26` |
| `FundingAgreement` accepted | `1220dbd129e3d533e903bf1d4b9767e741609e43608f005d61acba252c2b98c1fbc4` | `29` |

## Canton DevNet Proof

Status: waiting for Seaport shared-validator access from the hackathon admin.

The product is already wired to Canton JSON API routes and has been verified locally with the same Daml package and workflow shape intended for DevNet. Once access is granted, the `.env.devnet` values will be replaced with DevNet validator credentials and the full flow will be repeated on-ledger.

Access request party ID sent to admin:

```text
37de9fd8a7c09e227c70f85c781542b8::1220bafc5cf456aa4fb394690836cb8151b67d6476ecfaf15f56cc2494f32a98fef0
```

DevNet proof checklist to replace after access:

| Evidence | Current value |
| --- | --- |
| DevNet validator | Pending Seaport access |
| DevNet JSON Ledger API URL | Pending Seaport access |
| DAR package ID | `b3652ee39ac6b6dc2cf458d032acf8335078412a110336090dc7a1a334de8ed8` locally, replace with DevNet package ID after upload |
| Supplier party | Pending DevNet party |
| Buyer party | Pending DevNet party |
| Lender party | Pending DevNet party |
| Regulator party | Pending DevNet party |
| `InvoiceRequest` update ID | Pending DevNet execution |
| `LenderInvite` update ID | Pending DevNet execution |
| `FundingBid` update ID | Pending DevNet execution |
| `FundingAgreement` update ID | Pending DevNet execution |
| `SettlementInstruction` update ID | Pending DevNet execution |
| Screenshots | Pending DevNet execution |

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
