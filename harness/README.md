# Harness

## Purpose
Top-level harness surface that connects repository-local entry points, architecture workspace artifacts, and the maintained operations runtime tree.

## Contents

- 12 immediate files
- 8 child directories

## Key Files
- `agent-docs-check.mjs` - JavaScript/TypeScript module used by this directory.
- `audit-ast-density.mjs` - JavaScript/TypeScript module used by this directory.
- `contracts-check.mjs` - JavaScript/TypeScript module used by this directory.
- `export-linear-all.mjs` - JavaScript/TypeScript module used by this directory.
- `generate-openapi.ts` - JavaScript/TypeScript module used by this directory.
- `git-setup.sh` - Shell script used by this directory.
- `list-ast-names.mjs` - JavaScript/TypeScript module used by this directory.
- `rename-to-standards.mjs` - JavaScript/TypeScript module used by this directory.
- `show-metrics.py` - Python script used by this directory.
- `sonar-export.sh` - Shell script used by this directory.
- `workspace.dsl` - Support file used by this directory.
- `workspace.json` - JSON configuration/data file with top-level keys `configuration`, `description`, `documentation`, `id`, `model`, `name`, `properties`, `views`.

## Subdirectories
- `agent-docs-check/` - Agent Docs Check scope; immediate files include `compare-sets.mjs`, `errors.mjs`, `index.mjs`, `logger.mjs`, and others.
- `audit-ast-density/` - Audit Ast Density scope; immediate files include `collect-heavy-nodes.mjs`, `default-threshold.mjs`, `describe-variable-declaration.mjs`, `format-entry.mjs`, and others.
- `contracts-check/` - Contracts Check scope; immediate files include `allowed-schema-import-sources.mjs`, `collect-files.mjs`, `contracts-root.mjs`, `errors.mjs`, and others.
- `export-linear-all/` - Export Linear All scope; immediate files include `fetch-all-issues.mjs`, `index.mjs`, `main.mjs`.
- `lib/` - Lib scope; immediate files include `ast-helpers.mjs`; child directories include `ast-helpers/`.
- `list-ast-names/` - List Ast Names scope; immediate files include `collect-top-level-entries.mjs`, `describe-variable-declaration.mjs`, `flatten-results.mjs`, `format-flat.mjs`, and others.
- `ops/` - Ops scope; immediate files include `email-ingest.mjs`, `harness-doctor.mjs`, `harness-report.mjs`, `issue_hygiene.py`, and others; child directories include `core/`, `governance/`, `harness-doctor/`, `integrations/`, and others.
- `rename-to-standards/` - Rename To Standards scope; immediate files include `apply-plan.mjs`, `build-plan.mjs`, `choose-primary-entry.mjs`, `code-extensions.mjs`, and others.

## Operational Notes
- This directory is the human and tool-facing entry surface for the harness rather than the main runtime implementation.
- The most authoritative architecture intent files here are `workspace.dsl` and the thin facade modules that bind public commands to maintained implementations.

## Review Focus
Check that the top-level entry points, workspace model, and helper scripts still map cleanly to the maintained runtime under `harness/ops/`.
