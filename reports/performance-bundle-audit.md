# Performance & Bundle Audit (2026-02-07)

## Build run
- Command: `npm run build`
- Result: Build output generated successfully (`dist/`) with PWA assets emitted.
- Note: Sentry upload is now opt-in (`SENTRY_UPLOAD=true`), so default local/offline builds complete without remote upload dependency.

## Artifact size snapshot
- `dist/`: ~149M
- `dist/assets/`: ~65M
- JS chunk count in `dist/assets`: 191
- i18n chunks (`locale-*` + `static-*`): 172
- non-i18n JS chunks: 19

## Byte distribution (JS)
- Non-i18n JS total: 1,657,948 bytes (~1.58 MiB)
- i18n JS total: 23,457,891 bytes (~22.37 MiB)
- Observation: i18n/static locale bundles dominate emitted JS size.

## Largest JS chunks (raw, bytes)
1. `index-DC_B5JYV.js` — 629,237
2. `static-my-mm-4y5CfBU0.js` — 408,230
3. `static-ml-in-vhducETW.js` — 386,524
4. `static-ta-in-DvYhDzHf.js` — 384,310
5. `static-ka-ge-PZZIpDtx.js` — 358,635
6. `static-kn-in-Dfr1BWQ5.js` — 357,145
7. `static-te-in-CebPQYtd.js` — 348,906
8. `static-km-kh-Cr6-vyNn.js` — 340,710
9. `static-ne-np-CF-taI8l.js` — 327,103
10. `static-th-Dtd3Ra6F.js` — 321,577

## Code-splitting assessment
- Positive: Build emits many split chunks (191), indicating code splitting is active.
- Risk: Split strategy currently produces very high locale/static fan-out, increasing deploy artifact volume and cache pressure.

## Optimization recommendations (next pass)
1. Gate static locale payloads behind route-level lazy loading to avoid bundling non-selected static locales in the initial route graph.
2. Consolidate low-traffic locale/static bundles into on-demand fetchable resources (JSON/text) rather than emitted JS modules.
3. Keep non-i18n core chunks (`index`, `vendor-react`, `vendor-radix`) under ongoing watch; they are currently reasonable compared with i18n footprint.
4. Add a CI budget check for:
- main entry chunk max size
- total non-i18n JS size
- i18n aggregate size trend (warning-level budget)

## Phase mapping
- Phase 9.3 (Bundle + network): baseline captured and quantified.
- Remaining: implement at least one concrete i18n bundle-size reduction strategy and re-measure.
