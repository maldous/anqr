# ANQR Harness Report

## 1. Directory Overview

This directory contains the harness-report module for the ANQR (Agentic Number Query Runner) system. It provides a comprehensive health check framework that validates repository structure, code quality, external service availability, and pipeline status. The module runs a configurable set of checks against the codebase and external dependencies, generating a JSON report that can be used for monitoring and alerting.

## 2. File Summaries

### Check Modules

- **check-ast-density.mjs** - Validates that JavaScript/TypeScript files have at most 1 top-level declaration per file. Runs `harness/audit-ast-density.mjs` with threshold=1.

- **check-cspell-coverage.mjs** - Spell checking for TypeScript, JavaScript, and Markdown files using cspell. Reports unknown words and spelling issues.

- **check-depcruise.mjs** - Dependency validation using dependency-cruiser to ensure no forbidden or cycles in the dependency graph.

- **check-docs-freshness.mjs** - Ensures all Markdown files in docs/ have been modified within the last 30 days (configurable via DOCS_FRESHNESS_DAYS).

- **check-knip.mjs** - Runs knip to detect unused files, dependencies, and exports in the codebase.

- **check-lint.mjs** - Runs oxlint for JavaScript/TypeScript linting.

- **check-litellm-routing.mjs** - Validates the LiteLLM configuration exists at `harness/ops/integrations/model/litellm-config.yaml`, contains the `symphony-local` alias, and references the pinned model.

