# ANQR Nightly Operations Pass

## 1. Directory Overview

This directory contains the nightly operations pass automation for the ANQR (Agentic Number Query Runner) harness. It orchestrates a comprehensive pipeline of health checks, maintenance tasks, and quality assurance steps that run on a scheduled basis to ensure the system remains operational and maintainable.

## 2. File Summaries

### Core Infrastructure

- **dirname.mjs** - Node.js `__dirname` polyfill for ESM compatibility using `fileURLToPath`.
- **root.mjs** - Exports `ROOT` constant pointing to the project root (4 directories up from this module).
- **reports-dir.mjs** - Exports `REPORTS_DIR` constant resolving to the `reports/` directory in the project root.
- **latest-report.mjs** - Exports `LATEST_REPORT` constant pointing to `reports/latest.json`.

### Flags and Configuration

- **dry-run.mjs** - Exports `dryRun` boolean flag based on presence of `--dry-run` in process arguments.
- **dry-run-flag.mjs** - Exports `dryRunFlag` string (`" --dry-run"` or empty) for command concatenation.
- **skip-tests.mjs** - Exports `skipTests` boolean flag based on presence of `--skip-tests` in process arguments.
- **skip-sonar.mjs** - Exports `skipSonar` boolean flag based on presence of `--skip-sonar` in process arguments.

### Step Management

- **steps.mjs** - Exports mutable `steps` array that stores results of each pipeline step execution.
- **run-step.mjs** - Exports `runStep(step)` function that executes a step command via `execFileSync`, captures exit code and duration, logs results, and pushes result to `steps` array.

### Pipeline Functions

- **archive-report.mjs** - Exports `archiveReport()` function that copies `latest.json` to `reports/archive/report-{timestamp}.json`.
- **print-summary.mjs** - Exports `printSummary()` function that logs a formatted table of all step results with exit codes, durations, and severity levels.
- **main.mjs** - Main orchestration module that defines the pipeline plan with steps, executes them sequentially, handles blocking step failures, archives the report, prints summary, and exits appropriately.

### Support Modules

- **logger.mjs** - Shared logger for this module, importing from `../../lib/logger.mjs` and exporting `logInfo` and `logError`.
- **runtime.mjs** - Generated runtime carry-forward that imports and executes `main()` with error handling.
- **index.mjs** - Generated facade index that exports all public API members from the decomposed modules.

## 3. Overall Directory Function

This directory serves as the automated nightly operations hub for the ANQR harness. The pipeline executes in the following order:

1. **Git maintenance**: `worktree-prune` and `worktree-repair` clean up stale git worktrees
2. **Harness reporting**: `harness-report` generates the full system health report
3. **Code quality**: `ast-density` checks for AST density anomalies
4. **Testing** (optional): `test-unit-coverage` runs unit tests with coverage (skipped with `--skip-tests`)
5. **SonarQube integration** (optional): `sonar-cleanup`, `sonar-scan`, `sonar-export`, `sonar-linear-audit` when `SONAR_TOKEN` is set
6. **Issue management**: `issue-hygiene` enforces Linear issue labeling standards
7. **Queue maintenance**: `queue-control` processes all queue states
8. **Governance**: `guardian` creates/updates issues for failing checks
9. **Notifications**: `notify` sends Discord notifications to all channels
10. **Performance monitoring**: `latency-report` checks latency baselines

The pipeline uses severity levels:
- **blocking**: Pipeline stops on failure (sonar scans, tests)
- **advisory**: Non-blocking but logged (worktree maintenance, latency)
- **independent**: Always runs regardless of prior failures (hygiene, notify)

Exit codes: 0 for operational success (even with advisory failures), 1 for blocking step failures.

## 4. Usage Instructions

### Running the Nightly Pass

```bash
# Standard run (requires SONAR_TOKEN for full sonar integration)
node ops/orchestration/nightly-ops-pass/runtime.mjs
```

### Dry Run Mode

Test without making actual changes:

```bash
node ops/orchestration/nightly-ops-pass/runtime.mjs --dry-run
```

### Skip Options

```bash
# Skip unit tests
node ops/orchestration/nightly-ops-pass/runtime.mjs --skip-tests

# Skip SonarQube integration
node ops/orchestration/nightly-ops-pass/runtime.mjs --skip-sonar
```

### Combining Flags

```bash
# Dry run with skipped tests and sonar
node ops/orchestration/nightly-ops-pass/runtime.mjs --dry-run --skip-tests --skip-sonar
```

## 5. Dependencies

### Internal Dependencies

- **../../lib/logger.mjs** - Logger factory for consistent logging throughout the module
- **harness/ops/harness-report.mjs** - Generates the harness health report
- **harness/audit-ast-density.mjs** - Checks AST density thresholds
- **harness/ops/integrations/linear/issue-hygiene.mjs** - Enforces issue labeling standards
- **harness/ops/symphony-queue-control.mjs** - Processes queue states
- **harness/ops/linear-guardian.mjs** - Creates/updates issues for failing checks
- **harness/ops/notify.mjs** - Sends notifications
- **harness/ops/orchestration/latency-report.mjs** - Generates latency reports
- **harness/ops/sonar-linear-audit.mjs** - Syncs SonarQube issues to Linear
- **harness/sonar-export.sh** - Exports SonarQube data

### External Dependencies

- **Node.js** - ESM modules with .mjs extension
- **Git** - For worktree maintenance commands
- **npm** - For running `npm run test:unit:coverage`
- **sonar-scanner** - For SonarQube scanning (requires `SONAR_TOKEN` and `SONAR_HOST_URL`)
- **Linear API** - For issue hygiene and governance modules

### Environment Variables

- **SONAR_TOKEN** - Optional. If set, enables SonarQube integration steps.
- **SONAR_HOST_URL** - Required when SONAR_TOKEN is set.
- **FORCE_COLOR** - Set to "0" when running commands to disable color output.

## 6. Additional Comments

- **Fail-Safe Design**: The pipeline continues running independent steps even if blocking steps fail, but skips subsequent blocking steps after a hard failure.

- **Report Archival**: Each run archives the latest report to `reports/archive/report-{ISO-timestamp}.json` for historical tracking.

- **Timeout Handling**: Steps have configurable timeouts (default 5 minutes, 400s for tests, 600s for sonar scans). The `runStep` function enforces these timeouts.

- **Operational vs Quality**: The exit code distinguishes between operational failures (blocking steps) and quality issues (advisory/independent steps), allowing CI/CD systems to differentiate between "broken" and "needs attention".

- **Concurrency**: While steps execute sequentially, the `queue-control`, `guardian`, and `notify` steps are marked "independent" meaning they run regardless of prior failures to ensure hygiene and communication occur.