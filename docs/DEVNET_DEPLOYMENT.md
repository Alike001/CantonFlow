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

You need:

- DevNet validator request approved.
- VPN credentials for the sponsoring validator / SV.
- DevNet onboarding secret.
- Working Docker setup for the validator stack.
- OAuth2 token with package upload/admin rights.

The official DevNet guide says the validator request starts at:

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

Follow the official DevNet quickstart guide. The key steps are:

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

## Upload CantonFlow DAR

Copy env template:

```bash
cp .env.devnet.example .env.devnet
```

Generate an OAuth2 token according to your Keycloak/validator setup and set:

```bash
LEDGER_API_TOKEN=...
JSON_LEDGER_API_URL=http://json-ledger-api.localhost:8080
DAR_PATH=.daml/dist/cantonflow-0.1.0.dar
```

Upload:

```bash
bash scripts/upload-dar-devnet.sh
```

Successful upload should return `{}` or an equivalent successful package upload response.

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
