# Payload Integrity Status (Iteration 2)

Date: 2026-02-15
Purpose: current-state payload status for launch readiness (replaces historical mixed notes).

## Scope

This report tracks payload wiring and launch-critical gaps for:

- store type surface (`src/store/qr-store.ts`)
- payload UI wiring (`src/components/sections/PayloadSection.tsx`)
- generators (`src/modules/payload-generators/*`)

## Confirmed Closed

1. Removed redundant URL alias payload kinds from runtime options:

- `file_url`
- `cloud_link`

Current canonical behavior: file/cloud links use `url` payload.

2. Documents/media payload category remains removed from payload selection UI.

3. Required/test-id mapping coverage remains complete for payload domain:

- `reports/required-gap.md`: 810/810 payload requirements direct
- `reports/testid-coverage.md`: no uncovered interactive IDs

4. Per-kind payload verification matrix is now generated and green:

- `reports/payload-verification-matrix.md`: 41/41 payload kinds `PASS`
- `reports/payload-verification-matrix.json`: machine-readable matrix
- `tests/unit/payload-matrix-guard.spec.ts`: guard against selector/generation drift

## Current Launch Blocker Relation

Payload domain is no longer a launch blocker. Legacy option cleanup and per-kind verification evidence are both complete.

## Residual Notes

1. Five payment kinds are intentionally text-driven via `PayloadSection` useEffects:

- `epc_sepa`, `upi`, `paynow`, `promptpay`, `pix`

2. `tests/unit/payload-matrix-guard.spec.ts` enforces this explicit contract so drift is caught in CI.
