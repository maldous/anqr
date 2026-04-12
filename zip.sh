#!/bin/bash

zip -r harness-code.zip harness/
zip -r harness-services.zip services/
zip -r harness-docs.zip docs/
zip -r harness-agents.zip .agents/
zip -r harness-root.zip $(grep harness * | cut -f1 -d: | sort -u)
zip -r harness-markdown.zip *md
zip -r harness-tests.zip tests/

set -Eeuo pipefail

OUT_DIR="harness-openclaw-debug"
ZIP_NAME="harness-openclaw-debug.zip"

rm -rf "$OUT_DIR" "$ZIP_NAME"
mkdir -p "$OUT_DIR"/{meta,cli,config,logs,journal,systemd,state,net}

date -Is > "$OUT_DIR/meta/timestamp.txt"
uname -a > "$OUT_DIR/meta/uname.txt" 2>&1 || true
command -v openclaw > "$OUT_DIR/meta/openclaw-path.txt" 2>&1 || true
openclaw --version > "$OUT_DIR/meta/openclaw-version.txt" 2>&1 || true

# Small, relevant env only
env | grep -E '^(OPENCLAW|ANQR|NODE_ENV|PATH|HOME|USER|SHELL)=' | sort > "$OUT_DIR/meta/env-selected.txt" 2>&1 || true

# OpenClaw diagnostics
openclaw config file > "$OUT_DIR/config/config-file.txt" 2>&1 || true
CFG_PATH="$(head -n 1 "$OUT_DIR/config/config-file.txt" 2>/dev/null | tr -d '\r')"
[ -n "${CFG_PATH:-}" ] && [ -f "${CFG_PATH:-}" ] && cp -a "$CFG_PATH" "$OUT_DIR/config/" || true
[ -f "$HOME/.openclaw/config.json" ] && cp -a "$HOME/.openclaw/config.json" "$OUT_DIR/config/" || true
[ -f "$HOME/.openclaw/openclaw.json" ] && cp -a "$HOME/.openclaw/openclaw.json" "$OUT_DIR/config/" || true
openclaw config validate --json > "$OUT_DIR/config/config-validate.json" 2>&1 || true

openclaw doctor --non-interactive > "$OUT_DIR/cli/doctor.txt" 2>&1 || true
openclaw status --all > "$OUT_DIR/cli/status-all.txt" 2>&1 || true
openclaw status --deep > "$OUT_DIR/cli/status-deep.txt" 2>&1 || true
openclaw health --verbose > "$OUT_DIR/cli/health-verbose.txt" 2>&1 || true
openclaw gateway status > "$OUT_DIR/cli/gateway-status.txt" 2>&1 || true
timeout 15s openclaw logs --json > "$OUT_DIR/logs/openclaw-logs.jsonl" 2>&1 || true

# File logs
find /tmp/openclaw -maxdepth 1 -type f \( -name 'openclaw-*.log' -o -name '*.jsonl' \) -exec cp -a {} "$OUT_DIR/logs/" \; 2>/dev/null || true

# Host state relevant to runtime debugging
ps auxww > "$OUT_DIR/net/ps-auxww.txt" 2>&1 || true
ss -ltnp > "$OUT_DIR/net/ss-ltnp.txt" 2>&1 || true

# Inventory only. No browser cache, extensions, memory, sessions, voice data, credentials, or DBs.
if [ -d "$HOME/.openclaw" ]; then
  find "$HOME/.openclaw" \
    \( \
      -path "$HOME/.openclaw/extensions" -o \
      -path "$HOME/.openclaw/browser" -o \
      -path "$HOME/.openclaw/memory" -o \
      -path "$HOME/.openclaw/sessions" -o \
      -path "$HOME/.openclaw/voice-calls" -o \
      -path "$HOME/.openclaw/credentials" \
    \) -prune -o \
    \( -type f -o -type d \) -print \
    | sort > "$OUT_DIR/state/home-dot-openclaw-inventory.txt"
fi

# Systemd units for OpenClaw and ANQR harness
systemctl --user list-units --all --plain --no-legend > "$OUT_DIR/systemd/list-units.txt" 2>&1 || true
systemctl --user list-unit-files > "$OUT_DIR/systemd/list-unit-files.txt" 2>&1 || true

mapfile -t UNITS < <(
  systemctl --user list-units --all --plain --no-legend 2>/dev/null \
  | awk '{print $1}' \
  | grep -E '^(openclaw|anqr)-.*\.service$' \
  | sort -u
)

for unit in "${UNITS[@]}"; do
  safe_name="${unit//\//_}"
  systemctl --user status "$unit" > "$OUT_DIR/systemd/${safe_name}.status.txt" 2>&1 || true
  systemctl --user cat "$unit" > "$OUT_DIR/systemd/${safe_name}.unit.txt" 2>&1 || true
  journalctl --user -u "$unit" --no-pager -n 5000 > "$OUT_DIR/journal/${safe_name}.journal.txt" 2>&1 || true
done

# Size report before zip
du -sh "$OUT_DIR"/* "$OUT_DIR"/{meta,cli,config,logs,journal,systemd,state,net} 2>/dev/null | sort -h > "$OUT_DIR/meta/size-report.txt" || true
find "$OUT_DIR" -type f | sort > "$OUT_DIR/meta/file-list.txt"

zip -r "$ZIP_NAME" "$OUT_DIR" >/dev/null

echo "Created $ZIP_NAME"
du -sh "$ZIP_NAME"
