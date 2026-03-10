# Render Divergence Risk Audit

## Scope

Audit targets:

- App rendering path (`src/hooks/useQRGenerator.ts`, `src/App.tsx`)
- Local/browser/remote gallery renderers (`scripts/generate-gallery-*.mjs`)
- Server render path (`netlify/functions/qr.ts`, `netlify/functions/qr-render-background.ts`)
- URL serialization and transport (`src/modules/share-links/url-params.ts`, `src/modules/share-links/embed.ts`)

## Root Causes

1. URL transport is not symmetric across app/share/embed/API paths.
- `src/modules/share-links/embed.ts` only forwards a curated parameter subset, so embed URLs can silently drop render-affecting params compared with share URLs and direct app state.
- `src/modules/share-links/url-params.ts` serializes defaults by omission, which is fine only while every consumer keeps identical defaults; this creates drift risk when defaults change.

2. Renderer defaults and branch behavior are coupled but distributed.
- `netlify/functions/qr.ts` defaults output format via `DEFAULT_OUTPUT_FORMAT` and then mutates format again based on overlay/animation branches.
- `src/modules/share-links/url-params.ts` omits `format` when defaulting to GIF (`config.format !== 'gif'`), making server default changes high-impact for parity.

3. Scan-gate profile differs by execution path.
- App animation preview explicitly uses `scanGateProfile: 'preview'` in `src/hooks/useQRGenerator.ts`.
- Server rendering forces full scan-gate parity (`scanGateProfile: 'full'`) in `netlify/functions/qr.ts`.
- This can produce expected visual/decodability differences for dither-heavy overlays even with identical query params.

4. Canvas state and DPR handling are not normalized across all paths.
- App display path in `drawToDisplayCanvas()` applies device DPR scaling and a forced square display surface.
- Export path separately rescales with conditional smoothing; preview path always disables smoothing before draw.
- `CanvasPool.acquire()` in `src/modules/qr-generator/canvas-factory.ts` resets several context properties but not full raster state, so pooled canvases can retain subtle state between renders.

5. Cache/transport behavior differs between foreground and background server flows.
- `netlify/functions/qr.ts` cache key ignores `_strictOverlay` (`NON_CACHE_PARAMS` includes it).
- `netlify/functions/qr-render-background.ts` cache key list does not include `_strictOverlay`.
- Result: background and foreground cache-key behavior can diverge for strict overlay requests.

6. Remote artifact classification depends on runtime response headers.
- `scripts/generate-gallery-local.mjs`, `scripts/generate-gallery-browser.mjs`, and `scripts/generate-gallery-remote.mjs` infer output extension from `Content-Type`.
- Any header mismatch (or upstream rewrite) changes artifact type handling independently of query params and can mask true rendering parity.

## Blockers

1. No single canonical parity contract for defaults across app state, URL serializer, embed conversion, and server parser.

2. No end-to-end deterministic baseline that locks:
- URL param set
- Render branch (preview/full/off scan-gate)
- Canvas DPR/state assumptions
- Output encoding expectations

3. Remote parity depends on deployed infrastructure behavior (headers/cache/background generation) that is not fully reproducible in local in-process runs.

4. Existing parity checks validate key presence (`tests/unit/share-param-parity.spec.ts`) but do not enforce default-value parity or branch-equivalence semantics.
