# ANQR Harness Report

## 1. Directory Overview

This directory contains the harness-report module for the ANQR (Agentic Number Query Runner) system.
It provides a comprehensive health check framework that validates repository structure, code
quality, external service availability, and pipeline status. The module runs a configurable set of
checks against the codebase and external dependencies, generating a JSON report that can be used for
monitoring and alerting. It currently contains 32 files and 0 subdirectories.

## 2. File Summaries

### Files

- **allowed-root-dirs.mjs** - Set of allowed root directories (apps, packages, src, tests, tools, docs, harness, reports, etc.).
- **check-ast-density.mjs** - Validates that JavaScript/TypeScript files have at most 1 top-level declaration per file. Runs `harness/audit-ast-density.mjs` with threshold=1.
- **check-cspell-coverage.mjs** - Spell checking for TypeScript, JavaScript, and Markdown files using cspell. Reports unknown words and spelling issues.
- **check-depcruise.mjs** - Dependency validation using dependency-cruiser to ensure no forbidden or cycles in the dependency graph.
- **check-docs-freshness.mjs** - Ensures all Markdown files in docs/ have been modified within the last 30 days (configurable via DOCS_FRESHNESS_DAYS).
- **check-knip.mjs** - Runs knip to detect unused files, dependencies, and exports in the codebase.
- **check-linear-rag-pipeline.mjs** - Validates Linear RAG pipeline exports and index exist at `reports/linear-export/` and `reports/rag-index-linear/`.
- **check-lint.mjs** - Runs oxlint for JavaScript/TypeScript linting.
- **check-litellm-routing.mjs** - Validates the LiteLLM configuration exists at `harness/ops/integrations/model/litellm-config.yaml`, contains the `symphony-local` alias, and references the pinned model.
- **check-npm-script.mjs** - Utility helper that executes npm scripts and returns pass/fail results with output details.
- **check-ollama-health.mjs** - Checks if Ollama is reachable at the configured base URL (default: http://localhost:11434) and verifies the pinned model is available.
- **check-pipeline-latency.mjs** - Imports latency metrics from symphony-state and checks if average latency exceeds acceptable thresholds (target: 10min, acceptable: 30min) or has increased >50% from baseline.
- **check-repo-structure.mjs** - Validates required directories (src, docs, harness/ops, reports) and files (tsconfig.json, package.json, etc.) exist at the project root.
- **check-sonar-audit.mjs** - Queries SonarQube API for issue counts, hotspots, and quality metrics. Requires SONAR_TOKEN and SONAR_HOST_URL environment variables.
- **check-source-rag-index.mjs** - Validates the source RAG index at `reports/rag-index/` exists, has valid manifest and meta files, and shards are present.
- **check-test-unit.mjs** - Runs vitest for unit tests. Not included in standard profiles - used for standalone or custom profile execution.
- **check-typecheck.mjs** - Runs TypeScript compiler (tsc --noEmit) for type checking.
- **checks.mjs** - Registry mapping check names to their implementation functions and async/sync classification.
- **dirname.mjs** - ESM-compatible `__dirname` polyfill using fileURLToPath.
- **docs-freshness-days.mjs** - Days threshold for docs freshness check: 30 days.
- **index.mjs** - Facade that exports all public API members from the module.
- **logger.mjs** - Shared logger using the lib/logger.mjs module.
- **main.mjs** - Entry point that runs a profile of checks, collects results, and writes the report to `reports/latest.json`. Accepts profile name as CLI argument (default: "quick").
- **ollama-base.mjs** - Ollama API base URL, defaults to `http://localhost:11434` (configurable via OLLAMA_API_BASE env var).
- **ping-timeout-ms.mjs** - Timeout for ping operations: 5000ms.
- **pinned-model.mjs** - The pinned model constant: `qwen2.5-coder:3b-instruct`.
- **profiles.mjs** - Defines three check profiles:
- **required-dirs.mjs** - Required directories: ["src", "docs", "harness/ops", "reports"].
- **required-files.mjs** - Required files: tsconfig.json, package.json, vite.config.ts, .dependency-cruiser.cjs, oxlint.json.
- **root.mjs** - Resolves to the project root directory (4 levels up from this directory).
- **run-check.mjs** - Executes a single check by name, measures duration, and returns structured result.
- **runtime.mjs** - Generated runtime carry-forward that imports and executes main().

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/reporting/harness-report/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
