# ANQR Web Shell Bundle & Boot Path Review

## What's already good

Lazy-loading boundaries are clean: `Analyze`, `Gallery`, `StaticPage`, `WelcomeModal` all use `React.lazy()` (`shell/analyze.tsx:2`, `shell/gallery.tsx:3`, `shell/static-page.tsx:3`, `shell/welcome-modal.tsx:3`), each wrapped in a `Suspense` boundary in `app-content.tsx:381`. The manualChunks plan in `vite-config/vite-config.const.ts:353` is thoughtful: separate vendor chunks for React, Radix, i18n, icons, GIF, date, Sentry. `cssCodeSplit: true`, `target: es2022`, OXC minification and gzip compression are all wired (`vite-config.const.ts:33-49,339-349`). Netlify cache headers on `/assets/*` are `public, max-age=31536000, immutable` (`netlify.toml:63-66`) — the hashed-asset cache story is correct. Tailwind v4 auto-content-detection produces a single 84 KB CSS (`index-B12kbYlo.css`) — purge is effective. `Capacitor.isNativePlatform()` guards work; only `@capacitor/core` (small) leaks into the web bundle, and AdMob/SplashScreen are dynamic-imported. Tree-shaking blockers are minimal — only one `import *` outside Sentry (`i18n/static/static-content-cache.ts:2`) and it sits in a static-content path that isn't on the editor critical path. Error boundary + Suspense fallback structure (`boot/main.tsx:122-133`) is correct.

## Findings

### F1 — Gallery showcase data (320 KB) loads on the editor critical path
**Confidence:** ⚡ measured | **Risk:** low | **Effort:** low

`vite-config/vite-config.const.ts:425-426` declares:
```ts
if (id.includes("/content/gallery/") && !id.includes("gallery-showcase.generated"))
  return "shared-gallery-data";
```
and `:474` declares `/data/gallery-showcase.generated` → `app-gallery-generated`. But the file is at `apps/web/src/content/generated/gallery-showcase.generated.ts` (14,024 LOC, 320 items). Neither rule matches `/content/generated/...` — so Rollup co-locates the showcase with its only static importer, `content/gallery/gallery-items.ts`, which falls under the first rule. The chunk `shared-gallery-data-ck-nSIF1.js` is 320 KB raw / 16 KB gz and shows 320 `id:` markers.

Worse, `shell/app-content.tsx:30` and `shell/header/header.tsx:31` import `content/gallery/gallery-manifest` (a tiny 30-line list). Because `gallery-items.ts` (which pulls the showcase) lives in the same `/content/gallery/` directory, Rollup pulls the entire showcase into the chunk that the manifest references — even though `Header` only needs the 10-item `gallerySectionManifest`.

**Recommendation:** Fix in two places:
1. Update the manualChunks rule to match the actual path: `id.includes("/content/generated/gallery-showcase")` → `app-gallery-generated`.
2. Break the static import in `apps/web/src/content/gallery/gallery-items.ts:8` — make `generatedGallerySections` a dynamic import resolved inside `Gallery` (which is already `React.lazy`-loaded). The header only needs `gallery-manifest.ts`, which has zero showcase deps.

Combined saving: ~310 KB raw / ~14 KB gz off the editor first paint, plus a cleaner chunk graph.

---

### F2 — `await preloadDetectedLocale()` blocks first paint for ~85% of users
**Confidence:** ⚡ measured | **Risk:** medium | **Effort:** low

`apps/web/src/boot/main.tsx:137-138`:
```ts
await preloadDetectedLocale();
renderApp();
```
This top-level await prevents `ReactDOM.createRoot(...).render(...)` from running until the detected locale's translation JSON has loaded. For any non-`en-GB` user (most of the world), this serially adds one extra round-trip after the main JS arrives, with **nothing on screen** — the `Suspense` fallback inside the render tree never gets a chance to show.

`preloadDetectedLocale` (`i18n/preload-detected-locale.ts:6-9`) returns early only when language is `en-GB`. The fix is to render synchronously and let i18n's `useSuspense` / fallback render the spinner (which is what the existing top-level Suspense at `main.tsx:122-133` is for).

**Recommendation:** Render immediately; trigger `preloadDetectedLocale()` without awaiting and let React.Suspense + react-i18next show the existing "Loading…" fallback while the locale arrives.

---

### F3 — Sentry Replay (~150 KB gz) ships in the initial vendor chunk despite sampleRate 0/0.5
**Confidence:** ⚡ measured | **Risk:** low | **Effort:** medium

