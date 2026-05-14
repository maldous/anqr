#!/usr/bin/env bash
set -euo pipefail

export NVM_DIR=/home/user/.nvm
[ -s /home/user/.nvm/nvm.sh ] && . /home/user/.nvm/nvm.sh

cd /home/user/src/anqr
exec /home/user/.local/bin/serena start-mcp-server \
  --transport streamable-http \
  --port "${SERENA_PORT:-9122}" \
  --project-from-cwd
