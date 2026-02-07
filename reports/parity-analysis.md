# Client/Server Param Parity Analysis (2026‑02‑07)

## Current counts
- Client (share‑links/url‑params): **169** keys
- Server (netlify/functions/qr.ts): **169** keys
- Client‑only: **0** keys
- Server‑only: **0** keys

Report source: `reports/param-parity.json`

## Client‑only keys
- None. Current server parser covers all keys emitted by share‑links.

## Server‑only keys
- None.

## Recommendation
- Decide a **single source of truth** for share params (shared schema or generated mapping).
- Keep compatibility aliases (`maxOverlayIntensity*` and `maxInt*`) in both client and server parser paths.