`dist/assets/vendor-sentry-CvvcB3oK.js` is 532 KB raw / 156 KB gz — the single largest non-worker chunk on first paint. Verified `replayIntegration`, `ReplayContainer`, and `browserTracingIntegration` strings are all present. Yet `boot/main.tsx:90-91` sets `replaysSessionSampleRate: 0` and `replaysOnErrorSampleRate: 0.5` (web) / `0` (Capacitor) — Replay is only activated on errors, but the recorder code ships unconditionally.

**Recommendation:** Use `Sentry.lazyLoadIntegration("replayIntegration")` and register it from `beforeSend` (or the first error hook). The browser-tracing integration is also low-value at `tracesSampleRate: 0.01` and could be moved to a `requestIdleCallback`-deferred extension. Realistic saving on the gz initial chain: 100–150 KB.

---

### F4 — Service Worker precache contains ~367 JS chunks; manifestTransforms filter misses the actual locale names
**Confidence:** ⚡ measured | **Risk:** medium | **Effort:** low

`vite-config/vite-config.const.ts:309-323` filters `assets/locale-*` and `assets/static-*` out of the precache. But the per-language re-export shims emit as `assets/vi-DREpekp_.js`, `assets/uk-Bpfo9Cnp.js`, `assets/ur-DixGWS55.js`, etc. — short language codes with no `locale-` / `static-` prefix. They survive the filter.

Verified: `dist/sw.js` lists 367 unique `assets/*.js` entries. Sample includes `assets/gu-48r2bf_r.js`, `assets/vi-My3jCfBg.js` — clearly per-locale shims that should NOT be precached for an en-GB-default install.

This means first-visit SW install pulls ~10× more than the English-only app shell needs.

**Recommendation:** Tighten the manifest filter to also strip:
```ts
if (/\/assets\/[a-z]{2}(-[A-Z]{2})?-[A-Za-z0-9_-]+\.js$/.test(url)) {
  if (!/\/assets\/en(-GB)?-/.test(url)) return false;
}
```
Cleaner: name the shim chunks deterministically (`locale-vi.shim.js`) by tweaking the manualChunks output naming so the existing filter catches them.

---

### F5 — `favicon.ico` is actually a PNG; precache warning is real
**Confidence:** ⚡ measured | **Risk:** low | **Effort:** low

`file dist/favicon.ico` → `PNG image data, 32 x 32, 8-bit/color RGB, non-interlaced`. The source at `public/favicon.ico` has the same mislabelling. Workbox flags `bad-precaching-response` because the Content-Type Netlify serves (`image/x-icon`) doesn't match the body.

**Recommendation:** Replace `public/favicon.ico` with a real .ico file (multi-resolution preferred), or rename to `favicon.png` and update `index.html:13-15`.

---

### F6 — `qr-store` chunk is 336 KB raw and sits on the editor critical path
**Confidence:** ⚡ measured | **Risk:** low | **Effort:** high

`apps/web/src/state/qr-store.ts` is 1057 lines, mostly inline defaults across ~50 payload helpers plus ~30 render config defaults. The store is reached statically from `shell/app.tsx:4`, so it's on every first paint.

**Recommendation:** Extract the inline default constants (e.g. `DEFAULT_PAYLOAD`, `DEFAULT_RENDER`, `DEFAULT_OVERLAY`, etc.) into a sibling `qr-store-defaults.ts` and make them a separate chunk. The store object itself can be ~150 lines of pure setters.

---

### F7 — 38 MB of `.map` files sit in `dist/assets/` after build
**Confidence:** ⚡ measured | **Risk:** medium | **Effort:** low

`ls dist/assets/*.map | wc -l` → 204; `du -ch dist/assets/*.map` → 38M. `vite-config/vite-config.const.ts:52-91` runs **two** Sentry vite plugins back to back. Only the second sets `filesToDeleteAfterUpload: ["./dist/**/*.js.map"]` (`:87`). The first uploads but does NOT delete.

`sourceMappingURL` is embedded in `index-*.js` and `vendor-sentry-*.js` — if maps are deployed, anyone browsing devtools can read the original source.

**Recommendation:** Confirm maps are deleted from the actual Netlify upload. Move `filesToDeleteAfterUpload` to the **first** plugin call (or merge the two plugins).

---

