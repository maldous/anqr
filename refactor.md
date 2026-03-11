# Sonar Cognitive Complexity Reduction Tasks

Goal:
Reduce each flagged function to Sonar Cognitive Complexity < 15 without changing behaviour.

Global rules:
- Prefer decomposition over cleverness.
- Do not mix behavioural changes with structural refactor.
- Preserve public props, hook contracts, store shape, API contract, and output format.
- Add focused tests before refactor where coverage is weak.
- Each extracted helper should have a single responsibility and a name that explains intent.
- Prefer registry/strategy/pipeline patterns over long if/switch chains.
- Keep side effects at the edges.

Definition of done for every task:
- Flagged function reduced to < 15 cognitive complexity.
- No user-visible regressions.
- Unit/integration tests pass.
- No meaningful bundle/serverless size regression unless justified.
- New helpers/hooks/components have clear names and local tests where practical.
- Remove dead branches discovered during refactor.
```

---

## 1) `netlify/functions/qr.ts` `L3613`

### Task

Refactor the large Netlify QR function into a linear request pipeline.

### Problem shape

Likely doing too much in one handler:

* request parsing
* method/content validation
* payload normalization
* cache keying / cache checks
* QR generation/rendering
* response shaping
* error mapping

### Target structure

```ts
export const handler = withRequestContext(async (event) => {
  const request = parseRequest(event)
  validateRequest(request)

  const cacheKey = buildCacheKey(request)
  const cached = await tryGetCachedResponse(cacheKey)
  if (cached) return cached

  const renderPlan = buildRenderPlan(request)
  const result = await renderQrResponse(renderPlan)

  return finalizeResponse(result, cacheKey)
})
```

### Extract helpers

* `parseRequest(event)`
* `validateRequest(request)`
* `buildCacheKey(request)`
* `tryGetCachedResponse(cacheKey)`
* `buildRenderPlan(request)`
* `renderQrResponse(plan)`
* `finalizeResponse(result, cacheKey)`
* `mapErrorToHttpResponse(error)`

### Notes

* Keep all side effects in handler/finalize functions.
* Replace nested validation branches with guard clauses.
* If there are multiple render modes, use a mode strategy map.

### Acceptance

* Main handler < 15
* Error behaviour unchanged
* Cache behaviour unchanged

---

## 2) `src/App.tsx` `L361`

### Task

Break the giant app-level initialization / URL-param sync function into domain-specific appliers.

### Problem shape

Usually one huge `useEffect` or startup function handling:

* search params
* local storage
* payload hydration
* render settings
* artwork settings
* animation settings
* migration / compatibility rules

### Target structure

```ts
const initStateFromUrl = (params, actions) => {
  applyPayloadParams(params, actions)
  applyStyleParams(params, actions)
  applyOverlayParams(params, actions)
  applyAnimationParams(params, actions)
  applyExportParams(params, actions)
}
```

### Extract groups

* `applyPayloadParams`
* `applyContentTypeParams`
* `applyVisualStyleParams`
* `applyOverlayParams`
* `applyAnimationParams`
* `applyExportParams`
* `applyCompatibilityMigrations`

### Better pattern

Use a registry where possible:

```ts
const PARAM_APPLIERS = [
  applyPayloadParams,
  applyStyleParams,
  applyOverlayParams,
  ...
]
PARAM_APPLIERS.forEach(fn => fn(params, actions))
```

### Notes

* Avoid one setter per branch in a huge effect.
* Split read/normalize/apply.
* If there is a giant dependency-heavy `useEffect`, move logic into pure functions and keep the effect tiny.

### Acceptance

* App init function < 15
* URL/state parity unchanged
* Existing deep-link behaviour preserved

---

## 3) `src/components/Analyze.tsx` `L1070`

### Task

Split the large Analyze component function into controller hook plus small display components.

### Problem shape

Component likely mixes:

* state derivation
* async operations
* content analysis rules
* conditional rendering
* action handlers
* warnings / diagnostics

### Target structure

* `useAnalyzeController(...)`
* `AnalyzeLayot`
* `AnalyzeSummary`
* `AnalyzeWarnings`
* `AnalyzeActions`
* `AnalyzeDetails`

### Extract responsibilities

* input normalization
* analysis execution
* status derivation
* CTA enablement
* conditional display sections

### Notes

* Compute derived state in memoized selectors/helpers.
* Convert large inline JSX ternaries to section components.
* Keep component body mostly wiring.

### Acceptance

* Flagged component function < 15
* JSX readability improved
* Same UI states rendered

---

## 4) `src/components/Analyze.tsx` `L1117`

### Task

Refactor the large analysis/reproduction flow into a staged hook/service.

### Problem shape

Likely one async function/effect with many nested fallbacks:

* resolve source
* parse payload
* infer type
* regenerate QR
* handle failure modes
* collect diagnostics

### Target structure

```ts
async function runAnalysisPipeline(input) {
  const source = resolveAnalysisSource(input)
  const normalized = normalizeAnalysisInput(source)
  const model = inferAnalysisModel(normalized)
  const reproduction = await reproduceResult(model)
  return buildAnalysisReport(reproduction)
}
```

### Extract helpers

* `resolveAnalysisSource`
* `normalizeAnalysisInput`
* `inferAnalysisModel`
* `reproduceResult`
* `buildAnalysisWarnings`
* `buildAnalysisReport`

### Notes

* Each fallback branch should become its own helper.
* Replace nested `if/else` rescue logic with early returns.

### Acceptance

* Function < 15
* Diagnostics preserved
* Failure reasons still surfaced

---

## 5) `src/components/Header.tsx` `L575`

### Task

Refactor Header into controller + menu/action subcomponents.

### Problem shape

Header often accumulates:

* desktop/mobile branching
* dropdown state
* route-aware actions
* auth/user actions
* language/theme/help items

### Target structure

* `useHeaderController()`
* `HeaderDesktopNav`
* `HeaderMobileMenu`
* `HeaderUserActions`
* `HeaderUtilityActions`

### Notes

* Move menu item arrays to config objects.
* Replace nested conditionals with declarative item lists filtered by capability/state.
* Keep the top-level component mostly layout.

### Acceptance

* Main Header function < 15
* Same nav/actions visible in same states

---

## 6) `src/components/analyze/content-type-renderers.tsx` `L102`

### Task

Replace content-type/platform detection chain with a matcher registry.

### Problem shape

Long if/else ladder checking domains/types/platform heuristics.

### Target structure

```ts
const RENDERER_MATCHERS = [
  whatsappRenderer,
  wifiRenderer,
  emailRenderer,
  urlRenderer,
  ...
]

