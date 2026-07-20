#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LEDGER_HOST="${LEDGER_HOST:-localhost}"
LEDGER_PORT="${LEDGER_PORT:-6865}"
OUTPUT_FILE="${OUTPUT_FILE:-${ROOT_DIR}/tmp/cantonflow-local-parties.json}"
SETUP_DAR_PATH="${ROOT_DIR}/local-ledger/.daml/dist/cantonflow-local-ledger-0.1.0.dar"
LENDERS_OUTPUT_FILE="${OUTPUT_FILE}.lenders"
REPROVISION_PARTIES="${LOCAL_REPROVISION_PARTIES:-false}"

mkdir -p "$(dirname "${OUTPUT_FILE}")"

if [[ "${REPROVISION_PARTIES}" != "true" ]] && [[ -s "${OUTPUT_FILE}" ]] && node -e 'const fs = require("fs"); const parties = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); process.exit(parties.lenderA && parties.lenderB ? 0 : 1)' "${OUTPUT_FILE}"; then
  echo "Local party configuration already includes lender A and lender B."
  exit 0
fi

(
  cd "${ROOT_DIR}/local-ledger"
  HOME="${ROOT_DIR}/.home" "${ROOT_DIR}/.tools/dpm/dpm" build
)

if [[ "${REPROVISION_PARTIES}" != "true" ]] && [[ -s "${OUTPUT_FILE}" ]]; then
  HOME="${ROOT_DIR}/.home" "${ROOT_DIR}/.tools/dpm/dpm" script \
    --ledger-host "${LEDGER_HOST}" \
    --ledger-port "${LEDGER_PORT}" \
    --dar "${SETUP_DAR_PATH}" \
    --script-name Setup:setupLenders \
    --output-file "${LENDERS_OUTPUT_FILE}"

  node - "${OUTPUT_FILE}" "${LENDERS_OUTPUT_FILE}" <<'NODE'
const fs = require("fs");
const [partiesPath, lendersPath] = process.argv.slice(2);
const parties = JSON.parse(fs.readFileSync(partiesPath, "utf8"));
const lenders = JSON.parse(fs.readFileSync(lendersPath, "utf8"));
fs.writeFileSync(partiesPath, `${JSON.stringify({ ...parties, ...lenders }, null, 2)}\n`);
fs.unlinkSync(lendersPath);
NODE
else
  HOME="${ROOT_DIR}/.home" "${ROOT_DIR}/.tools/dpm/dpm" script \
    --ledger-host "${LEDGER_HOST}" \
    --ledger-port "${LEDGER_PORT}" \
    --dar "${SETUP_DAR_PATH}" \
    --script-name Setup:setupParties \
    --output-file "${OUTPUT_FILE}"
fi

echo "Wrote local parties to ${OUTPUT_FILE}"
