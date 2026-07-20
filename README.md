# CantonFlow

CantonFlow is a confidential receivables RFQ product for suppliers and institutional lenders. Suppliers open financing requests, approved lenders submit private bids, and the winning offer becomes a shared Canton funding agreement.

Built for the Encode Club x Canton Foundation Build on Canton Hackathon.

## Why CantonFlow

Invoice financing depends on sensitive commercial data: buyer identity, discount rates, lender appetite, and supplier cash-flow needs. Public-by-default workflows are a poor fit for this market.

CantonFlow focuses on the workflows institutions actually need:

- Confidential lender bidding
- Contract-level selective disclosure by participant role
- Permissioned invoice financing workflows
- DAML-modeled funding agreements, supplier-proposed/lender-confirmed settlement coordination, and regulator audit events
- Professional UX for suppliers, lenders, and regulated finance teams

## Product Scope

Implemented:

- Landing page with Canton-specific privacy narrative
- Role entry with supplier, lender, and regulator workspaces
- Supplier dashboard with responsive layout
- KPI cards, recent invoice table, and activity stream
- Supplier, lender, and regulator workspaces backed by role-specific Canton reads
- Canton environment badge for Local Sandbox, DevNet, or external validator status
- Working receivables-RFQ form with validation, ledger submission, two lender-specific invitations, and update ID display
- Separate lender A and lender B workspaces for querying only their invitations and submitting confidential financing bids
- Supplier marketplace for querying private offers and accepting one ledger-backed bid per RFQ
- Regulator workspace for querying metadata-only `WorkflowAuditEvent` contracts
- DAML contract model for invoice requests, private bids, funding agreements, dual-party settlement coordination, and metadata-only audit events
- Clean navigation across all live routes
- Production build verification

## Product Flow

1. Open the landing page.
2. Click `Launch Product`.
3. Choose a role on the entry screen.
4. Continue as Supplier to review the dashboard.
5. Open `Create RFQ`. CantonFlow creates an `InvoiceRequest`, opens one private `FundingRound`, and issues two lender-specific `LenderInvite` contracts.
6. Open `Marketplace`.
7. Switch to Lender A or Lender B and submit a confidential bid.
8. Return as Supplier and accept the private offer.
9. Switch to Regulator to query metadata-only `WorkflowAuditEvent` records.
10. Explain how lender offers remain confidential because competing lenders and regulators are not stakeholders in each other's `FundingBid` contracts.

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

If a restarted local sandbox reports `UNKNOWN_SUBMITTERS`, stop Next.js and reprovision only the local parties:

```bash
LOCAL_REPROVISION_PARTIES=true npm run local:up
```

The local environment enables role selection only for the sandbox. It provisions distinct lender A and lender B parties; do not replace them with one shared lender party because that removes the privacy boundary being tested.

## Production Authentication

Production uses OIDC through Auth.js. It does not accept a lender role from a query parameter or API body: the verified OIDC subject is mapped server-side to exactly one CantonFlow role, which then selects the corresponding Canton party.

Set these Vercel environment variables before enabling the live product. All are server-side values: do not use the `NEXT_PUBLIC_` prefix.

```text
AUTH_SECRET=<long random secret>
CANTONFLOW_OIDC_ISSUER=https://identity.example.com/realms/cantonflow
CANTONFLOW_OIDC_CLIENT_ID=cantonflow-web
CANTONFLOW_OIDC_CLIENT_SECRET=<oidc-client-secret>
CANTONFLOW_OIDC_SUBJECT_ROLES={"oidc-subject-for-supplier":"supplier","oidc-subject-for-lender-a":"lenderA","oidc-subject-for-lender-b":"lenderB","oidc-subject-for-regulator":"regulator"}
```

Without these values, production workspace and write routes fail closed. The local role selector is never enabled in production.

For time-limited judge access, Auth.js can issue an evaluation session bound to one configured Canton role. Set a strong server-only code and share it only in the submission notes:

```text
CANTONFLOW_EVALUATION_ACCESS_CODE=<strong random access code>
```

This does not enable the local role selector or bypass API authorization. Each evaluation sign-in creates a signed session for one role, and server routes derive the corresponding Canton party from that session. Remove the variable after judging and use institutional OIDC for normal operation.

## Vercel DevNet Configuration

The Ledger API credential is separate from user authentication. Configure the following in Vercel for Production and Preview, using the exact DevNet Party IDs allocated for CantonFlow:

