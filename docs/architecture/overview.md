# Architecture Overview

ANQR is a Vite/React QR generation application with shared rendering logic used by both UI and server rendering paths. The app ships as a web app, a Netlify serverless API, and native iOS/Android apps via Capacitor.

## Runtime Flows

- **Web client**: Stateful editor and preview pipeline in `src/`, served via Vite dev server (proxied through `netlify dev` on port 8888 during testing).
- **Netlify function**: `netlify/functions/qr.ts` parses URL params and renders via shared generator modules using `@napi-rs/canvas`.
- **iOS app**: Capacitor WebView shell (`ios/`) with native AdMob, toast, and file-saving via Capacitor plugins.
- **Android app**: Capacitor WebView shell (`android/`) with native AdMob, MediaStore, and file-saving.
- **Shared module architecture**: `src/modules/*` exposes focused APIs by domain.

## Key Boundaries

- Payload generation and transformations: `payload-generators`, store payload mapping.
- QR matrix generation and spec math: `qr-encoder`, `qr-spec`.
- Visual styling, overlays, animation, and export: `qr-generator`, `overlay`, `animation`, `exporter`.
- Scan safety and analysis: `qr-analyzer`, `qr-decoder`, `core` contrast helpers.
- Platform adapters: `platform` module gates behavior by `Capacitor.isNativePlatform()` (AdMob, native toast, web-only asset loading, banner height tracking).

## Cross-Platform QR Rendering Parity

The same QR configuration must produce visually consistent output across all rendering paths:

| Path    | Canvas Implementation    | Test Coverage                                              |
| ------- | ------------------------ | ---------------------------------------------------------- |
| Browser | HTML5 `<canvas>`         | Playwright E2E (`tests/basic\|advanced\|professional/`)    |
| API     | `@napi-rs/canvas` (Node) | Playwright API tests (`tests/api/qr-api.spec.ts`)          |
| iOS     | WKWebView `<canvas>`     | Appium E2E (`tests/appium/specs/ios-platform.spec.ts`)     |
| Android | WebView `<canvas>`       | Appium E2E (`tests/appium/specs/android-platform.spec.ts`) |

Pixel-level parity between browser and API is verified by `tests/api/cross-platform-parity.spec.ts` using `pixelmatch` + `pngjs` (tolerance: 15% diff threshold).

## Compatibility Risk

Share parameter changes must stay aligned between:

- client-side share URL encoder/decoder, and
- server-side `/api/qr` query parser.

Drift between these two paths causes preview/render mismatches.
