# ANQR Codebase Knowledge (knowledge.md)

Generated: 2026-01-04 (Australia/Melbourne)


## Architecture at a glance

ANQR is a **React + Vite** web app (also wrapped by **Capacitor** for Android) that lets users configure and render QR codes (static or animated) with styling, overlays, watermarks, safety checks, sharing links, and exports.

There are three “execution surfaces” that all reuse the same core renderer:

1. **Web / Capacitor app**: interactive editor UI builds a config from state and renders into a `<canvas>`.
2. **Netlify Function (`netlify/functions/qr.ts`)**: server-side image generator used for `https://anqr.link/?...` style embed URLs (e.g. `<img src="...">`).
3. **Android native plugin**: a Capacitor plugin used to write files to the device’s Documents folder (MediaStore).

Key design idea: a single “QR render config object” is assembled from UI state, then passed into `src/modules/qr-generator/qr-generator-class.ts` to produce a canvas (and optionally matrix data for vector export).

## Core runtime flow (web)

```mermaid
flowchart TD
  A[src/main.tsx] --> B[src/App.tsx]
  B --> C[src/store/qr-store.ts]
  B --> D[src/components/Sidebar.tsx]
  B --> E[src/components/Preview.tsx]
  D --> C
  E --> F[src/hooks/useQRGenerator.ts]
  F --> C
  F --> G[src/modules/qr-generator/*]
  F --> H[src/modules/overlay/processor.ts]
  F --> I[src/modules/animation/*]
  F --> J[src/modules/exporter/*]
  F --> K[src/modules/qr-analyzer/*]
  G --> M[src/modules/qr-encoder/*]
  M --> N[src/modules/qr-spec/*]
  G --> O[src/modules/dither-algorithms/*]
  G --> Q[src/modules/core/color.ts]
  J --> R[src/modules/platform/media-store.ts]
```

### Step-by-step (editor)

1. **Boot** (`src/main.tsx`)
   - Creates the React root.
   - Wraps the app in providers (i18n, tooltips, error boundary).
2. **App controller** (`src/App.tsx`)
   - Chooses between “editor” vs static pages.
   - Parses URL params (`parseUrlParams`) to pre-load editor settings.
3. **State** (`src/store/qr-store.ts`)
   - Single Zustand store holds *all* editor settings: payload, encoding, render style, overlay, watermark, animation, output, safety, metadata, ads/QA, etc.
4. **UI** (components + sections)
   - Sidebar sections update slices of the store (e.g. Render / Overlay / Watermark).
   - Preview consumes the store and the generator hook to show render output + warnings.
5. **Generate** (`src/hooks/useQRGenerator.ts`)
   - Subscribes to store slices.
   - Builds a **debounced** generator config object.
   - Loads overlay images (static or animated), preprocesses them, and calls:
     - `qrGenerator.generate(config, overlayCanvas?)`
   - Copies the generated canvas into a visible canvas element.
   - Optionally validates by scanning the output canvas (`validateQRCodeRobust`).
6. **Export/share**
   - Export uses `src/modules/exporter/*` (PNG/WebP/JPEG/GIF/SVG/vector SVG).
   - Sharing uses `src/modules/share-links/*` (URL params + embed snippets).

## Core runtime flow (server / embed)

The Netlify function takes **query parameters**, maps them to the same render config used by the app, generates on a Node canvas (`@napi-rs/canvas`), and returns an image response.

```mermaid
flowchart TD
  S[netlify/functions/qr.ts] --> G[src/modules/qr-generator/*]
  S --> SH[src/modules/shared/index.ts]
  G --> M[src/modules/qr-encoder/*]
  M --> N[src/modules/qr-spec/*]
```

Important implication: **URL parameter compatibility** is enforced in two places:
- Client share encoder/decoder (`src/modules/share-links/url-params.ts`)
- Server query parser (`netlify/functions/qr.ts`)

If either side adds options without the other being updated, you can get subtle “web looks different from <img> embed” mismatches.

## State model (how the UI maps to generation)

The store is intentionally “section-shaped”:

- `payload` → what data is encoded (URL/text/WiFi/payment/etc).
- `qr` → QR spec: version, encoding mode, ECC, mask, quiet zone, etc.
- `render` → visual style: module size, styles, gaps, finder/timing/alignment, gradients, per-module color, etc.
- `overlay` → overlay image selection, crop/fit, blend mode, dithering, transforms.
- `watermark` → optional watermark pattern/text and placement.
- `animation` → source frames + playback parameters for animated output.
- `safety` + `auto` → auto ECC choices + enforcement (min module/quiet zone, overlay intensity caps, contrast warnings).
- `output` + `metadata` → export format, dimensions, DPI, embedded metadata.

The renderer config assembled in `useQRGenerator.ts` is effectively the *canonical mapping* from those slices to the actual generation engine.

## Render pipeline (what actually happens)

At a high-level, the pipeline is:

```mermaid
flowchart LR
  P[Payload text] --> Cfg[Render Config]
  UI[Store + UI settings] --> Cfg
  Cfg --> Gen[QRGenerator.generate]
  Overlay[Overlay image/canvas] --> Proc[processOverlay]
  Proc --> Gen
  Gen --> Canvas[Rendered canvas]
  Canvas --> Val[validateQRCodeRobust]
  Canvas --> Exp[Exporter]
```

Where:
- `Payload text` comes from `qr-store.ts` via `getPayloadText()` and `payload-generators/*`.
- Overlay preprocessing is in `src/modules/overlay/processor.ts` (+ `overlay-filters.ts` / `dither-algorithms/*`).
- Rendering + styling + compositing is `src/modules/qr-generator/*` (backed by `qr-encoder/*` and `qr-spec/*`).
- Validation + safety checks are in `src/modules/qr-analyzer/*`.
- Export is `src/modules/exporter/*` (plus native file writing via `src/modules/platform/media-store.ts`).

## URL parameter parity (client share encoder vs server image function)

The **client** (`src/modules/share-links/url-params.ts`) emits **165** query keys.  
The **server** (`netlify/functions/qr.ts`) currently reads **158** query keys.

That leaves **11** client-only keys (embed ignores them) and **4** server-only keys. See `reports/param-parity.json` and the guard test `tests/unit/share-param-parity.spec.ts`.

### Client-only keys (11)

```text
gifDisp, gifDith, gifMaxFps, gifPal, gifQuant, gifTrans, jpegQ, lang, qaRot, subpixel, svgVec
```

### Server-only keys (4)

```text
maxOverlayIntensityH, maxOverlayIntensityL, maxOverlayIntensityM, maxOverlayIntensityQ
```

Recommended workflow:
- Treat `src/modules/share-links/url-params.ts` as the canonical list of public query params.
- Keep the parity unit test as a CI guard and shrink allowlists toward zero.

## Supporting (non-73) files worth knowing about

These are not in the “73 code files” list you provided, but they materially affect runtime:

- `netlify/functions/qr.ts` — server-side renderer for embed URLs (`anqr.link/?...`).
- `src/modules/shared/index.ts` — pure utilities intended to be shared client/server.
- `android/app/src/main/java/link/anqr/app/MediaStoreWriterPlugin.java` — native file writer for Android via Capacitor.
- `android/app/src/main/java/link/anqr/app/MainActivity.java` — Android bootstrap.
- `vite.config.ts`, `capacitor.config.ts`, `netlify.toml`, `Makefile` — build/runtime configuration.

This document references them when needed.

## Subsystem deep dives

### 1) UI: editor shell + sections

- `src/App.tsx` orchestrates:
  - URL param ingest (`parseUrlParams`) → store update
  - screen routing (editor vs gallery/static pages)
  - layout state (sidebar open, mode/tier selection)
- `src/components/Header.tsx` provides navigation + “level” selection (basic/advanced/pro).
- `src/components/Sidebar.tsx` is the settings host:
  - Each accordion section maps to one “slice” of the store:
    - Payload → `payload`
    - QR encoding → `qr`
    - Render → `render`
    - Overlay → `overlay`
    - Watermark → `watermark`
    - Animation → `animation`
    - Safety → `safety` (+ `auto`)
    - Output → `output`
    - Metadata → `metadata`
    - Share → uses `share-utils`
