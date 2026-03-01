# Optimization Log

## 2026-03-01

- Started from `optimise.txt` and implemented item 3 first (`[HUGE][STARTUP+MEM]` gallery payload split).
- Added lightweight gallery section manifest at `src/data/gallery-manifest.ts`.
- Rewired `Header` to consume `gallerySectionManifest` instead of `gallerySections`, removing runtime dependency on `gallery-showcase.generated.ts` from the header/editor path.
- Kept full generated showcase loading in `Gallery` route path (`src/components/Gallery.tsx` via `src/data/gallery-items.ts`), preserving behavior.
- Unified `GalleryCategory` typing through the new manifest and updated `App.tsx` type import accordingly.
- Decision: prioritized this optimization before deeper render-pipeline changes because it is high impact for startup and low risk to QR correctness.
