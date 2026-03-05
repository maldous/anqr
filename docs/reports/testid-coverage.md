# Test ID Coverage

## Purpose

Audits `data-testid` coverage and reference integrity used by UI tests.

## Generation

- Coverage audit: `npm run test:testid`
- Reference audit: `npm run test:testid:refs`
- Scripts:
  - `scripts/audit-testid-coverage.js`
  - `scripts/check-testid-references.js`
- Expected output path: `reports/testid-coverage.md` (compatibility output)

## Validation Signal

PASS when required UI surfaces expose stable test IDs and references are valid.
