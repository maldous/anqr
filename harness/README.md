# Harness

## Purpose
Top-level harness entry surface that combines the Structurizr architecture model, thin CLI facade modules, and the maintained `ops/` runtime tree.

## Contents
- 12 immediate files
- 8 child directories

## Key Files
- `agent-docs-check.mjs` - JavaScript/TypeScript module used by this directory.
- `audit-ast-density.mjs` - JavaScript/TypeScript module used by this directory.
- `contracts-check.mjs` - JavaScript/TypeScript module used by this directory.
- `export-linear-all.mjs` - JavaScript/TypeScript module used by this directory.
- `generate-openapi.ts` - @ts-ignore - harness logger implemented in .mjs for runtime parity
- `git-setup.sh` - Shell script used by this directory.
- `list-ast-names.mjs` - JavaScript/TypeScript module used by this directory.
- `rename-to-standards.mjs` - JavaScript/TypeScript module used by this directory.
- `show-metrics.py` - Python script used by this directory.
- `sonar-export.sh` - Shell script used by this directory.
- `workspace.dsl` - Support file used by this directory.
- `workspace.json` - JSON configuration/data file with top-level keys `configuration`, `description`, `documentation`, `id`, `model`, `name`, `properties`, `views`.

## Subdirectories
- `agent-docs-check/` - Directory for runtime service bootstrap or environment support; immediate files include `compare-sets.mjs`, `errors.mjs`, `index.mjs`, `logger.mjs`, and others.
- `audit-ast-density/` - Directory for runtime service bootstrap or environment support; immediate files include `collect-heavy-nodes.mjs`, `default-threshold.mjs`, `describe-variable-declaration.mjs`, `format-entry.mjs`, and others.
- `contracts-check/` - Directory for runtime service bootstrap or environment support; immediate files include `allowed-schema-import-sources.mjs`, `collect-files.mjs`, `contracts-root.mjs`, `errors.mjs`, and others.
- `export-linear-all/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `fetch-all-issues.mjs`, `index.mjs`, `main.mjs`.
- `lib/` - Directory for harness support logic; immediate files include `ast-helpers.mjs`, with child directories `ast-helpers/`.
- `list-ast-names/` - Directory for runtime service bootstrap or environment support; immediate files include `collect-top-level-entries.mjs`, `describe-variable-declaration.mjs`, `flatten-results.mjs`, `format-flat.mjs`, and others.
- `ops/` - Directory for Linear ingestion, reconciliation, or issue management; immediate files include `email-ingest.mjs`, `harness-doctor.mjs`, `harness-report.mjs`, `issue_hygiene.py`, and others, with child directories `core/`, `governance/`, `harness-doctor/`, `integrations/`, and others.
- `rename-to-standards/` - Directory for harness support logic; immediate files include `apply-plan.mjs`, `build-plan.mjs`, `choose-primary-entry.mjs`, `code-extensions.mjs`, and others.

## Operational Notes
- This directory is the documentation and entry-point bridge between the repository root and the deeper harness runtime tree.
- The strongest architecture intent files here are `workspace.dsl` and the facade modules that pin public command names to maintained implementations.

## Review Focus
Confirm the top-level wrappers still map cleanly into the maintained `ops/` implementations and that workspace artifacts match the real runtime topology.
