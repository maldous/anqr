# Gallery Execution Path Matrix (ANQ-144)

## command(s) run

```bash
rg -n "gallery|parseUrlParamsFromSearchParams|buildUrlParams|_fullRender|DEFAULT_SERVER_DITHER|DEFAULT_OUTPUT_FORMAT" \
  src scripts netlify/functions/qr.ts
nl -ba src/App.tsx | sed -n '60,90p;360,440p'
nl -ba src/store/qr-store.ts | sed -n '1129,1265p'
nl -ba src/modules/share-links/url-params.ts | sed -n '34,120p;420,520p'
nl -ba scripts/lib/gallery-permutations.mjs | sed -n '176,340p;4457,4468p'
nl -ba scripts/generate-gallery-local.mjs | sed -n '156,185p'
nl -ba scripts/generate-gallery-browser.mjs | sed -n '226,250p;355,364p;621,709p'
nl -ba scripts/generate-gallery-remote.mjs | sed -n '178,198p'
nl -ba src/data/gallery-items.ts | sed -n '1,108p'
nl -ba src/components/Gallery.tsx | sed -n '88,120p'
nl -ba netlify/functions/qr.ts | sed -n '387,391p;2754,2925p'
```

## single source-of-truth matrix

| Surface | Render entry point | Parameter source | Default baseline | Serialization path |
|---|---|---|---|---|
| App (interactive editor) | `App` parses URL, hydrates store, then `useQRGenerator` calls `qrGenerator.generate` | `location.search` -> `parseUrlParams()` -> store setters | Store defaults in `useQRStore` | URL decode: `parseUrlParamsFromSearchParams`; URL encode: `buildUrlParams` |
| App (gallery open in editor) | Gallery card link (`href="/?..."`) | `generatedGallerySections[].items[].params` via `buildGalleryUrl` | Gallery item params are explicit (generated showcase data) | `buildGallerySearchParams` normalizes `fg/bg/img`, then query string |
| App (gallery image fallback render URL) | Gallery card image fallback to `https://anqr.link/api/qr?...&_fullRender=1` | Same item params as above | Format forced by item animation state (`gif` or `png`) | `buildGalleryRenderImageUrl` appends `format` and `_fullRender=1` |
| Browser generator (`api` capture mode) | `scripts/generate-gallery-browser.mjs` in-process Netlify handler call | `generateAllScenarios()` configs -> `buildUrlParams(config)` | Scenario canonical overlay defaults applied before serialization | `buildLocalRequest` builds `Request` with `_fullRender=1`, optional `_strictOverlay`, local `img` rewrite |
| Browser generator (`preview` capture mode) | Playwright opens app URL (`/?...`) and captures canvas | `generateAllScenarios()` configs -> `buildUrlParams(config)` | Same canonical defaults as API mode | `buildPreviewScenarioUrl` rewrites relative `img` to absolute `BASE_URL`, then navigates to app |
| Local generator | `scripts/generate-gallery-local.mjs` imports `netlify/functions/qr.ts` and calls handler | `generateAllScenarios()` configs -> `buildUrlParams(config)` | Same canonical defaults as browser/remote | `buildLocalRequest` sets `_fullRender=1`, optional `_strictOverlay`, rewrites `img` to `file://` |
| Remote API generator | `scripts/generate-gallery-remote.mjs` fetches deployed `/api/qr` | `generateAllScenarios()` configs -> `buildUrlParams(config)` | Same canonical defaults as browser/local | `buildApiUrl` rewrites relative `img` to `https://anqr.link`, appends `_fullRender=1` |
| API renderer | `netlify/functions/qr.ts` handler parses URL params and renders server-side | Request query params | API internal defaults (size/ec/margin/output/dither/etc.) | Direct `URLSearchParams` parse in handler (`new URL(request.url).searchParams`) |

## evidence artifact paths

- `src/App.tsx`
- `src/hooks/useQRGenerator.ts`
- `src/store/qr-store.ts`
- `src/modules/share-links/url-params.ts`
- `src/components/Gallery.tsx`
- `src/data/gallery-items.ts`
- `scripts/lib/gallery-permutations.mjs`
- `scripts/generate-gallery-local.mjs`
- `scripts/generate-gallery-browser.mjs`
- `scripts/generate-gallery-remote.mjs`
- `netlify/functions/qr.ts`
- `docs/reports/gallery-execution-path-matrix.md`

## mismatch/root-cause notes

1. Overlay intensity default mismatch (`50` app/store vs `100` URL/API omission behavior):
   - App/store default: `overlay.intensity = 50` (`src/store/qr-store.ts`).
   - URL serializer omits `intensity` only when value is `100` (`src/modules/share-links/url-params.ts`).
   - API default when missing is `100` (`netlify/functions/qr.ts`).
   - Root cause: URL serializer and API parser baseline differs from store baseline; gallery pipeline mitigates by explicitly serializing canonical overlay defaults in scenario generation.

2. Dither default mismatch (`error_diffusion` app/store vs `ordered_bayer` API):
   - App/store default: `overlay.ditherKind = error_diffusion` (`src/store/qr-store.ts`).
   - API default when missing: `DEFAULT_SERVER_DITHER = ordered_bayer` (`netlify/functions/qr.ts`).
   - Root cause: server performance-oriented default diverges from interactive store default; gallery permutations again mitigate by serializing `ditherKind` explicitly.

3. Preservation default mismatch (timing/alignment/format/version protection):
   - App/store defaults are enabled (`preserveTiming`, `preserveAlignment`, `protectFormatInfo`, `protectVersionInfo` are true).
   - API treats omitted `keepTiming/keepAlign/protectFmt/protectVer` as false unless explicitly set.
   - Root cause: API parser uses opt-in booleans for these flags, while store defaults are opt-out.

## pass/fail verdict

PASS - Inventory completed with all requested execution surfaces mapped; cross-surface default mismatches documented with root cause.
