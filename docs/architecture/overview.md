# Architecture Overview

ANQR is a Vite/React QR generation application with shared rendering logic used by both UI and server rendering paths.

## Runtime Flows

- Client app: stateful editor and preview pipeline in `src/`.
- Netlify function: `netlify/functions/qr.ts` parses URL params and renders via shared generator modules.
- Shared module architecture: `src/modules/*` exposes focused APIs by domain.

## Key Boundaries

- Payload generation and transformations: `payload-generators`, store payload mapping.
- QR matrix generation and spec math: `qr-encoder`, `qr-spec`.
- Visual styling, overlays, animation, and export: `qr-generator`, `overlay`, `animation`, `exporter`.
- Scan safety and analysis: `qr-analyzer`, `qr-decoder`, `core` contrast helpers.

## Compatibility Risk

Share parameter changes must stay aligned between:

- client-side share URL encoder/decoder, and
- server-side `/api/qr` query parser.

Drift between these two paths causes preview/render mismatches.
