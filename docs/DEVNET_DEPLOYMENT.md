# DevNet Deployment Runbook

Final hackathon qualification requires CantonFlow Daml contracts running on Canton DevNet. LocalNet, sandbox, frontend-only state, and Seaport-only mockups are not enough.

Source requirements:

- Encode Canton Hackathon page: final submissions require a public repo, deck, video, live product, and DevNet deployment.
- Digital Asset DevNet guide: deploy a validator, build a DAR, upload it to the JSON Ledger API, then test the workflow on-ledger.

## Current Status

Done in this repository:

- Daml source: `daml/CantonFlow.daml`
- Daml project config: `daml.yaml`
- Compiled DAR: `.daml/dist/cantonflow-0.1.0.dar`
- Frontend workflow: supplier funding request, lender private bid, supplier acceptance, regulator metadata-only ledger view
- Architecture doc: `docs/CANTON_ARCHITECTURE.md`
- DevNet upload helper: `scripts/upload-dar-devnet.sh`

Completed on Encode Hackathon Seaport `5N Sandbox` Canton DevNet:

- DAR uploaded: package `8e13ff7aa3f44145da0bbcfc560667b0d014db8d751651085367d5945996c42b`
- Five distinct CantonFlow role parties allocated and granted `CanActAs` rights to the authorized Ledger API user
- Full lifecycle executed: RFQ, funding round, two lender invitations, two bids, bid acceptance, settlement proposal, and settlement instruction
- Local evidence captured at `tmp/cantonflow-devnet-lifecycle.json` (ignored because it contains contract identifiers)

## Required External Access

For the hackathon, the expected path is the provided Seaport/shared validator flow. You need:

- Your Canton Loop DevNet wallet party added to the hackathon Seaport org.
- Access to the provided DevNet validator in Seaport.
- The JSON Ledger API URL / upload path exposed by that validator flow.
- Party IDs for the CantonFlow workflow roles.
- An OAuth2 token if the selected DevNet JSON API requires one for package upload or command submission.

Operating your own validator is not required for the product build. Use the validator request route only if the organizers specifically tell you to operate a validator yourself:

```text
https://canton.foundation/apply-to-set-up-a-validator-node/
```

## Install / Verify Tooling

Check for Daml/DPM:

```bash
./scripts/install-dpm.sh
HOME=$PWD/.home .tools/dpm/dpm --version
docker --version
jq --version
```

This repo currently uses `daml.yaml`. Build with DPM:

```bash
HOME=$PWD/.home .tools/dpm/dpm build
```

Expected output:

```text
.daml/dist/cantonflow-0.1.0.dar
```

## DevNet Validator Setup Summary

If using Seaport, deploy through the shared validator UI after the admin adds your Loop wallet party to the org. If you are instructed to operate your own validator, follow the official DevNet quickstart guide. The key steps are:

1. Add host entries:

```text
127.0.0.1 json-ledger-api.localhost
127.0.0.1 grpc-ledger-api.localhost
127.0.0.1 validator.localhost
127.0.0.1 app-provider.localhost
127.0.0.1 participant.localhost
127.0.0.1 wallet.localhost
127.0.0.1 ans.localhost
127.0.0.1 keycloak.localhost
127.0.0.1 host.docker.internal
```

2. Connect to the Canton DevNet VPN.

3. Get network information:

```bash
INFO_URL="https://docs.dev.global.canton.network.sync.global/info"
SPLICE_VERSION=$(curl -s "$INFO_URL" | jq -r '.synchronizer?.active?.version')
MIGRATION_ID=$(curl -s "$INFO_URL" | jq -r '.synchronizer?.active?.migration_id')

echo "Splice Version: $SPLICE_VERSION"
echo "Migration ID: $MIGRATION_ID"
```

4. Request onboarding secret:

```bash
SPONSOR_SV_URL="https://sv.sv-1.dev.global.canton.network.sync.global"
ONBOARDING_SECRET=$(curl -s -X POST "$SPONSOR_SV_URL/api/sv/v0/devnet/onboard/validator/prepare")
echo "$ONBOARDING_SECRET"
```

