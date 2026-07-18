#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env.devnet"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing .env.devnet. Copy .env.devnet.example and configure DevNet credentials." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

required=(
  DEVNET_OIDC_TOKEN_URL
  DEVNET_M2M_CLIENT_ID
  DEVNET_M2M_CLIENT_SECRET
  DEVNET_M2M_AUDIENCE
  DEVNET_M2M_SCOPE
)

missing=()
for variable in "${required[@]}"; do
  if [[ -z "${!variable:-}" ]]; then
    missing+=("${variable}")
  fi
done

if (( ${#missing[@]} > 0 )); then
  printf 'Missing DevNet OAuth settings: %s\n' "${missing[*]}" >&2
  exit 1
fi

response="$(curl -fsS -X POST "${DEVNET_OIDC_TOKEN_URL}" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'grant_type=client_credentials' \
  --data-urlencode "client_id=${DEVNET_M2M_CLIENT_ID}" \
  --data-urlencode "client_secret=${DEVNET_M2M_CLIENT_SECRET}" \
  --data-urlencode "audience=${DEVNET_M2M_AUDIENCE}" \
  --data-urlencode "scope=${DEVNET_M2M_SCOPE}")"

token="$(node -e '
const input = process.argv[1];
try {
  const payload = JSON.parse(input);
  if (typeof payload.access_token !== "string" || payload.access_token.length === 0) process.exit(1);
  process.stdout.write(payload.access_token);
} catch { process.exit(1); }
' "${response}")" || {
  echo "Token endpoint returned no access_token." >&2
  exit 1
}

temporary_file="$(mktemp "${ENV_FILE}.XXXXXX")"
trap 'rm -f "${temporary_file}"' EXIT

awk -v token="${token}" '
  /^LEDGER_API_TOKEN=/ { print "LEDGER_API_TOKEN=" token; found = 1; next }
  { print }
  END { if (!found) print "LEDGER_API_TOKEN=" token }
' "${ENV_FILE}" > "${temporary_file}"

mv "${temporary_file}" "${ENV_FILE}"
trap - EXIT

echo "DevNet Ledger API token refreshed in .env.devnet."
