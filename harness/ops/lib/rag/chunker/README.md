# Chunker

## Purpose
Chunker contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents

- 34 immediate files
- 0 child directories

## Key Files

- `build-line-starts.mjs` - Exports `buildLineStarts`, the main helper defined in this file.
- `chunk-code.mjs` - Exports `chunkCode`, the main helper defined in this file.
- `chunk-file.mjs` - Exports `chunkFile`, the main helper defined in this file.
- `chunk-generic-text.mjs` - Exports `chunkGenericText`, the main helper defined in this file.
- `chunk-json.mjs` - Exports `chunkJson`, the main helper defined in this file.
- `chunk-markdown.mjs` - Exports `chunkMarkdown`, the main helper defined in this file.
- `classify-chunk.mjs` - Exports `classifyChunk`, the main helper defined in this file.
- `code-boundary-patterns.mjs` - Exports `CODE_BOUNDARY_PATTERNS`, a shared constant or state value used by sibling modules.
- `code-extensions.mjs` - Exports `CODE_EXTENSIONS`, a shared constant or state value used by sibling modules.
- `collect-files.mjs` - Exports `collectFiles`, the main helper defined in this file.
- `decorator-pattern.mjs` - Exports `DECORATOR_PATTERN`, a shared constant or state value used by sibling modules.
- `default-options.mjs` - Exports `DEFAULT_OPTIONS`, a shared constant or state value used by sibling modules.
- `find-code-boundaries.mjs` - Exports `findCodeBoundaries`, the main helper defined in this file.
- `find-json-top-level-key-ranges.mjs` - Exports `findJsonTopLevelKeyRanges`, the main helper defined in this file.
- `find-preferred-break.mjs` - Exports `findPreferredBreak`, the main helper defined in this file.
- `hash-string.mjs` - Exports `hashString`, the main helper defined in this file.
- `include-decorators-and-jsdoc.mjs` - Exports `includeDecoratorsAndJSDoc`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `is-supported-file.mjs` - Exports `isSupportedFile`, the main helper defined in this file.
- `jsdoc-start-pattern.mjs` - Exports `JSDOC_START_PATTERN`, a shared constant or state value used by sibling modules.
- `json-extensions.mjs` - Exports `JSON_EXTENSIONS`, a shared constant or state value used by sibling modules.
- `line-index-to-offset.mjs` - Exports `lineIndexToOffset`, the main helper defined in this file.
- `line-number-for-offset.mjs` - Exports `lineNumberForOffset`, the main helper defined in this file.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `make-chunk-from-offsets.mjs` - Exports `makeChunkFromOffsets`, the main helper defined in this file.
- `make-chunk-id.mjs` - Exports `makeChunkId`, the main helper defined in this file.
- `markdown-extensions.mjs` - Exports `MARKDOWN_EXTENSIONS`, a shared constant or state value used by sibling modules.
- `md-heading-pattern.mjs` - Exports `MD_HEADING_PATTERN`, a shared constant or state value used by sibling modules.
- `normalize-extensions.mjs` - Exports `normalizeExtensions`, the main helper defined in this file.
- `normalize-path-fragment.mjs` - Exports `normalizePathFragment`, the main helper defined in this file.
- `push-segmented-range.mjs` - Exports `pushSegmentedRange`, the main helper defined in this file.
- `split-range-by-size.mjs` - Exports `splitRangeBySize`, the main helper defined in this file.
- `text-config-extensions.mjs` - Exports `TEXT_CONFIG_EXTENSIONS`, a shared constant or state value used by sibling modules.
- `trim-segment-bounds.mjs` - Exports `trimSegmentBounds`, the main helper defined in this file.

## Subdirectories

- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 34 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
