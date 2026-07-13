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
- Frontend workflow: supplier invoice upload, lender private bid, supplier acceptance, regulator metadata view
- Architecture doc: `docs/CANTON_ARCHITECTURE.md`
- DevNet upload helper: `scripts/upload-dar-devnet.sh`

Not done yet:

- Canton DevNet validator/VPN access configured
- DAR uploaded to DevNet
- On-ledger transaction proof captured

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

Generate an OAuth2 token according to your Keycloak/validator setup and set:

```bash
LEDGER_API_TOKEN=...
JSON_LEDGER_API_URL=http://json-ledger-api.localhost:8080
CANTONFLOW_PACKAGE_ID=<main package id from inspect-dar>
CANTONFLOW_SUPPLIER_USER_ID=<supplier user id>
CANTONFLOW_LENDER_USER_ID=<lender user id>
CANTONFLOW_SUPPLIER_PARTY=<supplier party>
CANTONFLOW_BUYER_PARTY=<buyer party>
CANTONFLOW_REGULATOR_PARTY=<regulator party>
CANTONFLOW_LENDER_PARTY=<lender party>
DAR_PATH=.daml/dist/cantonflow-0.1.0.dar
```

Upload:

```bash
bash scripts/upload-dar-devnet.sh
```

Successful upload should return `{}` or an equivalent successful package upload response.

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
    "minimumDiscountRate": "4.5",
    "visibility": {
      "buyerVisibleToLenders": false,
      "invoicePdfVisibleToLenders": false,
      "regulatorCanSeeCommercialTerms": false
    }
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
CANTONFLOW_LENDER_USER_ID=lender
CANTONFLOW_SUPPLIER_PARTY=<supplier from tmp/cantonflow-local-parties.json>
CANTONFLOW_BUYER_PARTY=<buyer from tmp/cantonflow-local-parties.json>
CANTONFLOW_REGULATOR_PARTY=<regulator from tmp/cantonflow-local-parties.json>
CANTONFLOW_LENDER_PARTY=<lender from tmp/cantonflow-local-parties.json>
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
| `InvoiceRequest` created | `/api/canton/invoice-requests` | `122097e25256a541f06c27ce4da57babb80ef6eb48161c5cc5b8fa867df5b8ab16b5` | `17` |
| `LenderInvite` created | `/api/canton/invites` | `12200d4bb126c762a3b48197db2ab7e7aaf7a0458c13c264a95ec2aa2bce34036939` | `20` |
| `FundingBid` submitted | `/api/canton/bids` | `1220be6483f710f7d6dd1a88f22f9c3ab5de348dd3c393ef7fa76cc60d3d04743005` | `23` |
| `FundingAgreement` accepted | `/api/canton/agreements` | `122079df4bcb87e3e14ae5dda290c3101a128c1ddf425c5f9950695c67d69fe84139` | `26` |
| `SettlementInstruction` prepared | `/api/canton/settlements` | `12209626362a513904a03fee188d79ec1e8e3d1fec2b2d2254dd652cf25ab02e06e0` | `29` |

The same route sequence should be repeated against the Seaport shared DevNet validator after org access is enabled. Replace the local update IDs with DevNet update IDs in the final submission.

## On-Ledger Proof We Need For Submission

Capture these artifacts:

- Screenshot or terminal output of successful DAR upload.
- Package ID from `daml damlc inspect-dar` or `dpm damlc inspect-dar`.
- At least one created `InvoiceRequest` contract on DevNet.
- At least one exercised `SubmitFundingBid` choice.
- At least one exercised `AcceptBid` choice creating `FundingAgreement`.
- Optional: `PrepareSettlement` creating `SettlementInstruction`.
- Update IDs / completion offsets from JSON Ledger API responses.
- Screenshot from frontend showing the same lifecycle.

## Submission Proof Format

Add this to README before final submission:

```md
## Canton DevNet Proof

- DevNet validator: <validator identifier or URL>
- DAR package ID: <package id>
- InvoiceRequest update ID: <update id>
- FundingBid update ID: <update id>
- FundingAgreement update ID: <update id>
- SettlementInstruction update ID: <update id>
- DevNet proof screenshots: <links>
```

## Immediate Critical Path

1. Install Daml/DPM.
2. Run `./scripts/install-dpm.sh`.
3. Run `HOME=$PWD/.home .tools/dpm/dpm build`.
4. Get DevNet validator/VPN/onboarding access.
5. Upload DAR.
6. Execute the CantonFlow workflow on-ledger.
7. Update README/deck/video with DevNet proof.