export function resolveRenderer(input) {
  return RENDERER_MATCHERS.find(r => r.matches(input)) ?? defaultRenderer
}
```

### Renderer contract

```ts
type Renderer = {
  id: string
  matches: (value: AnalyzeValue) => boolean
  render: (value: AnalyzeValue) => ReactNode
}
```

### Notes

* Best for social platforms, URL families, communication payloads.
* Removes branching and local duplication.

### Acceptance

* Resolver function < 15
* New renderer addition requires adding one registry entry only

---

## 7) `src/components/analyze/content-type-renderers.tsx` `L432`

### Task

Replace giant detail-rendering switch with a registry of content-type detail builders.

### Problem shape

One large function probably does:

* switch on payload type
* build labels/sections/actions
* generate field lists
* hide irrelevant values

### Target structure

```ts
const DETAIL_BUILDERS: Record<ContentType, DetailBuilder> = { ... }

export function buildContentTypeDetails(model) {
  return (DETAIL_BUILDERS[model.type] ?? buildUnknownDetails)(model)
}
```

### Extract per type/family

* contact/card
* URL
* Wi-Fi
* email/SMS/phone
* geo/calendar/payment
* social/media

### Notes

* Common field formatting should be shared helpers:

  * `presentField`
  * `presentOptionalField`
  * `buildActionList`

### Acceptance

* Main detail builder < 15
* Adding a new content type is isolated

---

## 8) `src/components/sections/OverlaySection.tsx` `L264`

### Task

Split overlay section logic into source handling, crop handling, and preview handling.

### Problem shape

Likely mixes:

* source selection
* file upload
* image validation
* crop/open/close state
* overlay enablement
* preview branching

### Target structure

* `useOverlaySourceActions`
* `useOverlayCropState`
* `OverlaySourcePanel`
* `OverlayCropPanel`
* `OverlayPreviewPanel`

### Extract helpers

* `validateOverlayFile`
* `resolveOverlaySource`
* `openCropper`
* `applyCropResult`
* `buildOverlayPreviewModel`

### Notes

* Guard clause invalid uploads immediately.
* Convert modal branching into derived booleans.

### Acceptance

* Section function < 15
* Upload/crop flows unchanged

---

## 9) `src/components/sections/PayloadSection.tsx` `L615`

### Task

Replace the giant payload editor branch tree with a payload-type registry and per-type editors.

### Problem shape

This is usually the worst UI hotspot:

* many content types
* type-specific defaults
* synchronization rules
* validation and derived preview text
* conditional field rendering

### Target structure

```ts
const PAYLOAD_EDITORS: Record<PayloadType, PayloadEditorDefinition> = { ... }

