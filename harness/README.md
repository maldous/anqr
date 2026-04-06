# ANQR Harness

## 1. Directory Overview

This directory is the root of the ANQR harness. It combines thin top-level entry files, repository-local utility scripts, Structurizr workspace artifacts, and the canonical `ops/` runtime tree. The current inventory is 12 non-README files and 8 subdirectories.

## 2. File Summaries

### Files

- **agent-docs-check.mjs** - Facade module that re-exports public members from `./agent-docs-check/index.mjs`, `./agent-docs-check/runtime.mjs`.
- **audit-ast-density.mjs** - Facade module that re-exports public members from `./audit-ast-density/index.mjs`, `./audit-ast-density/runtime.mjs`.
- **contracts-check.mjs** - Facade module that re-exports public members from `./contracts-check/index.mjs`, `./contracts-check/runtime.mjs`.
- **export-linear-all.mjs** - Facade module that re-exports public members from `./export-linear-all/index.mjs`.
- **generate-openapi.ts** - Generates an OpenAPI document from the QR API contract and writes it to the repository's `docs/api` output path.
- **git-setup.sh** - Shell script that implements git setup.
- **list-ast-names.mjs** - Facade module that re-exports public members from `./list-ast-names/index.mjs`, `./list-ast-names/runtime.mjs`.
- **rename-to-standards.mjs** - Facade module that re-exports public members from `./rename-to-standards/index.mjs`.
- **show-metrics.py** - Python script that queries the local Symphony stats endpoint and prints ranked provider metrics.
- **sonar-export.sh** - Shell script that exports SonarQube issues, hotspots, duplication data, and measures into a consolidated report.
- **workspace.dsl** - Structurizr DSL workspace file defining the architecture model and views.
- **workspace.json** - JSON configuration or data file with top-level keys `configuration`, `description`, `documentation`, `id`, `lastModifiedDate`, `model`, `name`, `properties`.

### Subdirectories

- **agent-docs-check/** - Contains **agent-docs-check**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **audit-ast-density/** - Contains **AST Density Audit**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **contracts-check/** - Contains **Contracts Check**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **export-linear-all/** - Contains **export-linear-all**; it contains a module set centered on `main.mjs` and has 0 child directories.
- **lib/** - Contains **Lib**; it acts mainly as a namespace over child directories and has 1 child directories.
- **list-ast-names/** - Contains **List AST Names**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.
- **ops/** - Contains **ANQR Operations**; it contains 24 immediate files and has 14 child directories.
- **rename-to-standards/** - Contains **Rename to Standards**; it contains a module set centered on `main.mjs` and has 0 child directories.

## 3. Overall Directory Function

At the repository root, thin top-level facade and utility files sit beside the canonical `ops/` runtime tree and the Structurizr workspace files. Verified immediate files in this directory include file-system access, network/API integration, Linear integration, Symphony integration, SonarQube integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
npx tsx generate-openapi.ts
./git-setup.sh
python3 show-metrics.py
./sonar-export.sh
```

## 5. Dependencies

- **Node.js built-ins** - `node:fs/promises`, `node:path`, `node:url`
- **External packages/services referenced in immediate code** - `@ts-rest/open-api`
- **Internal relative modules** - `../packages/contracts/api/src`, `./agent-docs-check/index.mjs`, `./agent-docs-check/runtime.mjs`, `./audit-ast-density/index.mjs`, `./audit-ast-density/runtime.mjs`, `./contracts-check/index.mjs`, `./contracts-check/runtime.mjs`, `./export-linear-all/index.mjs`, `./list-ast-names/index.mjs`, `./list-ast-names/runtime.mjs`, `./ops/lib/logger.mjs`, `./rename-to-standards/index.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