- `src/components/Preview.tsx` is the output surface:
  - Holds the visible `<canvas>`
  - Shows warnings (contrast, overlay intensity, quiet zone)
  - Offers quick preview toggles and validation status

### 2) State: `src/store/qr-store.ts`

Zustand store provides:
- **Types** for all settings (enums/unions used across UI and renderer)
- **Initial defaults** (the default “look” of the generator)
- **Actions** to update slices (usually shallow merges for section-local updates)
- **Derived helpers** like “build payload string” (via `payload-generators.ts`)
- **QA / telemetry toggles** (e.g. debug heatmaps, blur/contrast checks)

In practice:
- UI code should *only* read/write the store.
- Rendering code should not depend on UI components; it depends on store + pure modules.

### 3) Generation: `src/hooks/useQRGenerator.ts`

This is the “engine room” of the app.
It:
- reads store slices
- computes `safetyAdjustedConfig` and the final `debouncedConfig`
- loads/prepares overlay canvases
- manages animation playback state + derived frames
- calls the generator and pushes results into:
  - `canvas` (for display/export)
  - `qrMatrix` (for vector SVG export)

It also performs:
- **Validation scan** of the generated canvas (skipped while animating for perf)
- **Ad gating hooks** (interstitials/banner via `admob-service.ts`)
- **Export** orchestration via `exporter.ts`

### 4) Rendering core: `src/modules/qr-generator.js`

`QRGenerator`:
- computes QR matrix (via `qr-core.ts` + vendor lib)
- identifies structural modules (finder/timing/alignment/format/version)
- draws modules with style options (shapes, corners, eye styles, gaps)
- supports gradients and per-module color logic
- applies overlay constraints (skip/lock certain regions; blend)
- supports dithering / blue-noise decisions for overlays and style effects
- maintains memoization caches to keep the editor responsive

The generator keeps the last matrix for vector export (`getLastMatrix()`).

### 5) Overlay and image preprocessing: `src/modules/overlay-processor.ts`

Responsibilities:
- load images from file or URL into a canvas
- resize/crop according to fit mode
- apply transforms (rotate/flip/scale)
- apply filters (brightness/contrast/gamma/blur/threshold/edge/etc) via `image-filters.ts`
- apply dithering defaults (especially mobile-friendly presets)
- provide helpers (rotateCanvas, loadImageFromUrl, etc)

### 6) Animation: `src/modules/animation.ts` + `src/modules/temporal-dither.ts`

- Detects and parses animated sources (GIF, APNG, animated WebP where supported).
- Converts frames into canvases / pixel buffers.
- Provides frame timing and playback helpers.
- Temporal dithering can be used to reduce banding/flicker across frames in animated output.

### 7) Safety + validation: `src/modules/safety-analyzer.ts` + `src/modules/qr-scanner.ts`

- **Safety analyzer** evaluates config risks:
  - quiet zone violations
  - module size too small
  - overlay intensity too high / too destructive
  - low contrast
- **QR scanner** decodes the rendered canvas and compares result to intended content.
  - used as a regression guard: “the pretty QR still scans”

### 8) Export: `src/modules/exporter.ts` + `src/modules/media-store-writer.ts`

Exports:
- Raster: PNG / JPEG / WebP
- Animated: GIF (with quantization/dither settings)
- Vector: SVG (and “vector SVG” built from module matrix)

Also:
- embeds metadata (optional)
- writes to disk in browser (download) or Android Documents (MediaStore plugin)

### 9) Sharing: `src/modules/share-utils.ts`

- Canonical encoder/decoder for URL parameters.
- Generates “embed code” and social share URLs.
- Updates the browser URL without full reload (`updateBrowserUrl`).
- Also acts as the **public contract** for which settings are shareable.

---

# Per-file reference (73 code-related files)

Each entry includes:
- exports
- internal imports
- internal “used by”
- notes where relevant


### `src/App.tsx`
**Exports**
```
default
```
**Imports (internal)**
- src/components/BusyOverlay.tsx
- src/components/Gallery.tsx
- src/components/Header.tsx
- src/components/Preview.tsx
- src/components/Sidebar.tsx
- src/components/StaticPage.tsx
- src/components/ui/tooltip.tsx
- src/data/gallery-items.ts
- src/hooks/useBannerHeight.ts
- src/hooks/useQRGenerator.ts
- src/i18n/index.ts
- src/modules/share-utils.ts
- src/store/qr-store.ts
**Used by (internal)**
- src/main.tsx

### `src/components/AdPlaceholder.tsx`
AdSense Component
Displays Google AdSense ads with proper configuration
**Exports**
```
AdPlaceholder
AdSense
default
```
**Imports (internal)**
_(none)_
**Used by (internal)**
- src/components/AdUnit.tsx

### `src/components/AdUnit.tsx`
Ad Unit
Renders an AdSense <ins> tag when a valid ad slot ID is available.
Falls back to a lightweight placeholder during development, preview
builds, or when slot IDs have not been configured yet.
**Exports**
```
AdUnit
AdUnitProps
default
```
**Imports (internal)**
- src/components/AdPlaceholder.tsx
**Used by (internal)**
- src/components/Gallery.tsx
- src/components/Preview.tsx
- src/components/Sidebar.tsx
- src/components/StaticPage.tsx

### `src/components/BusyOverlay.tsx`
BusyOverlay Component
Modern, minimal visual busy indicator for long-running operations.
No text - pure CSS animation. Always appears fullscreen centered.
**Exports**
```
BusyOverlay
default
```
**Imports (internal)**
_(none)_
**Used by (internal)**
- src/App.tsx
- src/components/Preview.tsx

### `src/components/ErrorBoundary.tsx`
Error Boundary Component
Catches JavaScript errors anywhere in the child component tree,
logs them, and displays a fallback UI instead of crashing the app.
**Exports**
```
ErrorBoundary
default
```
**Imports (internal)**
- src/components/ui/button.tsx
**Used by (internal)**
- src/main.tsx

### `src/components/Gallery.tsx`
Gallery Component
Hero-style gallery showcasing ANQR features organized by category
**Exports**
```
Gallery
default
```
**Imports (internal)**
- src/components/AdUnit.tsx
- src/data/gallery-items.ts
- src/modules/admob-service.ts
**Used by (internal)**
- src/App.tsx

### `src/components/Header.tsx`
**Exports**
```
Header
```
**Imports (internal)**
- src/components/StaticPage.tsx
- src/components/ui/button.tsx
- src/components/ui/select.tsx
- src/components/ui/tabs.tsx
- src/data/gallery-items.ts
- src/hooks/useBannerHeight.ts
- src/i18n/index.ts
- src/modules/admob-service.ts
- src/modules/share-utils.ts
- src/store/qr-store.ts
**Used by (internal)**
- src/App.tsx

### `src/components/Preview.tsx`
**Exports**
```
Preview
```
**Imports (internal)**
- src/components/AdUnit.tsx
- src/components/BusyOverlay.tsx
- src/hooks/useQRGenerator.ts
- src/modules/color-utils.ts
- src/modules/safety-analyzer.ts
- src/store/qr-store.ts
**Used by (internal)**
- src/App.tsx

### `src/components/Sidebar.tsx`
**Exports**
```
Sidebar
```
**Imports (internal)**
- src/components/AdUnit.tsx
- src/components/sections/AnimationSection.tsx
- src/components/sections/MetadataSection.tsx
- src/components/sections/OutputSection.tsx
- src/components/sections/OverlaySection.tsx
- src/components/sections/PayloadSection.tsx
- src/components/sections/QREncodingSection.tsx
- src/components/sections/RenderSection.tsx
- src/components/sections/SafetySection.tsx
- src/components/sections/ShareSection.tsx
- src/components/sections/WatermarkSection.tsx
- src/components/ui/accordion.tsx
- src/lib/search-context.tsx
- src/store/qr-store.ts
**Used by (internal)**
- src/App.tsx

### `src/components/StaticPage.tsx`
StaticPage
About, Privacy, Terms, Contact, and Guide pages.
**Exports**
```
StaticPage
StaticPageType
default
```
**Imports (internal)**
- src/components/AdUnit.tsx
- src/components/ui/button.tsx
**Used by (internal)**
- src/App.tsx
- src/components/Header.tsx

