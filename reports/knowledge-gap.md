# knowledge.md Gap Notes (Initial)

## High-level mismatches
- **Module layout has changed**: `knowledge.md` references flat files like `src/modules/qr-generator.js`, `overlay-processor.ts`, `exporter.ts`, `share-utils.ts`. The current repo has **directory-based modules**:
  - `src/modules/qr-generator/` (many files, main class in `qr-generator-class.ts`)
  - `src/modules/overlay/`
  - `src/modules/exporter/`
  - `src/modules/share-links/`
  - `src/modules/qr-encoder/`, `src/modules/qr-spec/`, `src/modules/qr-analyzer/`, `src/modules/qr-art/`
- **New subsystem split**: generator pipeline is now decomposed into pixel-matrix + render-loop + scaled-render + render-modes + overlay-subpixel etc, which are not described in `knowledge.md`.
- **Share logic location**: share URL parsing/encoding now lives in `src/modules/share-links/` rather than `share-utils.ts`.
- **Analyzer location**: analysis tooling now resides in `src/modules/qr-analyzer/` and `src/components/Analyze.tsx` (not listed in the old file list).

## Required knowledge.md updates (to be executed later)
- Update architecture diagrams and module references to new paths.
- Replace the 73-file list with current `src/modules/*` directory inventory.
- Update share/URL param parity section to point at `share-links/url-params.ts` and `netlify/functions/qr.ts`.
- Add QR‑art + analyzer submodules to the “Subsystem deep dives” section.
