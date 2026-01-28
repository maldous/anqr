# Modules

This directory contains the core feature modules for ANQR. Each module is documented in its own README and exposes a public API via its module entrypoint. For convenience, `src/modules/index.ts` re-exports selected symbols, but prefer importing from the specific module to avoid name collisions.

## Module overview

- `animation`: Animated image parsing (GIF/WebP/APNG), frame management, animation patterns, and temporal effects. Depends on `dither-algorithms`.
- `browser-clipboard`: Clipboard helpers for text and images in browsers. No dependencies.
- `browser-io`: Canvas/Blob utilities, downloads, and native save via Capacitor. Depends on `platform`.
- `core`: Foundational math and color utilities (parsing, blending, gradients, contrast). No dependencies.
- `dither-algorithms`: Error diffusion, ordered, blue noise, temporal, and advanced dithering algorithms. No dependencies.
- `exporter`: PNG/WebP/JPEG/GIF/SVG export plus PNG metadata utilities. Depends on `browser-io` and `platform`.
- `overlay`: Overlay image processing (filters, crop/fit, dithering, watermark, blend modes). Depends on `core` and `dither-algorithms`.
- `payload-generators`: Payload string builders for QR content types (URL, WiFi, vCard, payments, crypto, OTP, etc.). No dependencies.
- `platform`: Capacitor adapters for AdMob and MediaStore saving on mobile. Depends on Capacitor runtime and `@capacitor-community/admob` (optional).
- `qr-analyzer`: QR decoding, safety checks, contrast/scannability analysis, and telemetry. Depends on `qr-decoder` and `core`.
- `qr-art`: Experimental QArt utilities for image-embedded QR codes (pixel mapping, URL helpers, GF math). Depends on `qr-encoder` types.
- `qr-decoder`: Pure QR decoding from ImageData/canvas with no external deps. Depends on `qr-spec`.
- `qr-encoder`: Pure QR encoding (matrix generation, modes, version/ECC handling). Depends on `qr-spec`.
- `qr-generator`: High-level QR styling and rendering (gradients, overlays, dithering, styles). Depends on `qr-encoder`, `qr-spec`, `core`, `overlay`, `dither-algorithms`.
- `qr-spec`: QR spec constants and math (patterns, masks, capacities, BCH). No dependencies.
- `share-links`: Share URL parsing/serialization, embed code, and social share links. No dependencies.

## Notes

- Each module has its own `README.md` for detailed API docs and examples.
- The root `index.ts` re-exports curated symbols; use direct module imports for full APIs.