### `src/components/sections/AnimationSection.tsx`
**Exports**
```
AnimationSection
```
**Imports (internal)**
- src/components/ui/input.tsx
- src/components/ui/label.tsx
- src/components/ui/select.tsx
- src/components/ui/slider.tsx
- src/components/ui/switch.tsx
- src/lib/search-context.tsx
- src/store/qr-store.ts
**Used by (internal)**
- src/components/Sidebar.tsx

### `src/components/sections/MetadataSection.tsx`
**Exports**
```
MetadataSection
```
**Imports (internal)**
- src/components/ui/button.tsx
- src/components/ui/input.tsx
- src/components/ui/label.tsx
- src/components/ui/switch.tsx
- src/components/ui/textarea.tsx
- src/lib/search-context.tsx
- src/store/qr-store.ts
**Used by (internal)**
- src/components/Sidebar.tsx

### `src/components/sections/OutputSection.tsx`
**Exports**
```
OutputSection
```
**Imports (internal)**
- src/components/ui/input.tsx
- src/components/ui/label.tsx
- src/components/ui/select.tsx
- src/components/ui/slider.tsx
- src/components/ui/switch.tsx
- src/lib/search-context.tsx
- src/store/qr-store.ts
**Used by (internal)**
- src/components/Sidebar.tsx

### `src/components/sections/OverlaySection.tsx`
**Exports**
```
OverlaySection
```
**Imports (internal)**
- src/components/ui/button.tsx
- src/components/ui/input.tsx
- src/components/ui/label.tsx
- src/components/ui/select.tsx
- src/components/ui/slider.tsx
- src/components/ui/switch.tsx
- src/lib/search-context.tsx
- src/store/qr-store.ts
**Used by (internal)**
- src/components/Sidebar.tsx

### `src/components/sections/PayloadSection.tsx`
**Exports**
```
PayloadSection
```
**Imports (internal)**
- src/components/ui/input.tsx
- src/components/ui/label.tsx
- src/components/ui/select.tsx
- src/components/ui/switch.tsx
- src/components/ui/textarea.tsx
- src/i18n/index.ts
- src/lib/search-context.tsx
- src/modules/payload-generators.ts
- src/store/qr-store.ts
**Used by (internal)**
- src/components/Sidebar.tsx

### `src/components/sections/QREncodingSection.tsx`
**Exports**
```
QREncodingSection
```
**Imports (internal)**
- src/components/ui/label.tsx
- src/components/ui/select.tsx
- src/components/ui/slider.tsx
- src/components/ui/switch.tsx
- src/lib/search-context.tsx
- src/modules/qr-core.ts
- src/store/qr-store.ts
**Used by (internal)**
- src/components/Sidebar.tsx

### `src/components/sections/RenderSection.tsx`
**Exports**
```
RenderSection
```
**Imports (internal)**
- src/components/ui/button.tsx
- src/components/ui/input.tsx
- src/components/ui/label.tsx
- src/components/ui/select.tsx
- src/components/ui/slider.tsx
- src/components/ui/switch.tsx
- src/lib/search-context.tsx
- src/store/qr-store.ts
**Used by (internal)**
- src/components/Sidebar.tsx

### `src/components/sections/SafetySection.tsx`
**Exports**
```
SafetySection
```
**Imports (internal)**
- src/components/ui/label.tsx
- src/components/ui/select.tsx
- src/components/ui/slider.tsx
- src/components/ui/switch.tsx
- src/lib/search-context.tsx
- src/store/qr-store.ts
**Used by (internal)**
- src/components/Sidebar.tsx

### `src/components/sections/ShareSection.tsx`
**Exports**
```
ShareSection
```
**Imports (internal)**
- src/components/ui/button.tsx
- src/components/ui/input.tsx
- src/components/ui/label.tsx
- src/components/ui/switch.tsx
- src/lib/search-context.tsx
- src/modules/share-utils.ts
- src/store/qr-store.ts
**Used by (internal)**
- src/components/Sidebar.tsx

### `src/components/sections/WatermarkSection.tsx`
**Exports**
```
WatermarkSection
```
**Imports (internal)**
- src/components/ui/button.tsx
- src/components/ui/input.tsx
- src/components/ui/label.tsx
- src/components/ui/select.tsx
- src/components/ui/slider.tsx
- src/components/ui/switch.tsx
- src/lib/search-context.tsx
- src/store/qr-store.ts
**Used by (internal)**
- src/components/Sidebar.tsx

### `src/components/ui/accordion.tsx`
**Exports**
```
Accordion
AccordionContent
AccordionItem
AccordionTrigger
```
**Imports (internal)**
- src/lib/utils.ts
**Used by (internal)**
- src/components/Sidebar.tsx

### `src/components/ui/button.tsx`
**Exports**
```
Button
ButtonProps
buttonVariants
```
**Imports (internal)**
- src/lib/utils.ts
**Used by (internal)**
- src/components/ErrorBoundary.tsx
- src/components/Header.tsx
- src/components/StaticPage.tsx
- src/components/sections/MetadataSection.tsx
- src/components/sections/OverlaySection.tsx
- src/components/sections/RenderSection.tsx
- src/components/sections/ShareSection.tsx
- src/components/sections/WatermarkSection.tsx

### `src/components/ui/input.tsx`
**Exports**
```
Input
InputProps
```
**Imports (internal)**
- src/lib/utils.ts
**Used by (internal)**
- src/components/sections/AnimationSection.tsx
- src/components/sections/MetadataSection.tsx
- src/components/sections/OutputSection.tsx
- src/components/sections/OverlaySection.tsx
- src/components/sections/PayloadSection.tsx
- src/components/sections/RenderSection.tsx
- src/components/sections/ShareSection.tsx
- src/components/sections/WatermarkSection.tsx

### `src/components/ui/label.tsx`
**Exports**
```
Label
```
**Imports (internal)**
- src/lib/utils.ts
**Used by (internal)**
- src/components/sections/AnimationSection.tsx
- src/components/sections/MetadataSection.tsx
- src/components/sections/OutputSection.tsx
- src/components/sections/OverlaySection.tsx
- src/components/sections/PayloadSection.tsx
- src/components/sections/QREncodingSection.tsx
- src/components/sections/RenderSection.tsx
- src/components/sections/SafetySection.tsx
- src/components/sections/ShareSection.tsx
- src/components/sections/WatermarkSection.tsx

### `src/components/ui/select.tsx`
**Exports**
```
Select
SelectContent
SelectGroup
SelectItem
SelectLabel
SelectScrollDownButton
SelectScrollUpButton
SelectSeparator
SelectTrigger
SelectValue
```
**Imports (internal)**
- src/lib/utils.ts
**Used by (internal)**
- src/components/Header.tsx
- src/components/sections/AnimationSection.tsx
- src/components/sections/OutputSection.tsx
- src/components/sections/OverlaySection.tsx
- src/components/sections/PayloadSection.tsx
- src/components/sections/QREncodingSection.tsx
- src/components/sections/RenderSection.tsx
- src/components/sections/SafetySection.tsx
- src/components/sections/WatermarkSection.tsx

### `src/components/ui/slider.tsx`
**Exports**
```
Slider
```
**Imports (internal)**
- src/lib/utils.ts
**Used by (internal)**
- src/components/sections/AnimationSection.tsx
- src/components/sections/OutputSection.tsx
- src/components/sections/OverlaySection.tsx
- src/components/sections/QREncodingSection.tsx
- src/components/sections/RenderSection.tsx
- src/components/sections/SafetySection.tsx
- src/components/sections/WatermarkSection.tsx

### `src/components/ui/switch.tsx`
**Exports**
```
Switch
```
**Imports (internal)**
- src/lib/utils.ts
**Used by (internal)**
- src/components/sections/AnimationSection.tsx
- src/components/sections/MetadataSection.tsx
- src/components/sections/OutputSection.tsx
- src/components/sections/OverlaySection.tsx
- src/components/sections/PayloadSection.tsx
- src/components/sections/QREncodingSection.tsx
- src/components/sections/RenderSection.tsx
- src/components/sections/SafetySection.tsx
- src/components/sections/ShareSection.tsx
- src/components/sections/WatermarkSection.tsx