### F8 — Iubenda + AdSense load on first paint; Iubenda lazy-loads OK but AdSense ~80 KB is unconditional
**Confidence:** 🔍 inferred | **Risk:** low | **Effort:** low

`packages/platform/browser/src/boot/web-only-assets.ts:55-69` injects 5 third-party scripts synchronously on web boot, including `adsbygoogle.js` (~80 KB gz on Google's CDN). They're all `async`, so they don't block parser, but they do compete for the network during first-paint critical path. AdSense isn't actually needed until after the first ad slot mounts.

**Recommendation:** Move `addScript("anqr-adsense", ...)` out of `loadWebOnlyBootAssets()` and into a deferred path triggered after `load` or `requestIdleCallback`. Iubenda needs to stay early.

---

### F9 — `initRemoteDiagnostics()` runs synchronously on every boot to expose dev console
**Confidence:** 🔍 inferred | **Risk:** low | **Effort:** low

`boot/main.tsx:97` calls `initRemoteDiagnostics()` which wires 12 functions to `window.anqrDiag` for console debugging. This pulls in the logging package at boot, even though 99.9% of users never type `anqrDiag` into devtools.

**Recommendation:** Gate behind `import.meta.env.DEV`, or guard the window-exposure block with `if (localStorage.getItem("anqrDiagEnabled") === "true")`. Estimated save: 5–10 KB gz.

---

### F10 — Two separate Sentry vite plugins double initialization cost
**Confidence:** 🔍 inferred | **Risk:** low | **Effort:** low

`vite-config/vite-config.const.ts:52-91` instantiates `sentryVitePlugin` twice — once for `anqr-mobile` and once for `sentryProject`. They both walk the same `./dist/**/*.js` glob, both upload the same release, both set `setCommits: { auto: true }`. This roughly doubles build-time Sentry overhead and is the root cause of the asymmetric `filesToDeleteAfterUpload` config in F7.

**Recommendation:** Merge into a single plugin call, or post-upload with a thin shell script.

---

### F11 — `app-qr-runtime` (20 KB) pulled by initial entry even though most users never export
**Confidence:** 🔍 inferred | **Risk:** medium | **Effort:** medium

`dist/assets/index-BgLxkWBR.js` static-imports `app-qr-runtime-Dt3go3lf.js`. The chunk contains `/modules/overlay`, `/modules/dither`, `/modules/exporter`, `/modules/qr-encoder`, etc. — but at 20 KB it's small because most heavy QR work lives in `worker-D9vX3B6J.js` (788 KB raw, web-worker only). The boot chain pulls runtime symbols that could be deferred.

---

### F12 — Source-of-truth split between `vite-config/` package and root `vite.config.ts`
**Confidence:** 🔍 inferred | **Risk:** low | **Effort:** low

`vite.config.ts` is 3 lines re-exporting `vite-config/vite-config.const.ts`. The 530-line config is one of the project's hottest files; the indirection adds onboarding friction and prevents tools (Sentry CLI, Vite IDE plugins) from finding it via their default config-name globs.

---

## Recommendations ranked by ROI

1. **Fix the gallery-showcase chunking bug (F1).** One line in `vite-config/vite-config.const.ts:474` + one dynamic import in `content/gallery/gallery-items.ts:8`. Drops 320 KB raw / 16 KB gz off editor first paint. **Highest ROI** — measured, isolated, low risk.
2. **Remove the top-level `await preloadDetectedLocale()` in `boot/main.tsx:137` (F2).** Render React immediately. Saves one full round-trip TTI for ~85% of users.
3. **Tighten the SW precache manifest filter (F4).** Regex for per-language re-export shims. Drops first-install precache from ~367 chunks to ~25.
4. **Lazy-load Sentry Replay via `Sentry.lazyLoadIntegration` (F3).** Saves ~100–150 KB gz off the initial vendor chunk.
5. **Replace `public/favicon.ico` with a real ICO file (F5).** Fixes `bad-precaching-response` console noise.
6. **Verify sourcemaps are stripped from production deploys (F7).** Move `filesToDeleteAfterUpload` to the first sentry plugin (or merge both).
7. **Defer AdSense loader to `requestIdleCallback` (F8).**
8. **Gate `initRemoteDiagnostics` window globals behind `import.meta.env.DEV` (F9).**
9. **Merge the two `sentryVitePlugin` calls (F10).**
10. **(Lower priority)** Extract qr-store defaults into a separate chunk (F6); audit `app-qr-runtime` static dependencies (F11); consider moving the Vite config back to root (F12).
