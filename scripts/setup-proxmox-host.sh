#!/usr/bin/env bash
# One-time setup on the Proxmox host (run as root).
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/hockeynights}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"

echo "==> Installing Docker"
if ! command -v docker >/dev/null 2>&1; then
  apt-get update
  apt-get install -y ca-certificates curl
  curl -fsSL https://get.docker.com | sh
fi

if ! docker compose version >/dev/null 2>&1; then
  apt-get install -y docker-compose-plugin
fi

echo "==> Creating deploy user: ${DEPLOY_USER}"
if ! id "${DEPLOY_USER}" >/dev/null 2>&1; then
  useradd -m -s /bin/bash "${DEPLOY_USER}"
fi
usermod -aG docker "${DEPLOY_USER}"

echo "==> Preparing deploy directory: ${DEPLOY_DIR}"
mkdir -p "${DEPLOY_DIR}"
chown "${DEPLOY_USER}:${DEPLOY_USER}" "${DEPLOY_DIR}"

echo "==> Done"
echo "Next steps:"
echo "  1. Add the GitHub Actions SSH public key to ~${DEPLOY_USER}/.ssh/authorized_keys"
echo "  2. Configure GitHub secrets: SSH_HOST, SSH_USER=${DEPLOY_USER}, SSH_PRIVATE_KEY, GHCR_PULL_TOKEN"
echo "  3. Push to develop or preprod to trigger the first deploy"
