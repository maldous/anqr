# Bundle Budget

## Purpose

Tracks main bundle and i18n budget thresholds.

## Generation

- Command: `npm run test:bundle:budget`
- Script: `scripts/check-bundle-budgets.mjs`
- Expected output paths:
  - `reports/bundle-budget.md`
  - `reports/bundle-budget.json`

## Validation Signal

PASS when bundle sizes stay under configured thresholds in `Makefile`/script constants.
