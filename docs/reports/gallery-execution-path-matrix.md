# Gallery Execution Path And Parameter Source Matrix

Issue: `ANQ-144`
Parent: `ANQ-143`
Date: `2026-03-10`

## Command(s) Run

```bash
node scripts/ops/linear-list-issues.mjs --open --format json > /tmp/issues.json
jq -r '.[] | select(.identifier=="ANQ-144") | .description' /tmp/issues.json
rg -n "buildUrlParams|generateAllScenarios|URLSearchParams|parseUrlParamsFromSearchParams|handler" \
  scripts/generate-gallery-local.mjs \
  scripts/generate-gallery-browser.mjs \
  scripts/generate-gallery-remote.mjs \
  scripts/lib/gallery-permutations.mjs \
  src/App.tsx \
  src/data/gallery-items.ts \
  src/modules/share-links/url-params.ts \
  src/store/qr-store.ts \
  netlify/functions/qr.ts
```

## Evidence Artifact Paths

- `docs/reports/gallery-execution-path-matrix.md` (this canonical matrix)
- `/tmp/issues.json` (issue metadata snapshot used for task scoping)
- `scripts/lib/gallery-permutations.mjs` (scenario/default source of truth)
- `scripts/generate-gallery-local.mjs`
- `scripts/generate-gallery-browser.mjs`
- `scripts/generate-gallery-remote.mjs`
- `src/data/gallery-items.ts`
- `src/App.tsx`
- `src/modules/share-links/url-params.ts`
- `src/store/qr-store.ts`
- `netlify/functions/qr.ts`

## Execution Matrix (Single Source Of Truth)

| Path                                 | Entry point                                                     | Parameter/default source                                                                                                                      | Serialization path                                                                                                                                                                                 | Evidence                                                                                                                                       |
| ------------------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Local gallery renderer               | `scripts/generate-gallery-local.mjs` `main()`                   | Scenario list from `generateAllScenarios()` and env defaults (`GALLERY_CONCURRENCY`, timeout, shard, strict overlay)                          | `buildUrlParams(config)` from permutations -> `URLSearchParams` -> local request with forced `_fullRender=1` and optional `_strictOverlay=1`; local `/public` fixtures rewritten to `file://` URLs | `scripts/generate-gallery-local.mjs:93-104`, `scripts/generate-gallery-local.mjs:156-185`, `scripts/generate-gallery-local.mjs:330-379`        |
| Browser gallery renderer             | `scripts/generate-gallery-browser.mjs` `main()`                 | Scenario list from `generateAllScenarios()` and env defaults (`GALLERY_PORT`, `GALLERY_CONCURRENCY`, capture mode, shard, strict overlay)     | API-capture mode: `buildUrlParams(config)` -> `URLSearchParams` -> local handler request, forced `_fullRender`; preview mode navigates app URL with same serialized params                         | `scripts/generate-gallery-browser.mjs:61-79`, `scripts/generate-gallery-browser.mjs:226-251`, `scripts/generate-gallery-browser.mjs:569-628`   |
| Remote/API gallery renderer          | `scripts/generate-gallery-remote.mjs` `main()`                  | Scenario list from `generateAllScenarios()` and env defaults (`GALLERY_API_URL`, `GALLERY_ASSET_URL`, `GALLERY_CONCURRENCY`, timeouts, shard) | `buildUrlParams(config)` -> `URLSearchParams`; relative `img` upgraded to absolute asset URL; forced `_fullRender`; optional `_strictOverlay`; fetches from `${API_BASE}`                          | `scripts/generate-gallery-remote.mjs:48-72`, `scripts/generate-gallery-remote.mjs:178-198`, `scripts/generate-gallery-remote.mjs:400-447`      |
| Shared gallery scenario source       | `scripts/lib/gallery-permutations.mjs` `generateAllScenarios()` | `GLOBALS`, payload/fixture constants, overlay canonical defaults                                                                              | `buildUrlParams(config)` serializes every non-empty `config.params` entry into query params                                                                                                        | `scripts/lib/gallery-permutations.mjs:11-32`, `scripts/lib/gallery-permutations.mjs:176-199`, `scripts/lib/gallery-permutations.mjs:4411-4468` |
| App route execution                  | `src/App.tsx` (`getPageFromLocation()`, mount URL-load effect)  | Browser path/hash route parsing; editor-only URL param application into store                                                                 | `parseUrlParams()` -> `parseUrlParamsFromSearchParams(new URLSearchParams(location.search))` then many store setter calls                                                                          | `src/App.tsx:61-90`, `src/App.tsx:365-437`, `src/modules/share-links/url-params.ts:34-120`                                                     |
| Gallery page link/render URL builder | `src/data/gallery-items.ts`                                     | Generated gallery item params + fixed base URL `https://anqr.link`                                                                            | `buildGallerySearchParams()` strips `#` for colors, absolutizes `img`, then builds editor URL `/?...` and API URL `/api/qr?...&_fullRender=1`                                                      | `src/data/gallery-items.ts:58-97`                                                                                                              |
| API render handler                   | `netlify/functions/qr.ts` `handler(request)`                    | Server defaults (size, ecc, margin, overlay/dither/output defaults); cache behavior excludes non-cache params                                 | `new URL(request.url).searchParams` parsed into normalized render config values, then rendered; supports `_fullRender` and `_strictOverlay` flags                                                  | `netlify/functions/qr.ts:381-391`, `netlify/functions/qr.ts:2746-2763`, `netlify/functions/qr.ts:2786-2983`                                    |

## Mismatch / Root-Cause Notes

1. Overlay intensity default differs across layers by design:
   - Share-links serializer omits `intensity` only when value is `100` (`src/modules/share-links/url-params.ts:426-428`).
   - Store default and gallery canonical default are `50` (`src/store/qr-store.ts:1229`, `scripts/lib/gallery-permutations.mjs:180`).
   - API fallback is `100` when `intensity` is absent (`netlify/functions/qr.ts:2883-2886`).
   - Root cause: legacy generic share-link defaults (`100`) are broader than gallery parity defaults (`50`). Gallery scripts avoid drift by serializing canonical values directly from permutations.

2. Dither algorithm default differs across layers:
   - Store/gallery canonical default: `error_diffusion` (`src/store/qr-store.ts:1239`, `scripts/lib/gallery-permutations.mjs:188`).
   - API fallback default: `ordered_bayer` when `ditherKind` is omitted (`netlify/functions/qr.ts:388`, `netlify/functions/qr.ts:2920-2922`).
   - Root cause: server fallback optimized for generic performance, while gallery parity prioritizes explicit canonical serialization to preserve visual consistency.

3. Route-level execution scope differs intentionally:
   - `App.tsx` only auto-applies URL params on editor route (`src/App.tsx:367`).
   - Gallery list cards still build editor links and API render URLs via `src/data/gallery-items.ts`.
   - Root cause: route isolation keeps non-editor pages from mutating editor state while preserving a shareable/serializable query contract.

## Pass/Fail Verdict

`PASS` - Local, browser, app, and API execution paths were inventoried with explicit entry points, parameter defaults, and serialization paths; cross-layer default mismatches are documented with root causes.
