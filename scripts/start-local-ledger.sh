#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
JSON_API_PORT="${JSON_API_PORT:-7575}"
DAR_PATH="${DAR_PATH:-.daml/dist/cantonflow-0.1.0.dar}"

if ! command -v java >/dev/null 2>&1; then
  echo "Java is required to run the local Canton sandbox." >&2
  echo "Install a JDK, then rerun this script." >&2
  exit 1
fi

if [[ ! -x "${ROOT_DIR}/.tools/dpm/dpm" ]]; then
  "${ROOT_DIR}/scripts/install-dpm.sh"
fi

HOME="${ROOT_DIR}/.home" "${ROOT_DIR}/.tools/dpm/dpm" build

exec env HOME="${ROOT_DIR}/.home" "${ROOT_DIR}/.tools/dpm/dpm" sandbox \
  --json-api-port "${JSON_API_PORT}" \
  --dar "${ROOT_DIR}/${DAR_PATH}"
