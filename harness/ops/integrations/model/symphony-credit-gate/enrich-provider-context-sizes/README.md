# Enrich Provider Context Sizes

## Purpose
Directory for provider selection, probing, and credit-aware routing; immediate files include `build-context-map-from-api.mjs`, `build-context-map-from-catalog.mjs`, `constants.mjs`, `enrich-provider-context-sizes.mjs`, and others.

## Contents
- 8 immediate files
- 0 child directories

## Key Files
- `build-context-map-from-api.mjs` - Exports `buildContextMapFromApi`, the main helper defined in this file.
- `build-context-map-from-catalog.mjs` - Exports `buildContextMapFromCatalog`, the main helper defined in this file.
- `constants.mjs` - Exports `CONTEXT_REFRESH_INTERVAL_MS`, a shared constant or state value used by sibling modules.
- `enrich-provider-context-sizes.mjs` - Exports `enrichProviderContextSizes`, the main helper defined in this file.
- `extract-context-length.mjs` - Exports `extractContextLength`, the main helper defined in this file.
- `fetch-models-from-api.mjs` - Exports `fetchModelsFromApi`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `parse-models-from-api-response.mjs` - Exports `parseModelsFromApiResponse`, the main helper defined in this file.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 8 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
