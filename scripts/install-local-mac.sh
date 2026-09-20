#!/usr/bin/env bash
# Install Yanvar.Editor into ~/dev and build macOS arm64 zip.
set -euo pipefail

DEV_DIR="${HOME}/dev"
REPO_DIR="${DEV_DIR}/Yanvar.Editor"
REPO_URL="https://github.com/moRettDEV/Yanvar.Editor.git"

mkdir -p "${DEV_DIR}"

if [[ -d "${REPO_DIR}/.git" ]]; then
  echo "→ updating ${REPO_DIR}"
  git -C "${REPO_DIR}" fetch origin
  git -C "${REPO_DIR}" checkout main
  git -C "${REPO_DIR}" pull --ff-only origin main
else
  echo "→ cloning into ${REPO_DIR}"
  git clone "${REPO_URL}" "${REPO_DIR}"
fi

cd "${REPO_DIR}"
echo "→ npm ci"
npm ci
echo "→ building mac arm64 (zip)"
CSC_IDENTITY_AUTO_DISCOVERY=false npm run dist:mac

echo
echo "Done."
echo "  Project:  ${REPO_DIR}"
echo "  Build:    ${REPO_DIR}/dist/"
ls -lah "${REPO_DIR}/dist/"*.zip 2>/dev/null || true
echo
echo "Open the .app from the zip (right-click → Open if Gatekeeper blocks)."
