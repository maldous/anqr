# Harness Doctor

## Purpose

Operational health-check tool that validates the harness runtime environment: environment variables, systemd services, credit gate, Ollama availability, node_modules, queue state, reports directory, and harness configuration. Supports both advisory (default) and enforcement (`--enforce`) modes.

In enforcement mode, harness-doctor combines config surface alignment (`generate-env-config.mjs validate`) and lifecycle enforcement (`check-service-lifecycle.mjs enforce`) as a fail-closed preflight gate via `enforce-config-preflight.mjs`. See Workstream E for the config/lifecycle hardening context.

## Contents

- 15 immediate files
- 0 child directories

## Key Files

- `check-credit-gate.mjs` — Verifies the credit gate is correctly configured and accessible.
- `check-env-vars.mjs` — Validates required environment variables are set for the current bridge mode.
- `check-harness-config.mjs` — Checks harness configuration integrity (symphony-config, worktree config).
- `check-node-modules.mjs` — Verifies node_modules exists and is not stale.
- `check-ollama.mjs` — Probes Ollama local inference endpoint for availability.
- `check-queue-state.mjs` — Inspects the desired-work queue and integration candidate state.
- `check-reports-dir.mjs` — Ensures the reports output directory exists and is writable.
- `check-systemd-services.mjs` — Validates systemd service unit status, enabled state, and dependency chains.
- `dirname.mjs` — Exports `__dirname` for ESM compatibility.
- `index.mjs` — Re-export facade that assembles the public surface for this directory.
- `is-main.mjs` — Detects whether the module is the main entry point.
- `logger.mjs` — Shared logging helper.
- `main.mjs` — Primary orchestration: runs all checks, collects results, prints summary.
- `root.mjs` — Exports `ROOT`, the repository root path.
- `runtime.mjs` — Executable runtime bootstrap.

## Subdirectories

- No child directories in this directory.

## Usage

```bash
# Advisory mode (default) — reports issues without failing
node harness/ops/harness-doctor/runtime.mjs

# Enforcement mode — fails on critical violations
node harness/ops/harness-doctor/runtime.mjs --enforce
```

## Operational Notes

- Current on-disk inventory: 15 immediate files and 0 child directories.
- The `--enforce` flag triggers `enforce-config-preflight.mjs` which throws on critical violations (missing required EnvironmentFile, wrong BRIDGE_MODE, broken Requires= chains, timer overlap).
- Advisory mode is safe to run at any time and does not modify state.

## Review Focus

Verify that all check modules cover the current service topology and that enforcement mode catches the critical configuration violations identified in Workstream E.
