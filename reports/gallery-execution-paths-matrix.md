# Gallery Execution Paths Matrix (ANQ-144)

## Commands run
- `sed -n '1,300p' scripts/generate-gallery-local.mjs`
- `sed -n '1,300p' scripts/generate-gallery-browser.mjs`
- `sed -n '1,320p' scripts/generate-gallery-remote.mjs`
- `sed -n '1,340p' scripts/lib/gallery-permutations.mjs`
- `sed -n '2840,2960p' netlify/functions/qr.ts`
- `sed -n '320,640p' src/App.tsx`
- `sed -n '1160,1288p' src/store/qr-store.ts`
- `sed -n '1,260p' src/data/gallery-items.ts`
- `sed -n '1,570p' src/modules/share-links/url-params.ts`

## Source-of-truth matrix
| Path | Render entry point | Parameter source | Serialization path | Default owner(s) | Output/evidence |
|---|---|---|---|---|---|
| Local (batch) | `scripts/generate-gallery-local.mjs` -> `buildLocalRequest()` -> `netlify/functions/qr.ts` handler | Scenario configs from `generateAllScenarios()` in `scripts/lib/gallery-permutations.mjs` (`GLOBALS` + canonical overlay defaults + scenario overrides) | `scripts/lib/gallery-permutations.mjs` `buildUrlParams(config)` serializes every non-empty param; local runner adds `_fullRender=1` and optional `_strictOverlay=1`; local `img=/...` rewritten to `file://...` | `scripts/lib/gallery-permutations.mjs` (canonical gallery defaults) and `netlify/functions/qr.ts` (server fallback defaults) | Artifacts written under `reports/gallery-artifacts/local/` (`passed.txt`, `failed.txt`, `report.json`) |
| Browser (batch preview) | `scripts/generate-gallery-browser.mjs` with `GALLERY_BROWSER_CAPTURE_MODE=preview` -> Playwright `page.goto('/?query')` -> app render path | Same scenario configs (`generateAllScenarios()`) | `buildUrlParams(config)` then `buildPreviewScenarioUrl()`; `img` normalized to absolute URL; app parses URL via `parseUrlParams()` in `src/modules/share-links/url-params.ts` and applies to store in `src/App.tsx`; rendering happens via `useQRGenerator` | `src/store/qr-store.ts` defaults + URL override application in `src/App.tsx` | Artifacts under `reports/gallery-artifacts/browser/` when preview mode is used |
| Browser (batch api mode) | `scripts/generate-gallery-browser.mjs` default `CAPTURE_MODE=api` -> `buildLocalRequest()` -> in-process `netlify/functions/qr.ts` | Same scenario configs (`generateAllScenarios()`) | Same serialization as Local path (`buildUrlParams(config)` + `_fullRender=1`) | Same as Local path | Artifacts under `reports/gallery-artifacts/browser/` |
| Remote API (batch) | `scripts/generate-gallery-remote.mjs` -> `fetch()` to `https://anqr.link/api/qr` (default) | Same scenario configs (`generateAllScenarios()`) | `buildApiUrl(config)` -> `buildUrlParams(config)`; `img=/...` rewritten to absolute asset URL; `_fullRender=1`; optional `_strictOverlay=1`; optional `X-ANQR-Skip-Cache` | `scripts/lib/gallery-permutations.mjs` + remote Netlify function defaults in `netlify/functions/qr.ts` | Artifacts under `reports/gallery-artifacts/remote/` (`passed.txt`, `failed.txt`, `report.json`) |
| App (interactive/gallery click-through) | `src/data/gallery-items.ts` `buildGalleryUrl(item)` -> `/?query`; app boot parses query in `src/App.tsx`; render via `useQRGenerator` | `item.params` from generated showcase data (`src/data/gallery-showcase.generated.ts` via publish pipeline) | `buildGallerySearchParams()` and query string in `buildGalleryUrl()`; app decode via `parseUrlParams()` and setter application in `src/App.tsx` | `src/store/qr-store.ts` defaults unless overridden by URL params | Runtime preview canvas in app (`src/hooks/useQRGenerator.ts`); gallery fallback image URL uses `buildGalleryRenderImageUrl(item)` -> `/api/qr` |

## Evidence artifact paths
- `reports/gallery-execution-paths-matrix.md` (this matrix)
- `scripts/generate-gallery-local.mjs`
- `scripts/generate-gallery-browser.mjs`
- `scripts/generate-gallery-remote.mjs`
- `scripts/lib/gallery-permutations.mjs`
- `netlify/functions/qr.ts`
- `src/App.tsx`
- `src/store/qr-store.ts`
- `src/modules/share-links/url-params.ts`
- `src/data/gallery-items.ts`

## Mismatch/root-cause notes
- `ditherKind` default mismatch exists between app/store and API fallback:
  - App/store default: `error_diffusion` (`src/store/qr-store.ts`)
  - API fallback: `ordered_bayer` (`DEFAULT_SERVER_DITHER` in `netlify/functions/qr.ts`)
  - Root cause: different default owners for interactive preview vs server handler.
  - Why gallery batch parity mostly holds: `scripts/lib/gallery-permutations.mjs` injects canonical defaults and serializes them explicitly, so API fallback is usually bypassed.
- `intensity` default mismatch exists if an overlay request omits explicit intensity:
  - Gallery canonical default: `50` (`OVERLAY_CANONICAL_DEFAULTS` in `scripts/lib/gallery-permutations.mjs`)
  - API fallback parser default: `100` (`params.get('intensity') || '100'` in `netlify/functions/qr.ts`)
  - Root cause: API fallback optimized for generic endpoint usage while gallery pipeline standardizes on store-like defaults.
- Serialization behavior differs by path:
  - Gallery permutation serializer (`scripts/lib/gallery-permutations.mjs`) keeps all non-empty params.
  - Share-link serializer (`src/modules/share-links/url-params.ts`) omits many default-valued params.
  - Root cause: gallery serializer prioritizes deterministic parity; share-link serializer prioritizes URL compactness.

## Pass/fail verdict
- **Pass with documented mismatches.**
- Result: all required gallery execution paths (local/browser/app/API), parameter sources, serialization paths, and default owners are mapped in one matrix with concrete file evidence.