### `src/components/ui/tabs.tsx`
**Exports**
```
Tabs
TabsContent
TabsList
TabsTrigger
```
**Imports (internal)**
- src/lib/utils.ts
**Used by (internal)**
- src/components/Header.tsx

### `src/components/ui/textarea.tsx`
**Exports**
```
Textarea
TextareaProps
```
**Imports (internal)**
- src/lib/utils.ts
**Used by (internal)**
- src/components/sections/MetadataSection.tsx
- src/components/sections/PayloadSection.tsx

### `src/components/ui/tooltip.tsx`
**Exports**
```
Tooltip
TooltipContent
TooltipProvider
TooltipTrigger
```
**Imports (internal)**
- src/lib/utils.ts
**Used by (internal)**
- src/App.tsx

### `src/data/gallery-items.ts`
Gallery Items - Comprehensive feature showcase for ANQR
Organized by feature category to help users understand visual differences:
- Plain QR: No overlay, different styles/colors/ECC
- Image Overlays: tsunami.jpg with different modes
- Animated Overlays: king.gif with different modes
- Blend Modes: Different overlay blend modes
**Exports**
```
GALLERY_IMAGE_PATH
GalleryCategory
GalleryItem
GallerySection
buildGalleryUrl
galleryItems
gallerySections
getGalleryBaseUrl
getGalleryImagePath
```
**Imports (internal)**
_(none)_
**Used by (internal)**
- src/App.tsx
- src/components/Gallery.tsx
- src/components/Header.tsx

### `src/hooks/useBannerHeight.ts`
**Exports**
```
useBannerHeight
```
**Imports (internal)**
- src/modules/admob-service.ts
**Used by (internal)**
- src/App.tsx
- src/components/Header.tsx

### `src/hooks/useQRGenerator.ts`
useQRGenerator Hook
Wires the QR store state to the QRGenerator module for live rendering
Supports animated GIF overlays
**Exports**
```
default
useQRGenerator
```
**Imports (internal)**
- src/modules/admob-service.ts
- src/modules/animation-patterns.ts
- src/modules/animation.ts
- src/modules/exporter.ts
- src/modules/overlay-processor.ts
- src/modules/qr-generator.js
- src/modules/qr-scanner.ts
- src/modules/temporal-dither.ts
- src/modules/watermark.ts
- src/store/qr-store.ts
**Used by (internal)**
- src/App.tsx
- src/components/Preview.tsx

### `src/i18n/index.ts`
i18n Configuration
Internationalization setup using react-i18next
Uses Google Play language codes for compatibility
OPTIMIZATION: Only English is bundled. Other locales are lazy-loaded on demand.
**Exports**
```
LanguageCode
default
isRtlLanguage
languages
loadLocale
```
**Imports (internal)**
_(none)_
**Used by (internal)**
- src/App.tsx
- src/components/Header.tsx
- src/components/sections/PayloadSection.tsx
- src/main.tsx

### `src/lib/search-context.tsx`
**Exports**
```
HighlightedLabel
SearchProvider
highlightText
useSearch
```
**Imports (internal)**
_(none)_
**Used by (internal)**
- src/components/Sidebar.tsx
- src/components/sections/AnimationSection.tsx
- src/components/sections/MetadataSection.tsx
- src/components/sections/OutputSection.tsx
- src/components/sections/OverlaySection.tsx
- src/components/sections/PayloadSection.tsx
- src/components/sections/QREncodingSection.tsx
- src/components/sections/RenderSection.tsx
- src/components/sections/SafetySection.tsx
- src/components/sections/ShareSection.tsx
- src/components/sections/WatermarkSection.tsx

### `src/lib/utils.ts`
**Exports**
```
cn
```
**Imports (internal)**
_(none)_
**Used by (internal)**
- src/components/ui/accordion.tsx
- src/components/ui/button.tsx
- src/components/ui/input.tsx
- src/components/ui/label.tsx
- src/components/ui/select.tsx
- src/components/ui/slider.tsx
- src/components/ui/switch.tsx
- src/components/ui/tabs.tsx
- src/components/ui/textarea.tsx
- src/components/ui/tooltip.tsx

### `src/main.tsx`
**Imports (internal)**
- src/App.tsx
- src/components/ErrorBoundary.tsx
- src/i18n/index.ts
- src/modules/admob-service.ts
**Used by (internal)**
_(none)_
**Notes**
- Not imported by other app code (may be unused, experimental, or referenced dynamically).

### `src/modules/admob-service.ts`
AdMob Service
Handles AdMob ads for native Android/iOS apps via Capacitor.
Supports: Banner ads, Interstitial ads, Rewarded interstitial ads
This service is only used when running in a native app context.
**Exports**
```
InterstitialType
RewardedType
getBannerHeight
getCurrentBannerPosition
getGenerationCount
hideBannerAd
initializeAdMob
isAdMobAvailable
isRewardedAdReady
onBannerHeightChange
prepareAllAds
prepareInterstitial
prepareRewardedAd
removeBannerAd
resetGenerationCount
showBannerAd
showBottomBanner
showInterstitial
showRewardedAd
showTopBanner
trackGenerationAndShowAd
```
**Imports (internal)**
_(none)_
**Used by (internal)**
- src/components/Gallery.tsx
- src/components/Header.tsx
- src/hooks/useBannerHeight.ts
- src/hooks/useQRGenerator.ts
- src/main.tsx

### `src/modules/animation-patterns.ts`
Animation Patterns Module
Generates animated QR code effects from static images
**Exports**
```
AnimationPattern
InterpolationMode
default
generatePatternFrames
interpolateFrames
```
**Imports (internal)**
- src/modules/color-utils.ts
**Used by (internal)**
- src/hooks/useQRGenerator.ts

### `src/modules/animation.ts`
Animation Module
Handles GIF and WebP animation parsing, frame management, animation patterns, and temporal effects
Performance optimizations:
- Canvas pooling to reduce GC pressure
- Frame decimation based on target FPS
- Reusable composite canvas for GIF parsing
**Exports**
```
Animation
AnimationFrame
AnimationOptions
AnimationPattern
AnimationState
GifCompositor
advanceAnimation
applyAnimationPattern
applyColorCycle
applyTemporalDither
calculateCompositorFps
calculateSourceFps
createAnimationLoop
createAnimationState
createGifCompositor
decimateCompositorFrames
decimateFramesToFps
default
detectImageFormat
getGifDelays
getNextFrame
interpolateFrames
isAnimatedWebP
parseAnimatedImage
parseGifFrames
parseWebPFrames
```
**Imports (internal)**
- src/modules/color-utils.ts
**Used by (internal)**
- src/hooks/useQRGenerator.ts

### `src/modules/blue-noise-dither.ts`
Blue Noise Dithering Module for QR Codes
Uses blue noise thresholding instead of Floyd-Steinberg error diffusion.
Follows the same structure as generate.ts to preserve QR scannability:
- Data points (center of each module) MUST preserve QR values
- Only "free points" (non-locked, non-data) can be dithered
- Blue noise provides better visual quality than ordered dithering
**Exports**
```
BlueNoiseOptions
BlueNoiseResult
CanvasFactory
ColorMode
RGB
defaultBrowserCanvasFactory
generateBlueNoiseDithered
```
**Imports (internal)**
- src/modules/qrcode.mjs
**Used by (internal)**
- src/modules/qr-generator.js

### `src/modules/color-utils.ts`
Color Utilities Module
Provides color parsing, blending, gradients, and contrast checking
**Exports**
```
ColorUtils
GradientConfig
HSL
HSLA
RGB
RGBA
adjustForContrast
alphaBlend
blendColors
blendRgb
createCssGradient
createSeededRandom
default
getAnalogous
getComplementary
getContrastRatio
getGradientColor
getGradientColorAt
getRelativeLuminance
getTextColor
getTriadic
hslToRgb
isDark
meetsContrastAA
meetsContrastAAA
multiplyBlend
overlayBlend
parseColor
parseHex
parseHexAlpha
parseHslString
parseRgbString
rgbToGray
rgbToHex
rgbToHsl
rgbToString
rgbaToHex
rgbaToString
screenBlend
seededRandom
```
**Imports (internal)**
- src/store/qr-store.ts
**Used by (internal)**
- src/components/Preview.tsx
- src/modules/animation-patterns.ts
- src/modules/animation.ts
- src/modules/qr-generator.js
- src/modules/safety-analyzer.ts

