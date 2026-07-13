#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

HOME="${ROOT_DIR}/.home" "${ROOT_DIR}/.tools/dpm/dpm" build

(
  cd "${ROOT_DIR}/test"
  HOME="${ROOT_DIR}/.home" "${ROOT_DIR}/.tools/dpm/dpm" test
)
