#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env.devnet"
OUTPUT_FILE="${ROOT_DIR}/tmp/cantonflow-devnet-parties.json"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing .env.devnet. Copy .env.devnet.example and configure DevNet credentials." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

if [[ -z "${JSON_LEDGER_API_URL:-}" || -z "${LEDGER_API_TOKEN:-}" ]]; then
  echo "Missing JSON_LEDGER_API_URL or LEDGER_API_TOKEN. Run npm run devnet:token first." >&2
  exit 1
fi

if [[ -e "${OUTPUT_FILE}" ]]; then
  echo "${OUTPUT_FILE} already exists. Refusing to allocate duplicate parties." >&2
  exit 1
fi

base_url="${JSON_LEDGER_API_URL%/}"
prefix="${CANTONFLOW_DEVNET_PARTY_PREFIX:-cantonflow}"
roles=(supplier buyer regulator lender-a lender-b)
declare -A parties

for role in "${roles[@]}"; do
  hint="${prefix}-${role}"
  response="$(curl -fsS -X POST "${base_url}/v2/parties" \
    -H "Authorization: Bearer ${LEDGER_API_TOKEN}" \
    -H 'Content-Type: application/json' \
    --data "{\"partyIdHint\":\"${hint}\"}")"

  party="$(node -e '
const input = process.argv[1];
try {
  const payload = JSON.parse(input);
  const party = payload.party ?? payload.partyDetails?.party ?? payload.details?.party;
  if (typeof party !== "string" || party.length === 0) process.exit(1);
  process.stdout.write(party);
} catch { process.exit(1); }
' "${response}")" || {
    echo "Could not read the allocated Party ID for ${role}." >&2
    exit 1
  }
  parties["${role}"]="${party}"
done

mkdir -p "${ROOT_DIR}/tmp"
node -e '
const output = process.argv[1];
const parties = JSON.parse(process.argv[2]);
require("fs").writeFileSync(output, `${JSON.stringify(parties, null, 2)}\n`);
' "${OUTPUT_FILE}" "$(node -e '
const entries = process.argv.slice(1).map((entry) => entry.split("=", 2));
process.stdout.write(JSON.stringify(Object.fromEntries(entries)));
' "supplier=${parties[supplier]}" "buyer=${parties[buyer]}" "regulator=${parties[regulator]}" "lenderA=${parties[lender-a]}" "lenderB=${parties[lender-b]}")"

echo "Allocated DevNet parties. Public Party IDs were saved to tmp/cantonflow-devnet-parties.json."