const editor = PAYLOAD_EDITORS[payloadType] ?? PAYLOAD_EDITORS.text
return <editor.Component ... />
```

### Suggested contract

```ts
type PayloadEditorDefinition = {
  Component: React.ComponentType<PayloadEditorProps>
  normalize?: (state) => state
  validate?: (state) => ValidationResult
  toPreview?: (state) => string
}
```

### Split by family

* plain text / URL
* email / SMS / phone
* Wi-Fi
* vCard/contact
* geo / calendar
* payment/social/app-specific

### Notes

* Put repeated field groups into shared controls.
* Keep sync logic close to the type, not in one master component.
* Use selectors for derived display values.

### Acceptance

* Main PayloadSection function < 15
* Every payload type still editable
* Validation parity maintained

---

## 10) `src/hooks/useQRGenerator.ts` `L1729`

### Task

Turn the main QR generation function into a staged generation session pipeline.

### Problem shape

Likely the largest branch hotspot:

* payload encode
* QR matrix creation
* style decisions
* overlay prep
* artwork path
* animation path
* error correction / mask logic
* preview/final mode differences
* worker/main-thread fallbacks

### Target structure

```ts
async function generateQrSession(input) {
  const session = createGenerationSession(input)
  const payload = preparePayload(session)
  const matrix = await buildQrMatrix(session, payload)
  const styling = resolveStylingPlan(session, matrix)
  const composition = await renderComposition(session, matrix, styling)
  return finalizeGeneration(session, composition)
}
```

### Candidate helper families

* session/context
* payload prep
* QR encode/matrix
* logo/overlay/artwork prep
* animation frame generation
* raster/vector export
* error recovery

### Notes

* Centralise mode checks into selectors:

  * `isAnimated(session)`
  * `isArtwork(session)`
  * `requiresOverlay(session)`
* Replace repeated condition trees with strategy objects.

### Acceptance

* Main generate function < 15
* No rendering regressions
* Same cancellation/error semantics

---

## 11) `src/hooks/useQRGenerator.ts` `L2821`

### Task

Refactor download/export function by export mode strategy.

### Problem shape

One function branching on file type, animation, SVG, PNG, GIF, clipboard, browser constraints.

### Target structure

```ts
const EXPORTERS = {
  svg: exportSvg,
  png: exportPng,
  gif: exportGif,
  animatedGif: exportAnimatedGif,
}

