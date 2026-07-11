#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env.devnet"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

JSON_LEDGER_API_URL="${JSON_LEDGER_API_URL:-}"
LEDGER_API_TOKEN="${LEDGER_API_TOKEN:-}"
DAR_PATH="${DAR_PATH:-.daml/dist/cantonflow-0.1.0.dar}"
VET_ALL_PACKAGES="${VET_ALL_PACKAGES:-true}"

if [[ -z "${JSON_LEDGER_API_URL}" ]]; then
  echo "Missing JSON_LEDGER_API_URL. Copy .env.devnet.example to .env.devnet and fill it." >&2
  exit 1
fi

if [[ -z "${LEDGER_API_TOKEN}" ]]; then
  echo "Missing LEDGER_API_TOKEN. Generate an OAuth2 token for your DevNet validator first." >&2
  exit 1
fi

if [[ ! -f "${ROOT_DIR}/${DAR_PATH}" ]]; then
  echo "DAR not found at ${ROOT_DIR}/${DAR_PATH}." >&2
  echo "Run HOME=\$PWD/.home .tools/dpm/dpm build before uploading." >&2
  exit 1
fi

UPLOAD_PATH="/v2/dars"
if [[ "${VET_ALL_PACKAGES}" == "true" ]]; then
  UPLOAD_PATH="${UPLOAD_PATH}?vetAllPackages=true"
fi

echo "Uploading ${DAR_PATH} to ${JSON_LEDGER_API_URL}${UPLOAD_PATH}"

curl -fsS -X POST "${JSON_LEDGER_API_URL}${UPLOAD_PATH}" \
  -H "Authorization: Bearer ${LEDGER_API_TOKEN}" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @"${ROOT_DIR}/${DAR_PATH}"

echo
echo "DAR upload request completed."
