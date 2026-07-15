#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
JSON_API_PORT="${JSON_API_PORT:-7575}"
NEXT_PORT="${NEXT_PORT:-3000}"
PARTY_FILE="${ROOT_DIR}/tmp/cantonflow-local-parties.json"
SANDBOX_LOG="${ROOT_DIR}/tmp/cantonflow-sandbox.log"
SANDBOX_PID_FILE="${ROOT_DIR}/tmp/cantonflow-sandbox.pid"
STARTED_SANDBOX=false
REPROVISION_PARTIES="${LOCAL_REPROVISION_PARTIES:-false}"

mkdir -p "${ROOT_DIR}/tmp"

if ! curl -fsS "http://localhost:${JSON_API_PORT}/v2/state/ledger-end" >/dev/null 2>&1; then
  echo "Starting local Canton sandbox on JSON API port ${JSON_API_PORT}..."
  (
    cd "${ROOT_DIR}"
    nohup bash scripts/start-local-ledger.sh >"${SANDBOX_LOG}" 2>&1 &
    echo $! >"${SANDBOX_PID_FILE}"
  )
  STARTED_SANDBOX=true

  for _ in $(seq 1 60); do
    if curl -fsS "http://localhost:${JSON_API_PORT}/v2/state/ledger-end" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done

  if ! curl -fsS "http://localhost:${JSON_API_PORT}/v2/state/ledger-end" >/dev/null 2>&1; then
    echo "Local Canton sandbox did not become ready. Read ${SANDBOX_LOG}." >&2
    exit 1
  fi
else
  echo "Using existing local Canton sandbox on JSON API port ${JSON_API_PORT}."
fi

if [[ "${STARTED_SANDBOX}" == "true" || "${REPROVISION_PARTIES}" == "true" || ! -s "${PARTY_FILE}" ]]; then
  echo "Provisioning local supplier, buyer, two lenders, and regulator parties..."
  bash "${ROOT_DIR}/scripts/setup-local-parties.sh"
else
  echo "Using existing local party configuration at ${PARTY_FILE}."
fi

PACKAGE_ID="$(
  HOME="${ROOT_DIR}/.home" "${ROOT_DIR}/.tools/dpm/dpm" damlc inspect-dar "${ROOT_DIR}/.daml/dist/cantonflow-0.1.0.dar" \
    | sed -n 's/^cantonflow-0\.1\.0-[^ ]* "\([^"]*\)"$/\1/p' \
    | head -n 1
)"

if [[ -z "${PACKAGE_ID}" ]]; then
  echo "Could not determine the CantonFlow package ID from the DAR." >&2
  exit 1
fi

node - "${PARTY_FILE}" "${PACKAGE_ID}" "${ROOT_DIR}/.env.local" <<'NODE'
const fs = require("fs");
const [partyFile, packageId, envFile] = process.argv.slice(2);
const parties = JSON.parse(fs.readFileSync(partyFile, "utf8"));

const values = {
  JSON_LEDGER_API_URL: "http://localhost:7575",
  CANTONFLOW_ALLOW_UNAUTHENTICATED_JSON_API: "true",
  CANTONFLOW_APPLICATION_ID: "cantonflow",
  CANTONFLOW_PACKAGE_ID: packageId,
  CANTONFLOW_SUPPLIER_PARTY: parties.supplier,
  CANTONFLOW_BUYER_PARTY: parties.buyer,
  CANTONFLOW_REGULATOR_PARTY: parties.regulator,
  CANTONFLOW_LENDER_A_PARTY: parties.lenderA,
  CANTONFLOW_LENDER_B_PARTY: parties.lenderB,
};

const existing = fs.existsSync(envFile) ? fs.readFileSync(envFile, "utf8").split(/\r?\n/) : [];
const retained = existing.filter((line) => !Object.hasOwn(values, line.split("=", 1)[0]));
const next = [...retained.filter(Boolean), ...Object.entries(values).map(([key, value]) => `${key}=${value}`), ""];
fs.writeFileSync(envFile, next.join("\n"));
NODE

echo "Wrote local Canton configuration to .env.local."

if lsof -nP -iTCP:"${NEXT_PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Next.js is already listening on http://localhost:${NEXT_PORT}."
  echo "Restart it once to load any newly written .env.local values."
  exit 0
fi

echo "Starting CantonFlow on http://localhost:${NEXT_PORT}..."
echo "Keep this terminal open while developing. Sandbox log: ${SANDBOX_LOG}"
cd "${ROOT_DIR}"
exec npm run dev -- --port "${NEXT_PORT}"
