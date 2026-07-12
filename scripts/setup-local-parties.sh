#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LEDGER_HOST="${LEDGER_HOST:-localhost}"
LEDGER_PORT="${LEDGER_PORT:-6865}"
OUTPUT_FILE="${OUTPUT_FILE:-${ROOT_DIR}/tmp/cantonflow-local-parties.json}"
SETUP_DAR_PATH="${ROOT_DIR}/local-ledger/.daml/dist/cantonflow-local-ledger-0.1.0.dar"

mkdir -p "$(dirname "${OUTPUT_FILE}")"

(
  cd "${ROOT_DIR}/local-ledger"
  HOME="${ROOT_DIR}/.home" "${ROOT_DIR}/.tools/dpm/dpm" build
)

HOME="${ROOT_DIR}/.home" "${ROOT_DIR}/.tools/dpm/dpm" script \
  --ledger-host "${LEDGER_HOST}" \
  --ledger-port "${LEDGER_PORT}" \
  --dar "${SETUP_DAR_PATH}" \
  --script-name Setup:setupParties \
  --output-file "${OUTPUT_FILE}"

echo "Wrote local parties to ${OUTPUT_FILE}"