5. Start the validator using the official `splice-node/docker-compose/validator/start.sh`.

## Seaport Shared Validator Summary

Use this when the hackathon admin confirms your Loop wallet party has been added to the org.

1. Open `https://app.devnet.seaport.to`.
2. Log in with the Canton Loop DevNet wallet.
3. Switch to the hackathon org/team.
4. Select the provided validator, commonly referenced as `5n sandbox`.
5. Import or create the CantonFlow Daml project.
6. Deploy the compiled CantonFlow DAR.
7. Capture deployment proof, package ID, and transaction/update evidence.

## Upload CantonFlow DAR

Copy env template:

```bash
cp .env.devnet.example .env.devnet
```

For the shared validator, obtain the M2M OIDC credential from the validator administrator and set it only in ignored `.env.devnet`:

```bash
JSON_LEDGER_API_URL=https://ledger-api.validator.devnet.sandbox.fivenorth.io
DEVNET_OIDC_TOKEN_URL=<validator token endpoint>
DEVNET_M2M_CLIENT_ID=<validator M2M client ID>
DEVNET_M2M_CLIENT_SECRET=<validator M2M client secret>
DEVNET_M2M_AUDIENCE=<validator audience>
DEVNET_M2M_SCOPE=daml_ledger_api
CANTONFLOW_PACKAGE_ID=<main package id from inspect-dar>
CANTONFLOW_PACKAGE_NAME=cantonflow
CANTONFLOW_USER_ID=<value returned by GET /v2/authenticated-user>
CANTONFLOW_SUPPLIER_USER_ID=<same Ledger API user ID>
CANTONFLOW_BUYER_USER_ID=<same Ledger API user ID>
CANTONFLOW_REGULATOR_USER_ID=<same Ledger API user ID>
CANTONFLOW_LENDER_A_USER_ID=<same Ledger API user ID>
CANTONFLOW_LENDER_B_USER_ID=<same Ledger API user ID>
CANTONFLOW_SUPPLIER_PARTY=<supplier party>
CANTONFLOW_BUYER_PARTY=<buyer party>
CANTONFLOW_REGULATOR_PARTY=<regulator party>
CANTONFLOW_LENDER_A_PARTY=<lender A party>
CANTONFLOW_LENDER_B_PARTY=<lender B party>
DAR_PATH=.daml/dist/cantonflow-0.1.0.dar
```

Upload:

```bash
npm run devnet:token
bash scripts/upload-dar-devnet.sh
```

Successful upload should return `{}` or an equivalent successful package upload response.

Allocate distinct parties, grant the authenticated Ledger API user `CanActAs` for them using `POST /v2/users/{user-id}/rights`, and execute the full lifecycle:

```bash
npm run devnet:parties
npm run devnet:lifecycle
```

The rights endpoint requires `ParticipantAdmin` or identity-provider-admin authorization. The current shared-validator M2M credential exposes this right; verify it with `GET /v2/users/{user-id}/rights` before granting access.

## Vercel Server Configuration

Vercel environment variables are encrypted server-side, so configure the M2M values there rather than a short-lived `LEDGER_API_TOKEN`. CantonFlow exchanges and caches the access token only within server-side route execution. Do not prefix any Ledger or M2M variable with `NEXT_PUBLIC_`.

Set the role-specific Ledger API user IDs to the `id` from `GET /v2/authenticated-user`; for the current shared-validator credential this is the same service user for each role, authorized with `CanActAs` for the five distinct parties. The application still derives its requested role from the authenticated CantonFlow user session.

## App JSON API Integration

The Next.js app includes server-side Canton routes. They do not use browser tokens.

Check whether required DevNet environment is configured:

```bash
curl http://localhost:3000/api/canton/status
```

Submit an `InvoiceRequest` to DevNet through the app server:

