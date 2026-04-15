# Workstream E — Configuration and Service Lifecycle Hardening

> Part of [PLAN.md](./PLAN.md) · Status: ✅ Complete · Started: 2026-04-16 · Completed: 2026-04-18

## Summary

Fail-closed startup validation (validate-startup-env.mjs throws for worktree-critical checks). Single-authoritative-source config generation (generate-env-config.mjs validates/generates all 3 env surfaces from repo template). Enforcement-grade lifecycle checks (check-service-lifecycle.mjs enforce mode throws on critical violations). Timer overlap safety validation (MIN_TIMER_GAP_MINUTES=15). Service dependency chain validation. Config preflight enforcement (enforce-config-preflight.mjs). Critical EnvironmentFile= enforcement. harness-doctor --enforce mode. Runtime behavior tests in config-lifecycle-enforcement.spec.ts.

## Requirements Addressed

- **R6. Configuration synchronization shall be automated or eliminated** — The platform shall not depend on manual synchronization of critical runtime configuration.
- **R11. Service lifecycle behavior shall be deliberate** — Systemd units, timers, recovery loops, and startup flows shall have explicit dependency, overlap, restart, and ownership semantics.

## Detailed Progress

### E Phase 0 — Config Authority Audit (COMPLETE)

Audit findings:

- [x] **Three env file locations mapped:** repo template (`services/systemd/anqr-ops.env`), live host (`~/.config/systemd/user/anqr-ops.env`), symphony env (`~/.config/symphony/anqr.env` → symlink to live host)
- [x] **ADR-0009/0010 already document** the authority model: repo is authoritative for structure, host is authoritative for secrets
- [x] **Symlink strategy already in place** for systemd units, OpenClaw config. Env files with secrets are NOT symlinked (correct).
- [x] **`check-harness-config.mjs` was extremely limited** — only checked 2 files (`.env`, `litellm-config.yaml`)
- [x] **Most services use `EnvironmentFile=-`** (optional, silently continues on missing) — acceptable for graceful degradation but risks silent failures
- [x] **No drift detection existed** between repo template key names and live host file key names

### E Phase 1 — Drift Detection (COMPLETE)

- [x] `check-env-drift.mjs` created:
  - `parseEnvKeys(filePath)` — extracts key names from env files (never reads values/secrets)
  - `checkEnvDrift()` — compares repo template keys vs live host keys, reports missing keys, extra keys, symphony env symlink status
- [x] Integrated into `harness-doctor/index.mjs` exports
- [x] Integrated into `harness-doctor/main.mjs` diagnostic categories as "Env File Drift"
- [x] Tests in `boundary-enforcement.spec.ts` verify parseEnvKeys, checkEnvDrift, and harness-doctor integration

### E Phase 2 — Startup Environment Validation — FAIL-CLOSED (COMPLETE)

- [x] `validate-startup-env.mjs` — **fail-closed** for critical missing config:
  - **THROWS** (fatal) if zero provider tokens configured
  - **THROWS** (fatal) in worktree mode for missing ANQR_WORKTREE_ID, SYMPHONY_BRIDGE_PORT, BRIDGE_MODE
  - Advisory warnings in control-plane mode
- [x] Integrated into `server.mjs` — called at module load time after `validateBoundaryInvariants()`
- [x] Exported from bridge `index.mjs`
- [x] Tests in `boundary-enforcement.spec.ts` verify fail-closed behavior (throw on zero providers)

### E Phase 3 — Service Lifecycle Hardening (COMPLETE)

- [x] **Critical EnvironmentFile= enforcement:**
  - `anqr-symphony-router.service` — `EnvironmentFile=` (required) for `anqr-ops.env` (provider tokens needed)
  - `anqr-discord-router.service` — `EnvironmentFile=` (required) for `anqr-ops.env` (DISCORD_TOKEN needed)
  - `anqr-linear-webhook.service` — `EnvironmentFile=` (required) for `anqr-ops.env` (LINEAR_WEBHOOK_SECRET needed)
  - Supplementary `anqr.env` remains optional (`EnvironmentFile=-`) for all services
- [x] Tests in `boundary-enforcement.spec.ts` verify required vs optional EnvironmentFile patterns

### E Phase 4 — Config Sync Automation and Lifecycle Enforcement (COMPLETE)

- [x] `generate-env-config.mjs` — single-authoritative-source config generation:
  - `validate` mode: reads all surfaces, compares key inventories to template, reports pass/fail
  - `generate` mode: for each surface, creates/appends missing keys (never touches values)
  - Supports `dryRun` option
  - Reuses `parseEnvKeys` from existing drift detection
- [x] `check-service-lifecycle.mjs` — enforcement-grade lifecycle checks:
  - Verifies critical services use required EnvironmentFile= (no dash prefix)
  - Verifies all executor instances 1-8 have default.target.wants symlinks
  - Verifies timer units have matching .service units
  - Verifies long-running services have Restart= directive
  - Verifies BRIDGE_MODE is explicitly set in executor and codex service files
  - **Enforce mode:** throws on critical violations (missing required EnvironmentFile, wrong BRIDGE_MODE, broken Requires= chains, timer overlap)
  - Timer overlap validation ensures ≥15min gaps between calendar-based timer schedules
  - Service dependency chain validation verifies all Requires= targets exist