### `src/modules/crop-handler.js`
CropHandler - Manages a draggable/resizable square crop overlay
for selecting regions from non-square images
**Exports**
```
CropHandler
```
**Imports (internal)**
_(none)_
**Used by (internal)**
_(none)_
**Notes**
- Not imported by other app code (may be unused, experimental, or referenced dynamically).

### `src/modules/dither-algorithms.ts`
Dithering Algorithms Module
Comprehensive implementation of all dithering algorithms
Supports error diffusion, ordered dithering, and noise-based methods
**Exports**
```
DitherAlgorithms
DitherOptions
DitherResult
RGB
adaptiveThresholdDither
applyDither
bayerDither
blueNoiseDither
blueNoiseErrorDiffusion
default
edgeAwareDither
errorDiffusion
gaussianNoiseDither
imageDataToFloat
orderedDither
perceptualDither
screenedBlueNoiseDither
temporalBlueNoiseDither
triangularNoiseDither
whiteNoiseDither
```
**Imports (internal)**
- src/store/qr-store.ts
**Used by (internal)**
- src/modules/overlay-processor.ts
- src/modules/qr-generator.js

### `src/modules/exporter.ts`
Exporter Module
Handles PNG, WebP, GIF, and SVG export with full color support
Uses gifenc npm package for high-quality GIF encoding
Supports native file saving on Android/iOS via Capacitor
**Exports**
```
ExportConfig
ExportResult
Exporter
ExporterModule
OutputFormat
PngMetadata
VectorAlignmentStyle
VectorFinderStyle
VectorModuleStyle
VectorSvgConfig
VectorTimingStyle
canvasToBlob
default
downloadGif
downloadImage
downloadSvg
downloadUrl
downloadVectorSvg
exportGif
exportImage
exportSvg
exportVectorSvg
```
**Imports (internal)**
- src/modules/media-store-writer.ts
**Used by (internal)**
- src/hooks/useQRGenerator.ts

### `src/modules/image-filters.ts`
Image Filters Module
Provides all image processing filters for overlay preprocessing
Works with Canvas ImageData for real-time processing
Note: Some utility functions (rgbToGray, hslToRgb, rgbToHsl) are also
exported from color-utils.ts for consistency. This module keeps its own
optimized implementations for tight inner loops.
**Exports**
```
FilterOptions
HSL
ImageFilters
RGB
RGBA
applyColorMode
applyFilters
blur
brightness
cannyEdge
clamp
clamp01
contrast
convolve
copyImageData
default
duotone
emboss
gamma
gaussianBlur
getBrightnessMap
getRGBMap
grayscale
hslToRgb
hueRotate
invert
posterize
rgbToGray
rgbToHsl
saturation
sharpen
sobelEdge
threshold
```
**Imports (internal)**
- src/store/qr-store.ts
**Used by (internal)**
- src/modules/overlay-processor.ts

### `src/modules/index.ts`
ANQR Modules Index
Consolidated exports for all QR code generation functionality
organized by feature section from anqr-features.txt
**Exports**
```
//
Animation
AnimationDefault
ColorUtils
ColorUtilsDefault
CropHandler
DitherAlgorithms
DitherAlgorithmsDefault
Exporter
ExporterDefault
ExporterModule
ImageFilters
ImageFiltersDefault
OverlayProcessor
OverlayProcessorDefault
PayloadGenerators
PayloadGeneratorsDefault
QRCore
QRCoreDefault
QRGenerator
QRScanner
QRScannerDefault
SafetyAnalyzer
SafetyAnalyzerDefault
ShareUtils
ShareUtilsDefault
Watermark
WatermarkDefault
adjustForContrast
advanceAnimation
alphaBlend
analyzeContrast
analyzeMatrixContrast
analyzeQR
applyAnimationPattern
applyBlendMode
applyBlurSimulation
applyCenterLogo
applyColorCycle
applyColorMode
applyDither
applyFilters
applyNoiseSimulation
applyOverlayMode
applyTemporalDither
applyWatermark
bayerDither
blendColors
blendRgb
blueNoiseDither
blur
brightness
buildUrlParams
calculateCompositorFps
calculateOptimalVersion
calculateSafeIntensity
cannyEdge
canvasToBlob
canvasToDataUrl
clamp
… (139 more)
```
**Imports (internal)**
- src/modules/qr-generator.js
**Used by (internal)**
_(none)_
**Notes**
- Not imported by other app code (may be unused, experimental, or referenced dynamically).

### `src/modules/media-store-writer.ts`
**Exports**
```
MediaStoreWriter
MediaStoreWriterPlugin
saveBase64ToDocuments
```
**Imports (internal)**
_(none)_
**Used by (internal)**
- src/modules/exporter.ts

### `src/modules/overlay-processor.ts`
Overlay Processor Module
Handles image loading, cropping, filter application, and blend modes
Optimizations:
- Caches processed overlay data for repeated access
- Mobile detection for automatic performance tuning
**Exports**
```
DEFAULT_MOBILE_DITHER
OverlayDitherOptions
OverlayOptions
OverlayProcessor
ProcessedOverlay
STORE_DEFAULT_DITHER
applyOverlayMode
cropImage
default
ditherOverlay
ditherOverlayForQR
fitImage
flipCanvas
getEffectiveDitherKind
getOverlayData
getOverlayRGBData
loadImageFromDataUrl
loadImageFromFile
loadImageFromUrl
processOverlay
rotateCanvas
```
**Imports (internal)**
- src/modules/dither-algorithms.ts
- src/modules/image-filters.ts
- src/store/qr-store.ts
**Used by (internal)**
- src/hooks/useQRGenerator.ts

### `src/modules/payload-generators.ts`
Payload Generators Module
Generates properly formatted strings for all QR payload types
Implements EMVCo QR Code Specification for Merchant-Presented Mode
Supports EPC/SEPA, UPI, Swiss QR-bill, and cryptocurrency URIs
**Exports**
```
ADDITIONAL_DATA_TAGS
AusPayNetParams
BharatQRParams
BizCardParams
CashAppParams
DuitNowParams
EMVMPMParams
EMVMerchantAccount
EMVQRBuilder
EMV_TAGS
EPCSepaParams
EthereumEIP681Params
GS1DigitalLinkParams
HKQRParams
ISO_CURRENCY
JPQRParams
LightningParams
MAI_SUBTAGS
OTPAuthParams
PAYMENT_SCHEME_GUI
PIXParams
POI_METHOD
PayNowParams
PayPalMeParams
PayloadGenerators
PromptPayParams
QRISParams
QRPhParams
SwissQRBillParams
TIP_INDICATOR
TWQRParams
UPIParams
VietQRParams
crc16CCITT
default
generateAppDeepLink
generateAusPayNet
generateBharatQR
generateBizCard
generateCalendarSubscription
generateCashApp
generateCrypto
generateDuitNow
generateEMVMPM
generateEPCSepa
generateEmail
generateEthereumEIP681
generateEvent
generateGS1DigitalLink
generateGeo
generateHKQR
generateJPQR
generateLightning
generateMeCard
generateMessagingLink
generateOTPAuth
generatePIX
generatePayNow
generatePayPalMe
generatePromptPay
… (15 more)
```
**Imports (internal)**
- src/store/qr-store.ts
**Used by (internal)**
- src/components/sections/PayloadSection.tsx
- src/store/qr-store.ts

### `src/modules/qr-core.ts`
QR Core Module
Provides QR code generation, encoding, and structural element detection
Wraps qrcode.mjs with TypeScript types
**Exports**
```
ECCLevel
EncodingMode
MaskPattern
QRCore
QRInstance
QRMatrix
QROptions
calculateOptimalVersion
createQRInstance
default
generateQR
getAlignmentPositions
getModuleCountForVersion
getVersionFromModuleCount
isAlignmentPattern
isData
isFinderPattern
isLocked
isStructuralModule
isTimingPattern
```
**Imports (internal)**
- src/modules/qrcode.mjs
**Used by (internal)**
- src/components/sections/QREncodingSection.tsx
- src/modules/qr-generator.js
- src/modules/safety-analyzer.ts

