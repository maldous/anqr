# ANQR Reporting

## 1. Directory Overview

This directory contains harness report generation automation for the ANQR (Agentic Number Query Runner) project. The reporting system provides a pluggable check framework that runs various health, quality, and operational checks against the codebase and exports results to JSON for consumption by other automation tools like the Linear Guardian governance system.

## 2. File Summaries

### Facade Module (Auto-Generated)

- **harness-report.mjs** - Auto-generated facade that re-exports from `./harness-report/index.mjs` and `./harness-report/runtime.mjs`. Provides the CLI entry point for running harness reports.

### Subdirectory

- **harness-report/** - Contains the core reporting implementation:
  - **index.mjs** - Facade index exporting all public API members including constants (ROOT, OLLAMA_BASE, PINNED_MODEL, PING_TIMEOUT_MS, DOCS_FRESHNESS_DAYS, PROFILES, REQUIRED_DIRS, REQUIRED_FILES, ALLOWED_ROOT_DIRS, CHECKS) and functions (all check functions, runCheck, main).
  - **main.mjs** - Main orchestration module. Accepts a profile argument (default: "quick"), runs all checks in the profile, writes results to `reports/latest.json`, and exits with appropriate status code.
  - **checks.mjs** - Registry of all available checks with their async/sync classification. Maps check names to their implementation functions.
  - **profiles.mjs** - Check profile definitions: `quick` (6 checks), `continuous` (6 checks), `full` (14 checks).
  - **run-check.mjs** - Check runner that executes a single check and returns timing and result data.

### Check Implementation Files

- **check-repo-structure.mjs** - Validates required directories (`src`, `docs`, `harness/ops`, `reports`) and files (`tsconfig.json`, `package.json`, etc.) exist, and ensures no unexpected root directories.
- **check-typecheck.mjs** - Runs `tsc --noEmit` via npm script to validate TypeScript types.
- **check-lint.mjs** - Runs linting checks via npm script.
- **check-test-unit.mjs** - Runs unit tests via npm script.
- **check-depcruise.mjs** - Runs dependency cruiser for dependency validation.
- **check-knip.mjs** - Runs Knip for detecting unused files, dependencies, and exports.
- **check-docs-freshness.mjs** - Validates documentation freshness (default: 30 days).
- **check-ollama-health.mjs** - Async check that validates Ollama server health and connectivity.
- **check-litellm-routing.mjs** - Validates LiteLLM routing configuration and provider availability.
- **check-cspell-coverage.mjs** - Validates spell-checking coverage.
- **check-ast-density.mjs** - Validates AST density metrics.
- **check-sonar-audit.mjs** - Async check that runs SonarQube audit/analysis.
- **check-pipeline-latency.mjs** - Async check for pipeline latency validation.
- **check-source-rag-index.mjs** - Async check validating source RAG index availability.
- **check-linear-rag-pipeline.mjs** - Async check validating Linear RAG pipeline.

### Utility Files

- **check-npm-script.mjs** - Helper to run npm scripts and return pass/fail results.
- **profiles.mjs** - Profile definitions mapping profile names to check lists.
- **required-dirs.mjs** - List of required directories: `src`, `docs`, `harness/ops`, `reports`.
- **required-files.mjs** - List of required files: `tsconfig.json`, `package.json`, `vite.config.ts`, `.dependency-cruiser.cjs`, `oxlint.json`.
- **allowed-root-dirs.mjs** - Set of allowed root directories for repo structure validation.
- **root.mjs** - Path resolution to project root directory.
- **dirname.mjs** - Node.js `__dirname` polyfill for ESM compatibility.
- **logger.mjs** - Shared logger module using `../../lib/logger.mjs`.
- **pinned-model.mjs** - Pinned model configuration constant.
- **ollama-base.mjs** - Ollama base URL configuration.
- **ping-timeout-ms.mjs** - Ping timeout in milliseconds configuration.
- **docs-freshness-days.mjs** - Documentation freshness threshold in days.

## 3. Overall Directory Function

This directory serves as the health and quality reporting layer of the ANQR harness. It provides a pluggable check framework where each check is an independent module that returns a `pass` boolean and `detail` string.

The reporting system works as follows:
1. **main.mjs** accepts a profile argument (quick/continuous/full)
2. It iterates through all checks defined in that profile
3. Each check is executed via **run-check.mjs** which measures duration and captures results
4. Results are aggregated into a JSON report written to `reports/latest.json`
5. Exit code reflects pass/fail status (0 for success, 1 for failure)

The three profiles serve different use cases:
- **quick**: Fast feedback on critical structural and type issues (6 checks)
- **continuous**: Ongoing health checks for services and pipelines (6 checks)
- **full**: Complete quality gate with all checks (14 checks)

Reports generated here are consumed by the Linear Guardian (`ops/governance/linear-guardian.mjs`) to create and track issues for failing checks.

## 4. Usage Instructions

### Running the Harness Report

```bash
# Via facade (recommended)
node ops/reporting/harness-report.mjs

# Or directly
node ops/reporting/harness-report/runtime.mjs
```

### Running with Specific Profile

```bash
node ops/reporting/harness-report.mjs quick
node ops/reporting/harness-report.mjs continuous
node ops/reporting/harness-report.mjs full
```

### Output

- Results are printed to stdout with pass/fail icons and timing
- JSON report is written to `reports/latest.json`
- Exit code is 0 if all checks pass, 1 if any fail

### Report Format

The JSON report contains:
```json
{
  "profile": "quick",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "total_duration_ms": 5000,
  "summary": { "passed": 6, "failed": 0, "total": 6 },
  "checks": [
    { "name": "repo-structure", "pass": true, "detail": "...", "duration_ms": 10 }
  ]
}
```

## 5. Dependencies

### Internal Dependencies

- **../../lib/logger.mjs** - Logger factory for logging check results
- **../../harness/ops/core/symphony-config.mjs** - Configuration constants (used by some checks)

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- npm scripts defined in package.json (typecheck, lint, test, etc.)
- External services for async checks:
  - Ollama server (for ollama-health check)
  - LiteLLM proxy (for litellm-routing check)
  - SonarQube (for sonar-audit check)
  - RAG pipeline services (for source-rag-index and linear-rag-pipeline checks)

### Check Dependencies

Each check may require specific tools or services:
- TypeScript: `tsc` (via npm run typecheck)
- Linting: oxlint or eslint (via npm run lint)
- Testing: vitest (via npm run test:unit)
- Dependency analysis: dependency-cruiser, knip
- Spell checking: cspell

## 6. Additional Comments

- **Check Classification**: Checks are marked as async or sync in checks.mjs. Async checks typically involve network calls or external services.

- **Profile Design**: The `quick` profile is designed for fast iteration during development, while `continuous` monitors service health, and `full` provides a complete quality gate.

- **Extensibility**: New checks can be added by creating a check function that returns `{ pass: boolean, detail: string }` and registering it in checks.mjs.

- **Complete Check Execution**: The report runs all checks in the profile to provide complete visibility, then exits with code 1 if any check failed.

- **Report Consumer**: The `reports/latest.json` output is consumed by linear-guardian.mjs to automatically create or update Linear issues for failing checks.