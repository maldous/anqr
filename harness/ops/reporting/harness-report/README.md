# Harness Report

## Purpose
Harness Report contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents

- 32 immediate files
- 0 child directories

## Key Files

- `allowed-root-dirs.mjs` - Exports `ALLOWED_ROOT_DIRS`, a shared constant or state value used by sibling modules.
- `check-ast-density.mjs` - Exports `checkAstDensity`, the main helper defined in this file.
- `check-cspell-coverage.mjs` - Exports `checkCspellCoverage`, the main helper defined in this file.
- `check-depcruise.mjs` - Exports `checkDepcruise`, the main helper defined in this file.
- `check-docs-freshness.mjs` - Exports `checkDocsFreshness`, the main helper defined in this file.
- `check-knip.mjs` - Exports `checkKnip`, the main helper defined in this file.
- `check-linear-rag-pipeline.mjs` - Exports `checkLinearRagPipeline`, the main helper defined in this file.
- `check-lint.mjs` - Exports `checkLint`, the main helper defined in this file.
- `check-litellm-routing.mjs` - Exports `checkLitellmRouting`, the main helper defined in this file.
- `check-npm-script.mjs` - Exports `checkNpmScript`, the main helper defined in this file.
- `check-ollama-health.mjs` - Exports `checkOllamaHealth`, the main helper defined in this file.
- `check-pipeline-latency.mjs` - Exports `checkPipelineLatency`, the main helper defined in this file.
- `check-repo-structure.mjs` - Exports `checkRepoStructure`, the main helper defined in this file.
- `check-sonar-audit.mjs` - Exports `checkSonarAudit`, the main helper defined in this file.
- `check-source-rag-index.mjs` - Exports `checkSourceRagIndex`, the main helper defined in this file.
- `check-test-unit.mjs` - Exports `checkTestUnit`, the main helper defined in this file.
- `check-typecheck.mjs` - Exports `checkTypecheck`, the main helper defined in this file.
- `checks.mjs` - Exports `CHECKS`, a shared constant or state value used by sibling modules.
- `dirname.mjs` - Exports `__dirname`, a shared constant or state value used by sibling modules.
- `docs-freshness-days.mjs` - Exports `DOCS_FRESHNESS_DAYS`, a shared constant or state value used by sibling modules.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `ollama-base.mjs` - Exports `OLLAMA_BASE`, a shared constant or state value used by sibling modules.
- `ping-timeout-ms.mjs` - Exports `PING_TIMEOUT_MS`, a shared constant or state value used by sibling modules.
- `pinned-model.mjs` - Exports `PINNED_MODEL`, a shared constant or state value used by sibling modules.
- `profiles.mjs` - Exports `PROFILES`, a shared constant or state value used by sibling modules.
- `required-dirs.mjs` - Exports `REQUIRED_DIRS`, a shared constant or state value used by sibling modules.
- `required-files.mjs` - Exports `REQUIRED_FILES`, a shared constant or state value used by sibling modules.
- `root.mjs` - Exports `ROOT`, a shared constant or state value used by sibling modules.
- `run-check.mjs` - Exports `runCheck`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.

## Subdirectories

- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 32 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
