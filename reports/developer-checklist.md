# Developer & Release Checklist

## Daily Dev Validation
1. `npm run typecheck`
2. `npm run test:unit`
3. `npm run test:i18n`
4. `make quality`

## Production Sign-off Validation
1. `npm run test:signoff`
2. `npm run build`
3. Verify generated artifacts in `dist/`
4. Confirm no unresolved parity regressions in `tests/unit/share-param-parity.spec.ts`

## Analyze/Diagnostics Validation
1. Verify Analyze summary and diagnostic panels render expected fields.
2. Export JSON from Analyze and confirm diagnostics include geometry + timing fields.
3. Run analyzer unit tests:
- `npx vitest run tests/unit/qr-analyzer-export.spec.ts tests/unit/qr-analyzer-geometry.spec.ts`

## Netlify/Embed Validation
1. Run Netlify function tests:
- `npx vitest run tests/unit/netlify-qr-function.spec.ts`
2. Verify response headers/content type/etag assertions pass.
3. Verify client/server param parity test passes.

## Android Validation (Manual)
1. Use `reports/android-export-verification.md` checklist on a real device.
2. Capture evidence (screenshots/video) for:
- file saved
- file visible in file manager
- file opens
- QR scan correctness

## Release Decision Gate
- Release only if all sections above pass without regressions.
