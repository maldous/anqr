# ANQR RAG Chunker

## 1. Directory Overview

This directory implements **ANQR RAG Chunker** within the ANQR harness. Key immediate entries include `index.mjs`, `find-json-top-level-key-ranges.mjs`, `make-chunk-from-offsets.mjs`, `split-range-by-size.mjs`. The current inventory is 34 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **build-line-starts.mjs** - Exports `buildLineStarts`, which builds line starts.
- **chunk-code.mjs** - Exports `chunkCode`, which implements chunk code.
- **chunk-file.mjs** - Exports `chunkFile`, which implements chunk file.
- **chunk-generic-text.mjs** - Exports `chunkGenericText`, which implements chunk generic text.
- **chunk-json.mjs** - Exports `chunkJson`, which implements chunk json.
- **chunk-markdown.mjs** - Exports `chunkMarkdown`, which implements chunk markdown.
- **classify-chunk.mjs** - Exports `classifyChunk`, which implements classify chunk.
- **code-boundary-patterns.mjs** - Exports `CODE_BOUNDARY_PATTERNS`, a shared constant used by sibling modules.
- **code-extensions.mjs** - Exports `CODE_EXTENSIONS`, a shared `Set` constant used by this module group.
- **collect-files.mjs** - Exports `collectFiles`, which collects files.
- **decorator-pattern.mjs** - Exports `DECORATOR_PATTERN`, a regular-expression constant used for validation.
- **default-options.mjs** - Exports `DEFAULT_OPTIONS`, a shared constant used by sibling modules.
- **find-code-boundaries.mjs** - Exports `findCodeBoundaries`, which finds code boundaries.
- **find-json-top-level-key-ranges.mjs** - Exports `findJsonTopLevelKeyRanges`, which finds json top level key ranges.
- **find-preferred-break.mjs** - Exports `findPreferredBreak`, which finds preferred break.
- **hash-string.mjs** - Exports `hashString`, which implements hash string.
- **include-decorators-and-jsdoc.mjs** - Exports `includeDecoratorsAndJSDoc`, which implements include decorators and jsdoc.
- **index.mjs** - Facade module that re-exports public members from `./default-options.mjs`, `./code-extensions.mjs`, `./markdown-extensions.mjs`, `./json-extensions.mjs`, `./text-config-extensions.mjs`, `./code-boundary-patterns.mjs`, and 26 more siblings.
- **is-supported-file.mjs** - Exports `isSupportedFile`, which checks whether supported file.
- **jsdoc-start-pattern.mjs** - Exports `JSDOC_START_PATTERN`, a regular-expression constant used for validation.
- **json-extensions.mjs** - Exports `JSON_EXTENSIONS`, a shared `Set` constant used by this module group.
- **line-index-to-offset.mjs** - Exports `lineIndexToOffset`, which implements line index to offset.
- **line-number-for-offset.mjs** - Exports `lineNumberForOffset`, which implements line number for offset.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **make-chunk-from-offsets.mjs** - Exports `makeChunkFromOffsets`, which implements make chunk from offsets.
- **make-chunk-id.mjs** - Exports `makeChunkId`, which implements make chunk id.
- **markdown-extensions.mjs** - Exports `MARKDOWN_EXTENSIONS`, a shared `Set` constant used by this module group.
- **md-heading-pattern.mjs** - Exports `MD_HEADING_PATTERN`, a regular-expression constant used for validation.
- **normalize-extensions.mjs** - Exports `normalizeExtensions`, which normalizes extensions.
- **normalize-path-fragment.mjs** - Exports `normalizePathFragment`, which normalizes path fragment.
- **push-segmented-range.mjs** - Exports `pushSegmentedRange`, which implements push segmented range.
- **split-range-by-size.mjs** - Exports `splitRangeBySize`, which implements split range by size.
- **text-config-extensions.mjs** - Exports `TEXT_CONFIG_EXTENSIONS`, a shared `Set` constant used by this module group.
- **trim-segment-bounds.mjs** - Exports `trimSegmentBounds`, which implements trim segment bounds.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include file-system access, and timer, scheduling, cooldown, or watchdog behavior.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/lib/rag/chunker/index.mjs";
```

## 5. Dependencies

- **Node.js built-ins** - `node:fs/promises`, `node:path`
- **Internal relative modules** - `../../logger.mjs`, `./build-line-starts.mjs`, `./chunk-code.mjs`, `./chunk-generic-text.mjs`, `./chunk-json.mjs`, `./chunk-markdown.mjs`, `./classify-chunk.mjs`, `./code-boundary-patterns.mjs`, `./code-extensions.mjs`, `./decorator-pattern.mjs`, `./default-options.mjs`, `./find-code-boundaries.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
