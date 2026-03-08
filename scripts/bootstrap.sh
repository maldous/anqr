#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ZIP="$REPO_ROOT/bootstrap.zip"
TMP=""
STEP=0
FORCE=false
SKIP_NODE=false
SKIP_EMAIL=false
PASSWORD="${BOOTSTRAP_PASSWORD:-}"

# --- Colors ----------------------------------------------------------------
if [[ -t 1 ]]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  CYAN='\033[0;36m'
  BOLD='\033[1m'
  RESET='\033[0m'
else
  RED='' GREEN='' YELLOW='' CYAN='' BOLD='' RESET=''
fi

step()  { STEP=$((STEP+1)); printf "\n${CYAN}[%d]${RESET} ${BOLD}%s${RESET}\n" "$STEP" "$1"; }
ok()    { printf "  ${GREEN}✔${RESET} %s\n" "$1"; }
skip()  { printf "  ${YELLOW}⏭${RESET} %s (already exists, use --force to overwrite)\n" "$1"; }
warn()  { printf "  ${YELLOW}⚠${RESET} %s\n" "$1"; }
fail()  { printf "  ${RED}✖${RESET} %s\n" "$1" >&2; exit 1; }

# --- Helpers ----------------------------------------------------------------

# Copy a file only if it doesn't already exist (or --force is set).
# Usage: safe_cp <src> <dest> [mode]
safe_cp() {
  local src="$1" dest="$2" mode="${3:-}"
  if [[ -f "$dest" ]] && ! $FORCE; then
    skip "$dest"
    return
  fi
  mkdir -p "$(dirname "$dest")"
  cp "$src" "$dest"
  [[ -n "$mode" ]] && chmod "$mode" "$dest"
  ok "$dest"
}

cleanup() {
  if [[ -n "$TMP" && -d "$TMP" ]]; then
    rm -rf "$TMP"
  fi
}
trap cleanup EXIT

# --- Usage ------------------------------------------------------------------
usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS] [PASSWORD]

Automates new-host setup from the encrypted bootstrap.zip.

Options:
  -p, --password PWD  Zip password (or set BOOTSTRAP_PASSWORD env var)
  --force             Overwrite existing files
  --skip-node         Skip Node.js install and npm install
  --skip-email        Skip email config files (.mbsyncrc, .msmtprc, .notmuch-config)
  -h, --help          Show this help

If password is not provided via flag, env var, or positional arg, you will be
prompted interactively.
EOF
  exit 0
}

# --- Parse args -------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --force)         FORCE=true;      shift ;;
    --skip-node)     SKIP_NODE=true;  shift ;;
    --skip-email)    SKIP_EMAIL=true; shift ;;
    -p|--password)   [[ $# -ge 2 ]] || fail "--password requires a value"; PASSWORD="$2"; shift 2 ;;
    -h|--help)       usage ;;
    -*)              fail "Unknown option: $1" ;;
    *)               PASSWORD="$1";   shift ;;
  esac
done

# --- Pre-flight checks ------------------------------------------------------
[[ -f "$ZIP" ]] || fail "bootstrap.zip not found at $ZIP"
command -v unzip >/dev/null || fail "unzip is required but not installed"

if [[ -z "$PASSWORD" ]]; then
  read -rsp "Enter bootstrap.zip password: " PASSWORD
  echo
fi

# --- Extract ----------------------------------------------------------------
step "Extracting bootstrap.zip"
TMP="$(mktemp -d)"
unzip -q -P "$PASSWORD" "$ZIP" -d "$TMP" || fail "Failed to extract bootstrap.zip (wrong password?)"
ok "Extracted to $TMP"

# --- SSH keys ---------------------------------------------------------------
step "Installing SSH keys"
mkdir -p ~/.ssh && chmod 700 ~/.ssh

for key in id_ed25519 id_ed25519_github_private id_ed25519_public; do
  [[ -f "$TMP/ssh/$key" ]]     && safe_cp "$TMP/ssh/$key"     "$HOME/.ssh/$key"     600
  [[ -f "$TMP/ssh/$key.pub" ]] && safe_cp "$TMP/ssh/$key.pub" "$HOME/.ssh/$key.pub" 644
done

safe_cp "$TMP/ssh/config" "$HOME/.ssh/config" 644

# --- Env files --------------------------------------------------------------
step "Installing env files"
safe_cp "$TMP/env"     "$REPO_ROOT/env"
safe_cp "$TMP/env.txt" "$REPO_ROOT/env.txt"

if [[ -f "$REPO_ROOT/env" ]]; then
  # shellcheck disable=SC1091
  set +u; source "$REPO_ROOT/env"; set -u
  ok "Sourced env into current shell"
fi

# --- Symphony / Linear config -----------------------------------------------
step "Installing Symphony config"
safe_cp "$TMP/config/symphony/anqr.env" "$HOME/.config/symphony/anqr.env"

# --- Play Store & Android signing -------------------------------------------
step "Installing Play Store & Android signing keys"
safe_cp "$TMP/play-store-key.json" "$REPO_ROOT/play-store-key.json"

if [[ -d "$REPO_ROOT/android/app" ]]; then
  safe_cp "$TMP/release-key.keystore" "$REPO_ROOT/android/app/release-key.keystore"
else
  warn "android/app/ does not exist — skipping keystore"
fi

# --- Git config -------------------------------------------------------------
step "Installing git config"
safe_cp "$TMP/.gitconfig" "$HOME/.gitconfig"

# --- Email configs (optional) -----------------------------------------------
if $SKIP_EMAIL; then
  step "Skipping email configs (--skip-email)"
else
  step "Installing email configs"
  safe_cp "$TMP/.mbsyncrc"       "$HOME/.mbsyncrc"
  safe_cp "$TMP/.msmtprc"        "$HOME/.msmtprc"        600
  safe_cp "$TMP/.notmuch-config" "$HOME/.notmuch-config"
fi

# --- Node.js & deps (optional) ----------------------------------------------
if $SKIP_NODE; then
  step "Skipping Node.js install (--skip-node)"
else
  step "Installing Node.js and dependencies"

  NODE_VERSION="$(cat "$REPO_ROOT/.nvmrc" 2>/dev/null || echo "25.8.0")"

  if type nvm &>/dev/null; then
    : # nvm already loaded
  elif [[ -s "$HOME/.nvm/nvm.sh" ]]; then
    # shellcheck disable=SC1091
    set +u; source "$HOME/.nvm/nvm.sh"; set -u
  else
    warn "nvm not found — install from https://github.com/nvm-sh/nvm"
    warn "Skipping Node.js install"
    SKIP_NODE=true
  fi

  if ! $SKIP_NODE; then
    nvm install "$NODE_VERSION" 2>&1 | tail -3
    nvm use "$NODE_VERSION"
    ok "Node $(node --version)"

    cd "$REPO_ROOT"
    npm install
    ok "npm install complete"
  fi
fi

# --- Done -------------------------------------------------------------------
printf "\n${GREEN}${BOLD}✅ Bootstrap complete!${RESET}\n"
printf "   Run ${CYAN}make build${RESET} to verify the build.\n"
printf "   Run ${CYAN}npm run test:unit${RESET} to verify tests.\n"
