# Payload Verification Matrix

## Purpose

Tracks coverage of payload kind handling from store/editor paths to generated payload text.

## Generation

- Command: `npm run report:payload:matrix`
- Script: `scripts/generate-payload-matrix.mjs`
- Generated output path: `reports/payload-verification-matrix.md` (compatibility output)

## Validation Signal

PASS when all payload kinds map to known generation paths without unresolved review rows.