await EXPORTERS[mode](ctx)
```

### Extract helpers

* `resolveExportMode`
* `exportSvg`
* `exportRaster`
* `exportSingleGif`
* `exportAnimatedGif`
* `finalizeDownload`

### Notes

* Browser capability checks should be separate.
* File naming should be one helper.

### Acceptance

* Export function < 15
* Same files produced

---

## 12) `src/hooks/useQRGenerator.ts` `L3290`

### Task

Refactor frame generation into per-scenario handlers.

### Problem shape

Likely branches on:

* animated vs static
* artwork vs plain
* overlay vs no overlay
* worker vs main thread
* preview vs final
* cache hit vs miss

### Target structure

```ts
async function generateAllFrames(ctx) {
  const strategy = resolveFrameGenerationStrategy(ctx)
  return strategy.generate(ctx)
}
```

### Strategies

* `generateStaticFrameSet`
* `generateAnimatedFrameSet`
* `generateArtworkFrameSet`
* `generateOverlayFrameSet`

### Notes

* Put frame looping in one place.
* Put per-frame rendering rules in a separate renderer.

### Acceptance

* Main function < 15
* Frame ordering/timing unchanged

---

## 13) `src/hooks/useQRGenerator.ts` `L3545`

### Task

Refactor artwork frame generation into explicit fallback stages.

### Problem shape

Probably nested try/catch + fallback logic:

* try worker
* fallback to main thread
* fallback with reduced quality
* rescue invalid overlay/config

### Target structure

```ts
async function generateArtworkFrame(ctx) {
  return tryWorkerArtwork(ctx)
    .catch(() => tryMainThreadArtwork(ctx))
    .catch(() => tryReducedComplexityArtwork(ctx))
}
```

Better:

```ts
for (const attempt of getArtworkAttempts(ctx)) {
  const result = await tryAttempt(attempt, ctx)
  if (result.ok) return result.value
}
throw lastError
```

### Extract helpers

* `getArtworkAttempts`
* `tryArtworkAttempt`
* `buildReducedComplexityFallback`
* `normalizeArtworkFailure`

### Acceptance

* Function < 15
* Fallback ordering explicit and testable

---

## 14) `src/store/qr-store.ts` `L1492`

### Task

Replace giant serializer/deserializer/update switch with a registry.

### Problem shape

Store layer likely has one big function for:

* payload serialization
* hydration
* migrations
* defaults per type
* backward compatibility

### Target structure

```ts
const PAYLOAD_SERIALIZERS: Record<PayloadType, PayloadCodec> = { ... }

export function serializePayload(state) {
  const codec = PAYLOAD_SERIALIZERS[state.type] ?? defaultCodec
  return codec.serialize(state)
}
```

### Codec contract

```ts
type PayloadCodec = {
  serialize: (state) => SerializedPayload
  deserialize?: (raw) => Partial<State>
  migrate?: (raw) => Partial<State>
}
```

### Notes

* Separate migration from serialization.
* Shared field copying should be generic helpers, not repeated in each case.
* This usually gives the cleanest Sonar reduction.

### Acceptance

* Main store function < 15
* Saved links/state remain compatible

---

# Recommended PR breakdown

## PR 1: Registry and config foundations

* `content-type-renderers.tsx`
* `qr-store.ts`
* shared type registries

## PR 2: UI decomposition

* `Header.tsx`
* `OverlaySection.tsx`
* `PayloadSection.tsx`
* `Analyze.tsx`

## PR 3: Generator pipeline

* `useQRGenerator.ts`
* shared generation helpers

## PR 4: App init and URL hydration

* `App.tsx`

## PR 5: Serverless handler

* `netlify/functions/qr.ts`

---

# Developer implementation guidance

## Preferred techniques

* Guard clauses
* Strategy objects
* Registry maps
* Pure helper extraction
* Controller hooks for stateful components
* Section components for JSX-heavy branches

## Avoid

* Extracting tiny meaningless wrappers just to satisfy Sonar
* Moving all complexity into one “utils.ts” dump
* Changing data contracts during the same PR
* Mixing refactor with feature work

## Test priorities

* deep-link hydration
* payload type switching
* content-type analysis output
* overlay upload/crop flows
* export modes
* artwork generation fallback
* store serialization round-trip
* serverless QR API parity
