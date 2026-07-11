#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DPM_VERSION="${DPM_VERSION:-1.0.21}"
DPM_ARCHIVE="dpm-${DPM_VERSION}-linux-amd64.tar.gz"
DPM_URL="https://github.com/digital-asset/dpm/releases/download/${DPM_VERSION}/${DPM_ARCHIVE}"

mkdir -p "${ROOT_DIR}/.tools/dpm"

curl -L --fail --show-error "${DPM_URL}" -o "/tmp/${DPM_ARCHIVE}"
tar -xzf "/tmp/${DPM_ARCHIVE}" -C "${ROOT_DIR}/.tools/dpm"

HOME="${ROOT_DIR}/.home" "${ROOT_DIR}/.tools/dpm/dpm" install
HOME="${ROOT_DIR}/.home" "${ROOT_DIR}/.tools/dpm/dpm" --version
