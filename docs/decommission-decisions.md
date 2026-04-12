# Decommission Decisions

## Removed

### Watchdog Git Rollback

- **What:** Automatic `git reset --hard` on service failure
- **Why removed:** Destructive operation that could silently lose work
- **Replaced with:** Safe restart + quarantine + structured evidence
- **File:** `harness/ops/runtime/watchdog/bridge-watchdog/rollback-and-restart.mjs`

### Inline Secrets in Service Files

- **What:** Hardcoded API keys in `openclaw-gateway.service`
- **Why removed:** Security risk — secrets must not be in version control
- **Replaced with:** `EnvironmentFile=` directives loading from host env files
- **File:** `services/systemd/openclaw-gateway.service`

### Always-Pass Readiness Checks

- **What:** `check-systemd-services.mjs` returning `pass: true` always
- **Why removed:** Readiness checks must be truthful in production
- **Replaced with:** Mode-aware checks (production requires critical services active)
- **File:** `harness/ops/harness-doctor/check-systemd-services.mjs`

### Busy-Wait State Lock

- **What:** Tight busy-wait loop in `acquire-state-lock.mjs`
- **Why removed:** CPU-wasteful under contention
- **Replaced with:** Exponential backoff with diagnostics
- **File:** `harness/ops/core/symphony-state/acquire-state-lock.mjs`

### Nightly Dry-Run Default

- **What:** `anqr-nightly.service` running with `--dry-run` flag
- **Why fixed:** Misleading — appeared to run nightly ops but did nothing
- **Replaced with:** Actual execution (flag removed), with clear comment
- **File:** `services/systemd/anqr-nightly.service`

## Retained

### Direct Push to Main

- **What:** Integrator pushes directly to `origin/main`
- **Why retained:** Single-operator host, serial processing, evidence-tracked
- **Safeguards added:** Pre-integration checks, evidence records, conflict handling
- **Review trigger:** Add protected branch if more operators join

### In-Memory Watchdog State

- **What:** Watchdog trigger history, restart timestamps in memory
- **Why retained:** Watchdog is a monitoring service — restart clears state safely
- **Risk:** Watchdog restart loses trigger rate history (acceptable)

### Worktree Recovery Daemon

- **What:** `anqr-symphony-worktree-recovery.service`
- **Why retained:** Active repair capability needed for 8-worktree fleet
- **Improvement:** Now monitored by expanded watchdog scope

## Stale Items Cleaned

### `anqr-rag-rebuild-linear.service` (symlink)

- **Status:** Deleted (was a dangling symlink)
- **Already staged in git**
