# Client/Server Param Parity Analysis (2026‑02‑07)

## Current counts
- Client (share‑links/url‑params): **165** keys
- Server (netlify/functions/qr.ts): **158** keys
- Client‑only: **11** keys
- Server‑only: **4** keys

Report source: `reports/param-parity.json`

## Client‑only keys & suggested actions
- **gifDisp**: output GIF disposal (client). Server only supports `gifDispH` (handling). Consider adding support or explicitly mark client‑only.
- **gifDith / gifQuant / gifPal / gifTrans**: GIF quant/dither/transparent. Server currently only uses `gifColors`. Decide whether to implement or drop from share‑links for embeds.
- **gifMaxFps**: client export control. Server uses `animFrames`/`animSpeed`. Consider mapping to a cap on `animSpeed`/frame count.
- **jpegQ**: server does not support JPEG output. Either add JPEG support or suppress in share‑links when target is embed.
- **lang**: client UI locale; safe to ignore on server.
- **qaRot**: QA rotation simulation; client‑only.
- **subpixel**: legacy toggle (share‑links only). Decide whether to map to overlay mode or deprecate in favor of `mode=subpixel`.
- **svgVec**: server doesn’t emit SVG. Decide whether to implement SVG output or mark client‑only.

## Server‑only keys
- **maxOverlayIntensityL/M/Q/H**: server accepts per‑ECC intensity limits, but client doesn’t emit. Consider adding to share‑links when the UI exposes safe‑overlay limits.

## Recommendation
- Decide a **single source of truth** for share params (shared schema or generated mapping).
- ✅ Server aliases added for `speed`, `seed`, `qzEnforce`, `spGridNum`.
- Explicitly mark embed‑unsupported keys (gif quant/dither, jpeg, svg) and block in share‑links when targeting server.