### `src/modules/qr-generator.js`
**Exports**
```
QRGenerator
clearQRCaches
defaultBrowserCanvasFactory
```
**Imports (internal)**
- src/modules/blue-noise-dither.ts
- src/modules/color-utils.ts
- src/modules/dither-algorithms.ts
- src/modules/qr-core.ts
- src/modules/qrcode.mjs
**Used by (internal)**
- netlify/functions/qr.ts
- src/hooks/useQRGenerator.ts
- src/modules/index.ts

### `src/modules/qr-scanner.ts`
QR Scanner/Validator Module
Uses jsQR to decode and validate generated QR codes
**Exports**
```
QRLocation
QRScanner
ScanResult
ValidationResult
default
scanCanvas
scanFile
scanImageData
validateFrames
validateQRCode
validateQRCodeRobust
```
**Imports (internal)**
_(none)_
**Used by (internal)**
- src/hooks/useQRGenerator.ts

### `src/modules/safety-analyzer.ts`
Safety Analyzer Module
Provides QA tools, contrast checking, scan simulation, and readability analysis
**Exports**
```
AnalysisIssue
AnalysisResult
AnalysisWarning
ContrastReport
SafetyAnalyzer
SafetyMode
SafetyOptions
ScanSimulationResult
analyzeContrast
analyzeMatrixContrast
analyzeQR
applyBlurSimulation
applyNoiseSimulation
calculateSafeIntensity
default
generateReadabilityHeatmap
simulateScan
validateModuleSize
validateOverlayIntensity
validateQuietZone
```
**Imports (internal)**
- src/modules/color-utils.ts
- src/modules/qr-core.ts
**Used by (internal)**
- src/components/Preview.tsx

### `src/modules/share-utils.ts`
Share Utilities Module
Handles URL parameter encoding/decoding, sharing, and embed code generation
**Exports**
```
EmbedOptions
MAX_SHARE_URL_LENGTH
ShareConfig
ShareUtils
buildUrlParams
canvasToBlob
canvasToDataUrl
checkShareUrlLength
convertToImageApiUrl
copyImageToClipboard
copyToClipboard
default
downloadBlob
estimateQRSize
generateBBCodeEmbed
generateIframeEmbed
generateImageEmbed
generateMarkdownEmbed
getShareableUrl
getSocialShareUrls
parseUrlParams
updateBrowserUrl
```
**Imports (internal)**
_(none)_
**Used by (internal)**
- src/App.tsx
- src/components/Header.tsx
- src/components/sections/ShareSection.tsx

### `src/modules/shared/index.ts`
Shared Utilities Module
Pure functions that can be used by both client (browser) and server (Netlify functions).
These have NO DOM dependencies and work with raw data arrays.
This eliminates code duplication between:
- src/modules/color-utils.ts (client)
- src/modules/animation-patterns.ts (client)
**Exports**
```
AnimationEasing
AnimationPattern
SharedUtils
applyColorCyclePattern
applyDriftPattern
applyEasing
applyPulsePattern
applyScanlinePattern
applyShimmerPattern
applyWavePattern
createSeededRandom
default
hslToRgbTuple
rgbToGray
rgbToHslTuple
```
**Imports (internal)**
_(none)_
**Used by (internal)**
- netlify/functions/qr.ts

### `src/modules/temporal-dither.ts`
Temporal Dithering Module
Provides temporal dithering for animated QR codes to improve perceived image quality.
By varying the dither pattern across frames, the eye perceives a smoother, higher-quality image.
Supports three modes:
- 'off': No temporal dithering (static pattern)
- 'blue_noise': Uses golden ratio-based offsets for optimal temporal distribution
**Exports**
```
TemporalDitherMode
applyTemporalNoiseToCanvas
calculateTemporalOffset
generateTemporalSequence
isTemporalDitherActive
```
**Imports (internal)**
_(none)_
**Used by (internal)**
- src/hooks/useQRGenerator.ts

### `src/modules/watermark.ts`
Watermark Module
Handles text and image watermarks with positioning and blending
**Exports**
```
Watermark
WatermarkBlend
WatermarkKind
WatermarkOptions
WatermarkPosition
WatermarkResult
applyBlendMode
applyCenterLogo
applyWatermark
createPatternWatermark
createTextWatermark
default
getWatermarkPositions
```
**Imports (internal)**
_(none)_
**Used by (internal)**
- src/hooks/useQRGenerator.ts

### `src/store/qr-store.ts`
**Exports**
```
AlignmentStyle
AusPayNetHelper
BharatQRHelper
CashAppHelper
ColorMode
CropRegion
CryptoHelper
DiffusionKernel
DitherKind
DuitNowHelper
ECCLevel
EMVGenericHelper
EmailHelper
EncodingMode
EthereumHelper
EventHelper
FinderStyle
FitMode
FrameStyle
GapMode
GeoHelper
GifDither
GifQuantizer
GradientStop
GradientType
HKQRHelper
JPQRHelper
LightningHelper
MeCardHelper
ModuleStyle
OrderedMatrix
OtpAuthHelper
OutputFormat
OverlayMode
OverlayType
PayPalMeHelper
PayloadKind
PremiumAccess
QRISHelper
QRPhHelper
QRState
SafetyMode
SmsHelper
SwissQRBillHelper
TWQRHelper
TelHelper
Tier
TimingStyle
UrlHelper
VCardHelper
VCardVersion
VietQRHelper
WifiAuth
WifiHelper
useQRStore
```
**Imports (internal)**
- src/modules/payload-generators.ts
**Used by (internal)**
- src/App.tsx
- src/components/Header.tsx
- src/components/Preview.tsx
- src/components/Sidebar.tsx
- src/components/sections/AnimationSection.tsx
- src/components/sections/MetadataSection.tsx
- src/components/sections/OutputSection.tsx
- src/components/sections/OverlaySection.tsx
- src/components/sections/PayloadSection.tsx
- src/components/sections/QREncodingSection.tsx
- src/components/sections/RenderSection.tsx
- src/components/sections/SafetySection.tsx
- src/components/sections/ShareSection.tsx
- src/components/sections/WatermarkSection.tsx
- src/hooks/useQRGenerator.ts
- src/modules/color-utils.ts
- src/modules/dither-algorithms.ts
- src/modules/image-filters.ts
- src/modules/overlay-processor.ts
- src/modules/payload-generators.ts

### `src/types/image-decoder.d.ts`
Type declarations for the ImageDecoder WebCodecs API
https://developer.mozilla.org/en-US/docs/Web/API/ImageDecoder
**Imports (internal)**
_(none)_
**Used by (internal)**
_(none)_
**Notes**
- Not imported by other app code (may be unused, experimental, or referenced dynamically).
- Type declarations only.

### `src/vite-env.d.ts`
<reference types="vite/client" />
**Imports (internal)**
_(none)_
**Used by (internal)**
_(none)_
**Notes**
- Not imported by other app code (may be unused, experimental, or referenced dynamically).
- Type declarations only.

### `src/modules/qrcode.mjs`
QR Code Generator for JavaScript
Copyright (c) 2009 Kazuhiko Arase
URL: http://www.d-project.com
Licensed under the MIT license:
http://www.opensource.org/licenses/mit-license.php
**Exports**
```
default
qrcode
stringToBytes
```
**Imports (internal)**
_(none)_
**Used by (internal)**
- src/modules/blue-noise-dither.ts
- src/modules/qr-core.ts
- src/modules/qr-generator.js

---

## i18n Translation Workflow

There are **TWO separate i18n systems** in this project:

1. **UI Strings (locales)**: Button labels, menu items, tooltips - uses `src/i18n/locales/txt/*.txt` + `template.json`
2. **Static Content (pages)**: Privacy, Terms, About, Guide, Learn, Examples pages - uses `src/i18n/static/txt/*.txt` + `template-*.ts`

---

### ⚠️ CRITICAL: NEVER EDIT GENERATED FILES DIRECTLY ⚠️

