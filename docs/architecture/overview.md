# Architecture Overview

ANQR is a React + Vite application (with Capacitor Android support) that generates styled QR codes across web UI and server render surfaces.

## Runtime Surfaces

- Interactive app: editor-driven QR generation in browser canvas.
- Server rendering: Netlify function image generation for shared URLs.
- Mobile integration: Capacitor-native save and ad integrations.

## Core Flow

1. UI and URL params update Zustand state.
2. `useQRGenerator` derives generation config from store slices.
3. `QRGenerator` composes matrix/render output via encoder/spec/render modules.
4. Optional analyzer/decoder checks validate readability.
5. Export and share modules produce delivery formats and links.

## Canonical Technical References

- Module catalog: [`../modules/index.md`](../modules/index.md)
- Reports and validation docs: [`../reports/README.md`](../reports/README.md)
- Historical deep dive snapshot: [`../archive/knowledge-2026-02-18.md`](../archive/knowledge-2026-02-18.md)

