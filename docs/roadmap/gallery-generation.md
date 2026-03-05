# Gallery Generation Roadmap

The gallery plan defines deterministic scenario generation across non-overlay, overlay, and artwork categories.

## Current Approach

- Permutation engine: `scripts/lib/gallery-permutations.mjs`
- Rendering runners:
  - `scripts/generate-gallery-local.mjs`
  - `scripts/generate-gallery-browser.mjs`
  - `scripts/generate-gallery-remote.mjs`

## Goals

- Keep scenario generation deterministic and reproducible.
- Maintain parity checks across local/browser/remote renderers.
- Preserve scanability constraints while maximizing option coverage.

## Archive

- Historical detailed plan snapshot: [`docs/archive/gallery-idea-2026-02-18.md`](../archive/gallery-idea-2026-02-18.md)