**YOU MUST NEVER DIRECTLY EDIT:**
- `src/i18n/locales/*.json` - These are GENERATED from txt + template.json
- `src/i18n/static/<lang>/*.ts` (e.g., `en-GB/privacy.ts`) - These are GENERATED from txt + template-*.ts

**YOU MUST ONLY EDIT:**
- `src/i18n/locales/txt/en-GB.txt` - Master English UI strings
- `src/i18n/locales/template.json` - Maps JSON keys to line numbers
- `src/i18n/static/txt/en-GB.txt` - Master English static content
- `src/i18n/static/txt/template-*.ts` - Template files with line number references

Editing generated files directly will:
1. Break translation detection (xlate.py won't see your changes)
2. Get overwritten next time `make i18n:fill` runs
3. Cause inconsistencies across languages

---

### UI Strings System (`src/i18n/locales/`)

#### How It Works

1. **Source of Truth**: `txt/en-GB.txt` is the master English translation file
2. **Line Numbers**: Each string has a unique line number (e.g., `1427\t"Generate"`)
3. **Template Mapping**: `template.json` maps translation keys to line numbers (e.g., `"feature1Title": "1427"`)
4. **Translation Detection**: `xlate.py` only translates lines that are **missing** in other language `.txt` files

#### Rules for Adding/Changing Strings

1. **New strings = NEW incremental line numbers** at the end of `en-GB.txt`
2. **Changing existing strings = Add NEW line numbers** with the new text, then update `template.json` to point to the new line numbers
3. **Blank out old strings** that are being replaced by setting them to an empty placeholder like `"(deprecated)"` or `"_"` - this prevents stale translations from being used
4. **Never delete line numbers** - this would break the line number alignment across all language files

#### Example: Updating a UI String

```bash
# 1. Add new strings at end of txt/en-GB.txt (e.g., lines 1774-1780)
# 2. Blank out the old strings you're replacing (e.g., line 1427 becomes: 1427\t"_")
# 3. Update template.json to point to new line numbers
# 4. User runs: make i18n:xlate (translates new lines to all languages)
# 5. User runs: make i18n:fill (generates JSON files from txt files)
```

---

### Static Content System (`src/i18n/static/`)

#### How It Works

1. **Source of Truth**: `txt/en-GB.txt` contains all translatable strings with line numbers
2. **Template Files**: `txt/template-*.ts` files contain page structure with line number references instead of text
   - Example: `title: '374'` means "use the string from line 374 of the txt file"
3. **Generated Files**: `fill.py` reads the template + txt file and generates the actual `<lang>/*.ts` files

#### File Structure

```
src/i18n/static/
├── txt/
│   ├── en-GB.txt           # Master English content (line numbers → strings)
│   ├── de-DE.txt           # German translations
│   ├── fr-FR.txt           # French translations
│   ├── template-privacy.ts # Privacy page template (uses line number refs)
│   ├── template-terms.ts   # Terms page template
│   ├── template-about.ts   # About page template
│   └── ...                 # Other templates
├── en-GB/
│   ├── privacy.ts          # GENERATED - DO NOT EDIT
│   ├── terms.ts            # GENERATED - DO NOT EDIT
│   └── ...                 # GENERATED files
├── de-DE/                  # GENERATED - DO NOT EDIT
├── fr-FR/                  # GENERATED - DO NOT EDIT
└── fill.py                 # Script that generates <lang>/*.ts from txt + templates
```

#### Rules for Adding/Changing Static Content

1. **New content = Add NEW lines at END of `txt/en-GB.txt`**
   - Format: `<line_number>\t"<content>"`
   - Example: `1333\t"Full Privacy Policy"`

2. **Update the template file** (`txt/template-*.ts`) to reference the new line numbers
   - Example: Add a new section with `heading: '1333'`

3. **Never modify line numbers or reorder lines** - this breaks alignment across all language files

4. **Changing existing content = Add NEW line numbers** with new text, update template to use new numbers

#### Example: Adding a New Section to Privacy Page

```bash
# 1. Add new lines at END of txt/en-GB.txt:
#    1333\t"Full Privacy Policy"
#    1334\t"For the complete, legally binding privacy policy, please visit our privacy policy page."
#    1335\t"View Full Privacy Policy on iubenda"

# 2. Update txt/template-privacy.ts to add new section:
#    {
#      heading: '1333',
#      paragraphs: ['1334'],
#      links: [{ href: 'https://...', label: '1335' }],
#    },

# 3. User runs: make i18n:xlate (translates new lines to all languages)
# 4. User runs: make i18n:fill (generates the actual .ts files)
```

---

### Make Commands (USER RUNS THESE - NEVER RUN AUTOMATICALLY)

**IMPORTANT**: The AI assistant must NEVER run these commands. The user will always run them manually after reviewing the changes to source files.

- `make i18n:xlate` - Translates missing lines in `en-GB.txt` to all other language `.txt` files
- `make i18n:fill` - Generates output files (JSON for locales, TS for static) from txt + templates
- `make i18n:sync` - Runs both xlate and fill

---

## Community Translations

Translation files are open-sourced in a separate public repository to allow community contributions:

- **Public repo**: https://github.com/maldous/anqr-i18n
- **Branches**:
  - `static` - Static content translations (guides, about pages)
  - `locales` - UI string translations
- **Auto-sync**: Changes to `src/i18n/static/txt/` and `src/i18n/locales/txt/` are automatically pushed via GitHub Action
- **Contributing**: See the README in the public repo for contribution guidelines

## Professional Logging Standards

The codebase uses a **unified professional logging system** implemented in `src/lib/logger.ts`. All code must use this system - **no direct `console.*` calls are allowed** (enforced by Biome lint rule `noConsole: "error"`).

### Core Principles

1. **Single Source of Truth**: All logging goes through `src/lib/logger.ts`
2. **No Legacy Patterns**: No wrapper loggers, no direct console calls, no module-specific logging implementations
3. **Consistent Interface**: All loggers use the same `Logger` interface with `trace/debug/info/warn/error` methods
4. **Sentry Integration**: Warnings recorded as breadcrumbs, errors sent as events
5. **Sensitive Data Redaction**: Automatic redaction of passwords, tokens, API keys, etc.

### Logger Interface

```typescript
import { createLogger } from '@/lib/logger';

const log = createLogger('SCOPE_NAME');

log.trace('High-volume diagnostic', { pixels: 1000 });  // Inner loops only
log.debug('Processing step', { width: 100, height: 100 }); // Development diagnostics
log.info('Operation complete', { duration: 150 });      // Lifecycle milestones
log.warn('Fallback triggered', { reason: 'timeout' });  // Recoverable issues
log.error('Operation failed', { error });               // Failures
```

### Log Levels (in order of verbosity)

| Level | Purpose | Development | Production | Sentry |
|-------|---------|-------------|------------|--------|
| `trace` | Very high-volume diagnostics (decoder inner loops, per-pixel operations) | OFF* | OFF | None |
| `debug` | Development diagnostics (function entry/exit, state changes, config values) | **ON (default)** | OFF | None |
| `info` | Lifecycle milestones (initialization, export complete, mode changes) | ON | OFF | None |
| `warn` | Unexpected but recoverable (fallback triggered, deprecated usage, low contrast) | ON | ON | Breadcrumb |
| `error` | Failures (unrecoverable errors, failed operations, exceptions) | ON | **ON (default)** | Event |

*trace requires explicit `setLogLevel('trace')` even in development

### Default Log Levels

- **Development** (`import.meta.env.DEV === true`): `debug` (maximum visibility)
- **Production**: `error` (minimum noise - only failures shown)

### Toggling Log Levels at Runtime

```javascript
// In browser console - enable debug logging for 30 minutes
window.anqrDiag.enable(30, 'debugging overlay issue')

// Disable and revert to production default
window.anqrDiag.disable()

// Check current status
window.anqrDiag.status()

// Show help
window.anqrDiag.help()
```

### Log Buffer (for debugging failed operations)

The logger supports capturing logs to a buffer for debugging failed operations (e.g., QR detection failures):

```typescript
import { enableLogBuffer, flushLogBuffer, disableLogBuffer, getBufferSize, clearLogBuffer } from '@/lib/logger';

enableLogBuffer();           // Start capturing (clears existing buffer)
// ... do something that might fail ...
const debugLog = flushLogBuffer(); // Get captured logs as string and clear
disableLogBuffer();          // Stop capturing

// Utilities
getBufferSize();  // Returns current buffer length
clearLogBuffer(); // Clears buffer without disabling
```

**Buffer Limits:**
- Maximum size: **1000 entries** (oldest entries dropped when exceeded)
- Entries include **ISO 8601 timestamps**: `2024-01-15T10:30:45.123Z [SCOPE:level] message`
- Buffer captures even when console output is suppressed (production mode)

### Standard Scope Prefixes

When creating a logger, use one of these standard scope names. **If a new scope is needed, add it to `SCOPE_PREFIXES` in `src/lib/logger.ts` first.**

#### App Shell
| Prefix | Module/File |
|--------|-------------|
| `MAIN` | src/main.tsx |
| `APP` | src/App.tsx |
| `ERROR` | src/components/ErrorBoundary.tsx |
| `HEADER` | src/components/Header.tsx |
| `DIAG` | src/lib/logger-remote.ts |

#### UI Components
| Prefix | Module/File |
|--------|-------------|
| `ANALYZE` | src/components/Analyze.tsx |
| `OVERLAY` | src/components/sections/OverlaySection.tsx |
| `PAYLOAD` | src/components/sections/PayloadSection.tsx |
| `HELP` | src/components/ui/help-link.tsx |
| `GALLERY` | src/components/Gallery.tsx |
| `SIDEBAR` | src/components/Sidebar.tsx |
| `PREVIEW` | src/components/Preview.tsx |
| `WELCOME` | src/components/WelcomeModal.tsx |

#### QR Generation Pipeline
| Prefix | Module/File |
|--------|-------------|
| `QRGEN` | src/hooks/useQRGenerator.ts |
| `GENERATE` | src/modules/qr-generator/ (all files) |
| `DITHER` | src/modules/qr-generator/pixel-matrix-dithered.ts |
| `ENCODER` | src/modules/qr-encoder/ |
| `SPEC` | src/modules/qr-spec/ |

#### QR Analysis Pipeline
| Prefix | Module/File |
|--------|-------------|
| `DECODER` | src/modules/qr-decoder/ |
| `ANALYZER` | src/modules/qr-analyzer/ |
| `SCANNER` | src/modules/qr-analyzer/scanner.ts |
| `SAFETY` | src/modules/qr-analyzer/safety.ts |

#### Export & Sharing
| Prefix | Module/File |
|--------|-------------|
| `EXPORT` | src/modules/exporter/ |
| `SHARE` | src/modules/share-links/ |
| `CLIPBOARD` | src/modules/browser-clipboard/ |
| `DOWNLOAD` | src/modules/browser-io/ |

#### Media & Effects
| Prefix | Module/File |
|--------|-------------|
| `ANIMATION` | src/modules/animation/ |
| `WATERMARK` | src/modules/overlay/watermark.ts |
| `TELEMETRY` | src/modules/qr-analyzer/telemetry-*.ts |

#### Data & Platform
| Prefix | Module/File |
|--------|-------------|
| `I18N` | src/i18n/index.ts |
| `STATIC` | src/i18n/static/index.ts |
| `PLATFORM` | src/modules/platform/ |
| `ADMOB` | src/modules/platform/admob.ts |
| `STORAGE` | src/modules/platform/media-store.ts |

#### Advanced Features
| Prefix | Module/File |
|--------|-------------|
| `QART` | src/modules/qr-art/ |
| `CORE` | src/modules/core/ |
| `COLOR` | src/modules/core/color.ts |
| `GRADIENT` | src/modules/core/gradient.ts |

### Logging Rules for New Code

1. **Import the logger**:
   ```typescript
   import { createLogger } from '@/lib/logger';
   // or for path aliases:
   import { createLogger } from '../../lib/logger';
   ```

2. **Create a scoped logger** at module level:
   ```typescript
   const log = createLogger('SCOPE_NAME');
   ```

3. **Use appropriate log levels**:
   - `trace`: Only for inner loops that execute 1000s of times
   - `debug`: Normal development diagnostics
   - `info`: Significant state transitions (init complete, export done)
   - `warn`: Something unexpected but handled (Sentry breadcrumb)
   - `error`: Something failed (Sentry event)

4. **Use structured context objects** (not string concatenation):
   ```typescript
   // GOOD
   log.debug('Processing image', { width, height, format });
   
   // BAD
   log.debug(`Processing image: ${width}x${height} (${format})`);
   ```

5. **Don't include scope prefix in message** (logger adds it automatically):
   ```typescript
   // GOOD
   log.debug('Starting decode');
   
   // BAD
   log.debug('[DECODER] Starting decode');
   ```

6. **Pass errors in context object**:
   ```typescript
   try {
     // ...
   } catch (error) {
     log.error('Operation failed', { error });  // Sentry captures the error
   }
   ```

### Sensitive Data Redaction

The following keys are automatically redacted from log context:
- `password`, `token`, `secret`, `apiKey`, `api_key`
- `authorization`, `auth`, `credential`
- `sessionId`, `session_id`, `accessToken`, `access_token`
- `refreshToken`, `refresh_token`, `privateKey`, `private_key`

### Configuration Constants

| Constant | Value | Purpose |
|----------|-------|--------|
| `MAX_BUFFER_SIZE` | 1000 | Maximum log buffer entries before oldest are dropped |
| `MAX_CONTEXT_DEPTH` | 10 | Maximum object nesting depth for context serialization |

---

## Appendix A: additional key files

### `netlify/functions/qr.ts`

- Purpose: server-side image generator for `anqr.link/?...` and share embeds.
- Canvas backend: `@napi-rs/canvas`.
- Animated output: GIF helpers (`gifenc`, `gifuct-js`).
- Imports the same generator: `../../src/modules/qr-generator.js`.
- Uses `src/modules/shared/index.ts` for pure helpers.

### `android/app/src/main/java/link/anqr/app/MediaStoreWriterPlugin.java`

- Purpose: write exported files into Android’s MediaStore (Documents / Downloads) so users can find them without raw filesystem permissions.
- Called by: `src/modules/media-store-writer.ts`.

## Appendix B: full public query parameter keys (client)

These are the keys the client may emit when generating share URLs.

```text
align, animFrames, animPattern, animSeed, animSpeed, autoEcc, autoReduce, autoVer, bg, bgOver, blur, bnSeed, bnTile, border, bounce, brightness, cGuard, colorCycle, colorDither, colorMode, contrast, crisp, cropEn, cropSize, cropX, cropY, data, diffusionKernel, ditherKind, ditherStrength, dotRot, dpi, duo1, duo2, easing, ec, eccAware, eccMap, eccRisk, edge, enc, eyeInner, eyeOuter, eyeScale, fg, finder, fit, flipX, flipY, fmtExtra, fname, format, frame, frameText, gamma, gap, gapMode, gifColors, gifDelays, gifDisp, gifDispH, gifDith, gifMaxFps, gifPal, gifQuant, gifTrans, grad, gradAngle, gradStops, h, htCell, htCurve, htDot, hue, img, inclQz, intensity, interp, invert, jitter, jpegQ, keepAlign, keepFinders, keepTiming, lang, lockA, lockF, lockFmt, lockT, lockV, logoSize, loop, margin, matrix, maxF, maxIntH, maxIntL, maxIntM, maxIntQ, metaAuthor, metaCopy, metaDesc, metaKv, metaLic, metaTime, metaTitle, minContrast, modColor, mode, modulePx, ovFramePick, ovType, palette, paletteMode, posterize, protectFmt, protectVer, qaBlur, qaContrast, qaHeatmap, qaNoise, qaRot, quality, qzEnforce, radius, reverse, rot, safeMinPx, safeMinQz, safeMode, saturation, seed, serpentine, sharpen, size, snap, spCenter, spFinder, spGrid, spGridNum, spNeutral, speed, startF, stepF, style, subpixel, svgEmbed, svgPrec, svgVec, tempDither, threshold, timing, transparent, v, w, webpQ, wmBlend, wmEn, wmImg, wmKind, wmOpacity, wmPos, wmText
```