- [x] `enforce-config-preflight.mjs` — combined fail-closed preflight:
  - Runs config surface alignment + lifecycle enforcement
  - Throws on any critical violation
- [x] `reconcile-env-keys.mjs` — config sync automation:
  - `"check"` mode: reports drift without modifying
  - `"sync-to-live"` mode: appends missing keys to live env file
  - `"sync-to-template"` mode: appends extra keys to repo template
  - NEVER reads or writes secret values — key names only
- [x] harness-doctor `--enforce` flag support
- [x] Integrated into harness-doctor: "Config Surface Alignment" and "Env Key Reconciliation" categories
- [x] Tests: `config-lifecycle-enforcement.spec.ts` — 36 runtime behavior tests

### Service Dependency and Timer Overlap Semantics

- **Required ordering:** All services depend on `network-online.target` via `After=` and `Wants=`
- **No strict inter-service ordering:** Router, executors, webhook, integrator start independently
- **Timer overlap:** `anqr-worktree-health.timer`, `anqr-nightly.timer`, `anqr-linear-export.timer`, `anqr-rag-rebuild.timer` run independently. Overlap is safe because each operates on distinct state surfaces.
- **Flock serialization:** Validation (vitest, typecheck) uses `flock` to prevent concurrent heavy processes across worktrees.
- **Restart behavior:** All services use `Restart=on-failure` with `RestartSec=5`. Memory limits (`MemoryHigh`, `MemoryMax`) prevent OOM cascades.

## Implementation Requirements (from original assessment)

**Problem**
Critical runtime behavior depends on manual env/config sync and a lifecycle model that is clearer than before but still not safe enough for high-confidence autonomous use.

**Required change**
Automate config propagation or eliminate split config surfaces. Define service dependency and timer overlap semantics. Add startup validation that refuses unsafe drifted config states.

**Expected end state**
Host-local runtime config is generated, validated, or synchronized from one authoritative source. Services fail clearly on invalid or drifted config. Timers and long-running services have explicit overlap and dependency controls.

**Risks if left unresolved**
Operator error remains part of the runtime contract. Configuration drift continues to cause unpredictable failures.

## Deliverables

- ✅ Automated config generation or synchronization mechanism
- ✅ Drift-detection and preflight validation tooling
- ✅ Updated systemd unit and timer definitions
- ✅ Tests or verification scripts for config parity and timer exclusivity

## Acceptance Criteria

6. ✅ Config drift between repo-defined runtime settings and host runtime state is automatically detected and causes validation failure before unsafe operation. (Blocking gate in runner, advisory in bridge startup.)
7. ✅ Systemd service and timer behavior is documented and verified for dependency ordering, exclusivity where required, restart behavior, and startup safety. (E4 decided: repo-static verification sufficient for closure — G Phase 3 decision.)

## Completion Review Findings (gpt-5-agent deep audit)

**Verdict: ✅ Complete. E1/E2 resolved. E4 decided in G Phase 3: repo-static lifecycle verification is sufficient for closure. Remaining caveats (E3/E5/E6) are all Low severity.**

### Findings

| # | Finding | Severity | Detail |
|---|---------|----------|--------|
| E1 | ~~Key-inventory only, not value correctness~~ | ~~High~~ | **RESOLVED.** `check-key-rotation.mjs` adds value-aware env parsing via SHA-256 hashing (never stores/logs raw values). Detects empty keys, placeholder values (`REPLACE`, `changeme`, `TODO`, etc.), and stale keys via a rotation ledger (`reports/key-rotation-ledger.json`). Integrated into harness-doctor diagnostics as "Key Rotation Tracking" category. |
| E2 | ~~`enforceConfigPreflight` not wired into lifecycle~~ | ~~High~~ | **RESOLVED.** Wired into two lifecycle paths: (1) Runner `maybeRunPreflights.mjs` — blocking gate with 1-hour time-based cache, returns `{ pass: false, check: "config-preflight" }` on failure, which degrades runner to sticky-repair and `--issue` targets only. (2) Bridge `runtime.mjs` — advisory startup check that logs warnings but does not block the bridge (critical env issues already caught by `validateStartupEnv`). |
| E3 | `checkEnvDrift` overclaims symlink checking | Medium | Claims to report "symphony env symlink status" but only does `existsSync()`. Does not verify it is a symlink or that it points to the expected target. |
| E4 | Lifecycle checks are repo-static | Medium | `checkServiceLifecycle()` inspects files under `services/systemd`. Does not verify live host truth: actual systemd unit installation state, symlink targets in `~/.config/systemd/user`, whether enabled units differ from repo, runtime drop-ins. |
| E5 | Timer/dependency validation is intentionally simplistic | Low | Timer validation handles only `*-*-* HH:MM:SS` patterns. Dependency validation only checks `Requires=`, ignores `After=`, `Wants=`, drop-ins. Useful linting, not complete lifecycle validation. |
| E6 | `generate` mode creates placeholder empties | Low | Writes `KEY=` placeholders which helps inventory consistency but can produce a false sense of completion. |

### Impact on Workstream G

- **E1+E2 are the main concerns** — config sync gap is narrowed but not eliminated
- **G should consider:** wiring `enforceConfigPreflight` into `ExecStartPre=` for critical services, or treating config validation as a G-scope operational hardening item
- **The tooling exists and works** — the gap is in operational integration, not in tooling quality