```bash
curl -X POST http://localhost:3000/api/canton/invoice-requests \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceId": "receivable-001",
    "invoiceNumber": "INV-2026-004",
    "buyerProfile": "Investment-grade manufacturing buyer",
    "amount": "320000.0",
    "currency": "USD",
    "dueDate": "2026-08-30",
    "requestedAdvance": "252000.0",
    "maximumDiscountRate": "4.5"
  }'
```

Successful submission returns the DevNet `updateId` and `completionOffset`.

Additional server-side workflow routes:

- `POST /api/canton/invites`
- `POST /api/canton/bids`
- `POST /api/canton/agreements`
- `POST /api/canton/settlements`

These require the relevant contract IDs returned or queried after the previous ledger step.

## Local Ledger Proof Path

This is the path to keep building while waiting for Seaport org access. It uses the same DAR and JSON API style as DevNet.

Prerequisite: Java must be installed and available as `java`.

Start local Canton sandbox with the CantonFlow DAR and JSON API:

```bash
bash scripts/start-local-ledger.sh
```

In another terminal, allocate local parties:

```bash
bash scripts/setup-local-parties.sh
cat tmp/cantonflow-local-parties.json
```

Create a local app env from `.env.devnet.example`:

```env
JSON_LEDGER_API_URL=http://localhost:7575
LEDGER_API_TOKEN=
CANTONFLOW_ALLOW_UNAUTHENTICATED_JSON_API=true
CANTONFLOW_PACKAGE_ID=d26e00e71f06ecd7dac3746c13f5d347ed0faae6e0fa0c6a9e385486a02b98c0
CANTONFLOW_SUPPLIER_USER_ID=supplier
CANTONFLOW_BUYER_USER_ID=buyer
CANTONFLOW_REGULATOR_USER_ID=regulator
CANTONFLOW_LENDER_A_USER_ID=lender-a
CANTONFLOW_LENDER_B_USER_ID=lender-b
CANTONFLOW_SUPPLIER_PARTY=<supplier from tmp/cantonflow-local-parties.json>
CANTONFLOW_BUYER_PARTY=<buyer from tmp/cantonflow-local-parties.json>
CANTONFLOW_REGULATOR_PARTY=<regulator from tmp/cantonflow-local-parties.json>
CANTONFLOW_LENDER_A_PARTY=<lenderA from tmp/cantonflow-local-parties.json>
CANTONFLOW_LENDER_B_PARTY=<lenderB from tmp/cantonflow-local-parties.json>
```

Then run:

```bash
npm run dev
curl http://localhost:3000/api/canton/status
```

## Local On-Ledger Proof Captured

The local Canton sandbox flow has been executed through the app server routes. This proves the Daml package and JSON API integration work before DevNet deployment.

Package ID:

```text
d26e00e71f06ecd7dac3746c13f5d347ed0faae6e0fa0c6a9e385486a02b98c0
```

| Step | API route | Update ID | Offset |
| --- | --- | --- | --- |
| `InvoiceRequest` created | `/api/canton/invoice-requests` | `1220ad340409895ce5c34e9a13da9d7834d1ee1cab03d71e72781f417083f7c6b7c0` | `20` |
| `LenderInvite` created | `/api/canton/invites` | `1220ad144d919550a39a8cecde91eeda5fb5328aca7eaa362900bfa10b686255d882` | `23` |
| `FundingBid` submitted | `/api/canton/bids` | `1220fac191b01932d9d9851e5cdffe5dda4cc6cdade6012b61cda487d6b34380ad02` | `26` |
| `FundingAgreement` accepted | `/api/canton/agreements` | `1220dbd129e3d533e903bf1d4b9767e741609e43608f005d61acba252c2b98c1fbc4` | `29` |

## Live DevNet Status

The DAR and complete two-lender RFQ lifecycle have been executed on the Seaport `5N Sandbox` Canton DevNet validator. Package ID, update IDs, and completion offsets are recorded in the repository [README](../README.md#canton-devnet-proof).

The Vercel deployment connects to the validator through server-only M2M credentials. Browser sessions are authenticated and bound to one configured Canton role; Ledger API credentials are never exposed to client code.
