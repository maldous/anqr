# ANQ-145 URL/Query Parsing Parity Audit

## Scope
Review URL/query argument parsing and normalization for inconsistent defaults/coercion/order across runtimes.

## Commands run
- `nl -ba src/modules/share-links/url-params.ts | sed -n '34,120p' > reports/audits/ANQ-145/shared-parser-core.txt`
- `nl -ba src/modules/share-links/url-params.ts | sed -n '285,780p' > reports/audits/ANQ-145/shared-builder-defaults.txt`
- `nl -ba netlify/functions/qr.ts | sed -n '2786,3175p' > reports/audits/ANQ-145/netlify-parser-defaults.txt`

## Evidence artifact paths
- `reports/audits/ANQ-145/shared-parser-core.txt`
- `reports/audits/ANQ-145/shared-builder-defaults.txt`
- `reports/audits/ANQ-145/netlify-parser-defaults.txt`

## Mismatch and root-cause notes
1. `size` default mismatch between share-link builder and server parser.
- Builder omits `size` unless `config.size !== 20` (`src/modules/share-links/url-params.ts:311`).
- Server defaults to `size=400` when missing (`netlify/functions/qr.ts:2787`).
- Root cause: two independent default baselines (client share config vs server API) for the same query key.

2. `ditherKind` default mismatch.
- Builder treats `error_diffusion` as default and omits it (`src/modules/share-links/url-params.ts:538`).
- Server defaults to `DEFAULT_SERVER_DITHER` (cheap server default, not `error_diffusion`) when omitted (`netlify/functions/qr.ts:2920-2922`).
- Root cause: server performance default diverges from share-link serialization default.

3. Boolean default/coercion mismatch for optional flags (`undefined` vs concrete default).
- Shared parser returns `undefined` when absent for several flags, e.g. `lockF`, `inclQz`, `svgEmbed`, `autoVer` (`src/modules/share-links/url-params.ts:199-223`).
- Server parser coerces missing to concrete defaults, e.g. `lockF=true`, `inclQz=true`, `svgEmbed=true`, `autoVer=true` (`netlify/functions/qr.ts:3122-3133`, `3158`, `3170`).
- Root cause: shared parser acts as sparse config decode; server parser normalizes to executable runtime defaults.

4. Invalid value coercion mismatch for typed params.
- Shared parser propagates parse results directly (e.g. `mask` non-numeric -> `NaN`) (`src/modules/share-links/url-params.ts:44-48`).
- Server normalizes invalid/absent `mask` to `'auto'` and clamps numeric range (`netlify/functions/qr.ts:2809-2814`).
- Root cause: lenient decode in shared parser vs strict normalization in server runtime.

5. Enum validation mismatch.
- Shared parser passes through enum-like values such as `ec`, `style`, `charset` without runtime validation (`src/modules/share-links/url-params.ts:39,57,49`).
- Server validates/sanitizes (`ec` must be `L/M/Q/H`; charset limited to `default|utf8|shift-jis`; invalid style returns 400) (`netlify/functions/qr.ts:2817-2820`, `3177-3190`).
- Root cause: parser role mismatch (deserialization utility vs API boundary validator).

## Pass/fail verdict
- **FAIL** for full cross-runtime parity.
- Interpretation: behavior is mostly intentionally compatible, but defaults/coercion are not fully aligned, so the same sparse/invalid query can produce different effective configs between shared parsing and server execution.
