# In-App Render Baseline Corpus Validation (ANQ-149)

## command(s) run

```bash
# 12-scenario representative baseline corpus (nooverlay + overlay + artwork)
IDS='nooverlay__default--1,nooverlay__style-rounded--2,nooverlay__style-dots--3,nooverlay__style-diamond--4,overlay__mode-center-tsunami--1,overlay__mode-center-logo--2,overlay__mode-center-test--3,overlay__mode-center-santa--4,artwork__art-santa-anim-stack-wave-drift--267,artwork__art-santa-anim-shimmer--259,artwork__art-santa-mega--271,artwork__art-santa-anim-drift--261'

npm run dev -- --host 127.0.0.1 --port 5173   # fell back to 5174 (port 5173 already in use)

GALLERY_IDS="$IDS" GALLERY_CONCURRENCY=4 node --import tsx scripts/generate-gallery-local.mjs
GALLERY_IDS="$IDS" GALLERY_CONCURRENCY=2 node --import tsx scripts/generate-gallery-remote.mjs
GALLERY_IDS="$IDS" GALLERY_BROWSER_CAPTURE_MODE=preview GALLERY_PORT=5174 GALLERY_CONCURRENCY=2 node --import tsx scripts/generate-gallery-browser.mjs

node --import tsx scripts/compare-gallery-artifacts.mjs
npx vitest run tests/unit/share-param-parity.spec.ts
```

## evidence artifact paths

- `reports/gallery-artifacts/local/report.json`
- `reports/gallery-artifacts/browser/report.json`
- `reports/gallery-artifacts/remote/report.json`
- `reports/gallery-artifacts/consistency-report.json`
- `reports/gallery-artifacts/consistency-report.md`

## mismatch/root-cause notes

1. In-app preview URL parsing missed API-style `modulePx` parameter, so preview rendering used store default module size instead of corpus-specified size.
   - Root cause: `parseUrlParamsFromSearchParams()` accepted `size` but not `modulePx` alias.
   - Fix: parse `modulePx` as alias for `size` in `src/modules/share-links/url-params.ts`.

2. In-app preview capture could snapshot before app render lifecycle reached `idle`.
   - Root cause: browser generator waited for painted canvas, not explicit preview render-idle signal.
   - Fix: browser preview capture now waits for `[data-testid="qr-preview"][data-rendering-state="idle"]` in `scripts/generate-gallery-browser.mjs`.

3. Remaining non-exact byte parity exists for part of the corpus, but decode/payload and dimensions are aligned for all 12/12 scenarios across local/browser/remote.
   - Local/remote stayed byte-equal for 11/12 sampled scenarios.
   - Browser preview parity improved after the parser fix (e.g., `nooverlay__style-rounded--2` is now exact across all three surfaces).

## pass/fail verdict

PASS - in-app parity contract gap was identified and fixed (`modulePx` alias + render-idle capture guard), and the sampled baseline corpus now passes decode/payload + dimension parity across local/browser/API.
