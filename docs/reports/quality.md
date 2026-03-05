# Quality Gates

## Purpose

Defines deterministic quality gate expectations used for CI and local validation.

## Canonical Commands

- `make quality`
- `make test:unit:ci`
- `npm run test:testid`
- `npm run test:testid:refs`
- `npm run test:bundle:budget`

## Notes

The `quality` target orchestrates lint, type checks, targeted tests, and budget checks.