```text
JSON_LEDGER_API_URL=https://ledger-api.validator.devnet.sandbox.fivenorth.io
CANTONFLOW_PACKAGE_ID=8e13ff7aa3f44145da0bbcfc560667b0d014db8d751651085367d5945996c42b
CANTONFLOW_PACKAGE_NAME=cantonflow
CANTONFLOW_APPLICATION_ID=cantonflow
CANTONFLOW_USER_ID=<Ledger API authenticated user ID>
CANTONFLOW_SUPPLIER_USER_ID=<same Ledger API user ID>
CANTONFLOW_BUYER_USER_ID=<same Ledger API user ID>
CANTONFLOW_REGULATOR_USER_ID=<same Ledger API user ID>
CANTONFLOW_LENDER_A_USER_ID=<same Ledger API user ID>
CANTONFLOW_LENDER_B_USER_ID=<same Ledger API user ID>
CANTONFLOW_SUPPLIER_PARTY=<supplier Party ID>
CANTONFLOW_BUYER_PARTY=<buyer Party ID>
CANTONFLOW_REGULATOR_PARTY=<regulator Party ID>
CANTONFLOW_LENDER_A_PARTY=<lender A Party ID>
CANTONFLOW_LENDER_B_PARTY=<lender B Party ID>
DEVNET_OIDC_TOKEN_URL=<validator M2M token endpoint>
DEVNET_M2M_CLIENT_ID=<validator M2M client ID>
DEVNET_M2M_CLIENT_SECRET=<validator M2M client secret>
DEVNET_M2M_AUDIENCE=<validator M2M audience>
DEVNET_M2M_SCOPE=daml_ledger_api
```

The server exchanges the M2M credential for a Ledger token and refreshes it before expiry. Do not set `LEDGER_API_TOKEN` in Vercel when M2M values are configured, and never expose any of these credentials to browser code.

## Verification

```bash
npm run lint
npm run test:api
npm run build
npm run test:daml
./scripts/install-dpm.sh
HOME=$PWD/.home .tools/dpm/dpm build
```

## Local Ledger Verification

The local sandbox is a development environment, not final submission evidence. Run `npm run local:up`, then use the UI to execute the RFQ lifecycle. `npm run test:daml` independently verifies that only the supplier can open an RFQ, each lender can be invited once, each invitation can submit one bid, invalid commercial terms fail, lender bids are isolated, and the first accepted bid consumes the funding round.

Obtain the current package ID from the DAR generated by the build; do not copy a package ID from this README:

```bash
HOME=$PWD/.home .tools/dpm/dpm damlc inspect-dar .daml/dist/cantonflow-0.1.0.dar
```

## Canton DevNet Proof

The CantonFlow DAR is deployed and its full receivables-RFQ lifecycle has executed on the Encode Hackathon Seaport `5N Sandbox` Canton DevNet validator.

- DAR package ID: `8e13ff7aa3f44145da0bbcfc560667b0d014db8d751651085367d5945996c42b`
- RFQ run: `devnet-20260719132732513`
- `InvoiceRequest`: update `1220d993bbe8e7bc0d84f0936b2d1444975892fbbcac1b4e2a3449da10b9a1fb38c8`, offset `4454876`
- Lender A and Lender B invites: offsets `4454882` and `4454885`
- Private lender bids: offsets `4454888` and `4454891`
- `FundingAgreement`: update `12209450d8d77d78e51f9d28575bc34dc7e412c6aa5431d15dd5286c3b5d914d2be1`, offset `4454894`
- `SettlementInstruction`: update `1220be6eb562d49e6dac1c8d8d5e33c4a5a5711c42baba869f44c5d4e7c6839ff188`, offset `4454900`

The settlement instruction is a Canton workflow record, not a transfer of money. It proves supplier/lender coordination only.

To repeat the run against an authorized DevNet environment, keep secrets in ignored `.env.devnet`, then run:

```bash
npm run devnet:token
npm run devnet:parties
npm run devnet:lifecycle
```

The lifecycle runner saves local evidence to `tmp/cantonflow-devnet-lifecycle.json`. The Vercel deployment is not yet a public DevNet product because it still needs server-side DevNet credentials and production OIDC configuration.

## Remaining Milestones

See [MILESTONES.md](./MILESTONES.md).

## Canton Architecture

See [docs/CANTON_ARCHITECTURE.md](./docs/CANTON_ARCHITECTURE.md).

## Canton DevNet Deployment

Final qualification requires the Daml contracts to run on Canton DevNet. See [docs/DEVNET_DEPLOYMENT.md](./docs/DEVNET_DEPLOYMENT.md).

The app now includes server-side Canton JSON API routes for DevNet readiness, supplier invoice submission, lender bid submission, bid acceptance, and settlement preparation:

- `GET /api/canton/status`
- `POST /api/canton/invoice-requests`
- `POST /api/canton/funding-rounds`
- `POST /api/canton/invites`
- `POST /api/canton/bids`
- `POST /api/canton/agreements`
- `POST /api/canton/settlements`
- `POST /api/canton/settlement-confirmations`