- **check-ollama-health.mjs** - Checks if Ollama is reachable at the configured base URL (default: http://localhost:11434) and verifies the pinned model is available.

- **check-pipeline-latency.mjs** - Imports latency metrics from symphony-state and checks if average latency exceeds acceptable thresholds (target: 10min, acceptable: 30min) or has increased >50% from baseline.

- **check-repo-structure.mjs** - Validates required directories (src, docs, harness/ops, reports) and files (tsconfig.json, package.json, etc.) exist at the project root.

- **check-sonar-audit.mjs** - Queries SonarQube API for issue counts, hotspots, and quality metrics. Requires SONAR_TOKEN and SONAR_HOST_URL environment variables.

- **check-source-rag-index.mjs** - Validates the source RAG index at `reports/rag-index/` exists, has valid manifest and meta files, and shards are present.

- **check-test-unit.mjs** - Runs vitest for unit tests. Not included in standard profiles - used for standalone or custom profile execution.

- **check-typecheck.mjs** - Runs TypeScript compiler (tsc --noEmit) for type checking.

- **check-linear-rag-pipeline.mjs** - Validates Linear RAG pipeline exports and index exist at `reports/linear-export/` and `reports/rag-index-linear/`.

- **check-npm-script.mjs** - Utility helper that executes npm scripts and returns pass/fail results with output details.

### Core Orchestration

- **main.mjs** - Entry point that runs a profile of checks, collects results, and writes the report to `reports/latest.json`. Accepts profile name as CLI argument (default: "quick").

- **checks.mjs** - Registry mapping check names to their implementation functions and async/sync classification.

- **profiles.mjs** - Defines three check profiles:
  - `quick`: repo-structure, typecheck, lint, knip, cspell-coverage, ast-density (6 checks)
  - `continuous`: repo-structure, ollama-health, litellm-routing, pipeline-latency, source-rag-index, linear-rag-pipeline (6 checks)
  - `full`: all 14 checks for comprehensive validation

- **run-check.mjs** - Executes a single check by name, measures duration, and returns structured result.

### Configuration & Utilities

- **index.mjs** - Facade that exports all public API members from the module.

- **runtime.mjs** - Generated runtime carry-forward that imports and executes main().

- **logger.mjs** - Shared logger using the lib/logger.mjs module.

- **root.mjs** - Resolves to the project root directory (4 levels up from this directory).

- **dirname.mjs** - ESM-compatible `__dirname` polyfill using fileURLToPath.

- **ollama-base.mjs** - Ollama API base URL, defaults to `http://localhost:11434` (configurable via OLLAMA_API_BASE env var).

- **pinned-model.mjs** - The pinned model constant: `qwen2.5-coder:3b-instruct`.

- **ping-timeout-ms.mjs** - Timeout for ping operations: 5000ms.

- **docs-freshness-days.mjs** - Days threshold for docs freshness check: 30 days.

- **required-dirs.mjs** - Required directories: ["src", "docs", "harness/ops", "reports"].

- **required-files.mjs** - Required files: tsconfig.json, package.json, vite.config.ts, .dependency-cruiser.cjs, oxlint.json.

- **allowed-root-dirs.mjs** - Set of allowed root directories (apps, packages, src, tests, tools, docs, harness, reports, etc.).

## 3. Overall Directory Function

The harness-report module serves as the health monitoring layer for the ANQR system. It provides a unified interface to run multiple independent checks that validate different aspects of the system:

- **Repository Integrity**: check-repo-structure ensures the project has the expected directory layout and required files.

- **Code Quality**: check-typecheck, check-lint, check-depcruise, check-knip, check-cspell-coverage validate code quality and catch issues early.

- **Architecture Compliance**: check-ast-density enforces the project's file decomposition standards.

- **Documentation Health**: check-docs-freshness ensures documentation remains current.

- **External Service Availability**: check-ollama-health, check-sonar-audit verify external dependencies are reachable and configured.

- **Configuration Validation**: check-litellm-routing ensures model routing is properly configured.

- **Operational Metrics**: check-pipeline-latency monitors execution performance and alerts on degradation.

- **Data Pipeline Status**: check-source-rag-index, check-linear-rag-pipeline validate RAG data pipelines are healthy.

The module is designed with a profile-based approach, allowing different use cases: quick validation (CI), continuous monitoring (health checks), and full validation (comprehensive audits).

## 4. Usage Instructions

### Running the harness report

```bash
# Run with default profile (quick)
node ops/reporting/harness-report/main.mjs

# Run specific profile
node ops/reporting/harness-report/main.mjs quick
node ops/reporting/harness-report/main.mjs continuous
node ops/reporting/harness-report/main.mjs full
```

### Output

The module writes results to `reports/latest.json` with the following structure:
```json
{
  "profile": "quick",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "total_duration_ms": 15000,
  "summary": { "passed": 5, "failed": 1, "total": 6 },
  "checks": [
    { "name": "repo-structure", "pass": true, "detail": "...", "duration_ms": 50 }
  ]
}
```

Exit code is 0 on success, 1 if any check fails.

### Programmatic Usage

```javascript
import { runCheck, CHECKS, PROFILES } from "./ops/reporting/harness-report/index.mjs";

// Run a single check
const result = await runCheck("ollama-health");

// Run all checks in a profile
for (const name of PROFILES.full) {
  const result = await runCheck(name);
}
```

## 5. Dependencies

### Runtime Requirements

- **Node.js** - ESM modules with .mjs extension
- **npm** - For running package scripts (typecheck, lint, knip, etc.)

### External Services (Optional)

- **Ollama** - Local AI model server (check-ollama-health, check-litellm-routing)
- **SonarQube** - Code quality platform (check-sonar-audit)
- **LiteLLM** - Model routing proxy (check-litellm-routing)

### Environment Variables

- **OLLAMA_API_BASE** - Ollama base URL (default: http://localhost:11434)
- **SONAR_TOKEN** - SonarQube API token (check-sonar-audit)
- **SONAR_HOST_URL** - SonarQube host URL (default: http://localhost:9000)

### Internal Dependencies

- **../../core/symphony-state.mjs** - For latency metrics (check-pipeline-latency)
- **../../lib/logger.mjs** - Logger module
- **harness/audit-ast-density.mjs** - AST density auditing (check-ast-density)

## 6. Additional Comments

- **Fail-Closed Design**: Most checks return `pass: true` when dependencies are unavailable rather than failing. This allows the report to run in environments without all external services configured.

- **Async/Sync Classification**: Checks are classified as async or sync in CHECKS. Async checks (ollama-health, sonar-audit, pipeline-latency, source-rag-index, linear-rag-pipeline) are awaited during execution.

- **Timeout Handling**: NPM script checks have a 120-second timeout. External service checks have a 5-second ping timeout.

- **Report Persistence**: The JSON report is written to `reports/latest.json` for consumption by other modules like linear-guardian.mjs which reads the report to identify and track failures.

- **Profile Design**: The quick profile is optimized for CI (fast feedback), continuous for ongoing health monitoring, and full for comprehensive validation during releases or audits.

- **Pinned Model**: The system uses `qwen2.5-coder:3b-instruct` as the primary model, validated by both Ollama health check and LiteLLM routing configuration.