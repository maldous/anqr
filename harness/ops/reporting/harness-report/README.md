# ANQR Harness Report

## 1. Directory Overview

This directory implements **ANQR Harness Report** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 32 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **allowed-root-dirs.mjs** - Exports `ALLOWED_ROOT_DIRS`, a shared `Set` constant used by this module group.
- **check-ast-density.mjs** - Exports `checkAstDensity`, which checks ast density.
- **check-cspell-coverage.mjs** - Exports `checkCspellCoverage`, which checks cspell coverage.
- **check-depcruise.mjs** - Exports `checkDepcruise`, which checks depcruise.
- **check-docs-freshness.mjs** - Exports `checkDocsFreshness`, which checks docs freshness.
- **check-knip.mjs** - Exports `checkKnip`, which checks knip.
- **check-linear-rag-pipeline.mjs** - Exports `checkLinearRagPipeline`, which checks linear rag pipeline.
- **check-lint.mjs** - Exports `checkLint`, which checks lint.
- **check-litellm-routing.mjs** - Exports `checkLitellmRouting`, which checks litellm routing.
- **check-npm-script.mjs** - Exports `checkNpmScript`, which checks npm script.
- **check-ollama-health.mjs** - Exports `checkOllamaHealth`, which checks ollama health.
- **check-pipeline-latency.mjs** - Exports `checkPipelineLatency`, which checks pipeline latency.
- **check-repo-structure.mjs** - Exports `checkRepoStructure`, which checks repo structure.
- **check-sonar-audit.mjs** - Exports `checkSonarAudit`, which checks sonar audit.
- **check-source-rag-index.mjs** - Exports `checkSourceRagIndex`, which checks source rag index.
- **check-test-unit.mjs** - Exports `checkTestUnit`, which checks test unit.
- **check-typecheck.mjs** - Exports `checkTypecheck`, which checks typecheck.
- **checks.mjs** - Exports `CHECKS`, a shared constant used by sibling modules.
- **dirname.mjs** - Exports `__dirname`, which implements dirname.
- **docs-freshness-days.mjs** - Exports `DOCS_FRESHNESS_DAYS`, a shared constant used by sibling modules.
- **index.mjs** - Facade module that re-exports public members from `./dirname.mjs`, `./root.mjs`, `./ollama-base.mjs`, `./pinned-model.mjs`, `./ping-timeout-ms.mjs`, `./docs-freshness-days.mjs`, and 22 more siblings.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **ollama-base.mjs** - Exports `OLLAMA_BASE`, a shared constant used by sibling modules.
- **ping-timeout-ms.mjs** - Exports `PING_TIMEOUT_MS`, a shared constant used by sibling modules.
- **pinned-model.mjs** - Exports `PINNED_MODEL`, a shared constant used by sibling modules.
- **profiles.mjs** - Exports `PROFILES`, a shared constant used by sibling modules.
- **required-dirs.mjs** - Exports `REQUIRED_DIRS`, a shared constant used by sibling modules.
- **required-files.mjs** - Exports `REQUIRED_FILES`, a shared constant used by sibling modules.
- **root.mjs** - Exports `ROOT`, a shared constant used by sibling modules.
- **run-check.mjs** - Exports `runCheck`, which runs check.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include file-system access, network/API integration, subprocess execution, timer, scheduling, cooldown, or watchdog behavior, Linear integration, Symphony integration, SonarQube integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/reporting/harness-report/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:fs`, `node:path`, `node:url`
- **Internal relative modules** - `../../lib/logger.mjs`, `./allowed-root-dirs.mjs`, `./check-ast-density.mjs`, `./check-cspell-coverage.mjs`, `./check-depcruise.mjs`, `./check-docs-freshness.mjs`, `./check-knip.mjs`, `./check-linear-rag-pipeline.mjs`, `./check-lint.mjs`, `./check-litellm-routing.mjs`, `./check-npm-script.mjs`, `./check-ollama-health.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
