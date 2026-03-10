# Quality Gates

## Purpose

Defines deterministic quality gate expectations used for CI and local validation.

## Canonical Commands

- `make quality`
- `npm run check:parity`
- `make test`
- `npm run test:testid`
- `npm run test:testid:refs`
- `npm run test:bundle:budget`

## Notes

`make quality` is a fast static gate (lint/format/type/dependency hygiene + bundle budget).
Application/runtime tests (unit + i18n + Playwright) run under `make test`.
