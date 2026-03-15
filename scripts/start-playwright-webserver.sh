#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cleanup_port() {
  local port="$1"
  local pids=""
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN -Pn 2>/dev/null || true)"
  if [[ -z "$pids" ]]; then
    return 0
  fi

  for pid in $pids; do
    local cmd=""
    cmd="$(ps -p "$pid" -o args= 2>/dev/null || true)"
    if [[ "$cmd" == *"$ROOT_DIR"* ]] || [[ "$cmd" == *"netlify dev"* ]] || [[ "$cmd" == *"vite preview"* ]]; then
      kill "$pid" 2>/dev/null || true
      sleep 1
      if kill -0 "$pid" 2>/dev/null; then
        kill -9 "$pid" 2>/dev/null || true
      fi
    fi
  done
}

cleanup_port 3000
cleanup_port 8888

if [[ "${1:-}" == "preview" ]]; then
  exec npx --yes netlify dev --command "npx vite preview --port 3000 --strictPort" --target-port 3000
fi

exec npx --yes netlify dev
