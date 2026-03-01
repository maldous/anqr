# Optimization Log

## 2026-03-01

- Started from `optimise.txt` and implemented item 3 first (`[HUGE][STARTUP+MEM]` gallery payload split).
- Added lightweight gallery section manifest at `src/data/gallery-manifest.ts`.
- Rewired `Header` to consume `gallerySectionManifest` instead of `gallerySections`, removing runtime dependency on `gallery-showcase.generated.ts` from the header/editor path.
- Kept full generated showcase loading in `Gallery` route path (`src/components/Gallery.tsx` via `src/data/gallery-items.ts`), preserving behavior.
- Unified `GalleryCategory` typing through the new manifest and updated `App.tsx` type import accordingly.
- Decision: prioritized this optimization before deeper render-pipeline changes because it is high impact for startup and low risk to QR correctness.
- Implemented item 4 (`[HUGE][STARTUP]` lazy QR-Art core loading): removed static `@/modules/qr-art` import from `useQRGenerator` and added cached dynamic import (`loadQArtModule()`).
- QR-Art functions are now loaded only when artwork generation paths execute (single preview generation and animation frame generation), avoiding eager RS/elimination code in the editor path.
- Implemented item 5 direction (`[HUGE][CPU+MEM]` packed matrix retention): removed per-generation unpack for worker-rendered QR-Art previews and now keep packed worker matrix in `qrPackedMatrixRef`.
- Packed matrix is expanded only on demand during true-vector SVG export, avoiding immediate `Uint8Array -> boolean[][]` expansion in the preview hot path.
- Implemented item 22 (`[BIG][CPU]`): replaced `sanitizeQArtRenderConfig` structuredClone/JSON fallback with a manual plain-data copier to avoid JSON stringify/parse overhead on Android WebView.
- Implemented item 8 (`[HUGE][CPU+MEM]` transferable worker payloads):
  - Validation worker now receives `{ width, height, pixels }` instead of cloned `ImageData` objects; reconstructs `ImageData` in worker.
  - QR-Art worker protocol now receives raw transferable pixel payload (`targetImageWidth/Height/Pixels`) and reconstructs `ImageData` in worker.
  - Goal: reduce structured-clone overhead and GC churn in worker messaging paths.
- Implemented item 33 (`[BIG][CPU]` canvas context read hints):
  - Added `willReadFrequently: true` + `desynchronized: true` where hot `getImageData` paths acquire 2D contexts in:
    - `src/modules/qr-generator/overlay-data.ts`
    - `src/modules/qr-generator/utils.ts` (`hashCanvasContent`)
    - `src/modules/qr-generator/scaled-render.ts`
  - Includes fallback to plain `getContext('2d')` for compatibility.
- Implemented item 9/36 direction (`[HUGE/BIG][CPU]` hash canvas allocation reduction):
  - `hashCanvasContent` now reuses a shared 32x32 hash canvas with an in-use guard and fallback canvas when contended.
  - Removed per-call DOM canvas creation in the common path, while keeping compatibility for non-DOM canvas factories.
- Implemented item 82 (`[LOW][CPU]`): switched `hashString` from `codePointAt` to `charCodeAt` in `src/modules/qr-generator/utils.ts` for UTF-16 unit hashing fast-path.
- Implemented item 52 direction (`[MED][CPU]`): added fill-style state tracking in `render-loop` to avoid redundant `ctx.fillStyle` assignments in the per-module full render path.
