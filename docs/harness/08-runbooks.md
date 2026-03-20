# Runbooks

This file is the index for active runbooks.

## Current active runbook families

- harness quick status
- queue dry-run and queue enforcement
- symphony status and once-run execution
- nightly dry-run
- email ingest dry-run
- Sonar scan and export

## Current command surface

- `make quality-fast`
- `make quality-release`
- `npm run harness:quick`
- `npm run queue:all:dry-run`
- `npm run symphony:status`
- `npm run nightly:dry-run`

## Rule

If a runbook matters operationally, it must live under `docs/harness/*` or another canonical `docs/*` surface, not only in chat history or issue comments.
