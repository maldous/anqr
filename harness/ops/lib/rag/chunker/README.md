# ANQR RAG Chunker

## 1. Directory Overview

This directory contains the core text chunking engine for the ANQR (Agentic Number Query Runner) RAG
(Retrieval-Augmented Generation) system. It provides intelligent file chunking capabilities that
parse and segment various file types (code, Markdown, JSON, and plain text) into semantic chunks
suitable for vector embeddings and retrieval. The chunker respects code structure boundaries,
Markdown headings, and JSON top-level keys to produce semantically meaningful chunks. It currently
contains 34 files and 0 subdirectories.

## 2. File Summaries

### Files

- **build-line-starts.mjs** - `buildLineStarts(text)`: Builds an array of line start positions for efficient line offset lookup.
- **chunk-code.mjs** - `chunkCode(text, filePath, options)`: Chunks code files by detecting structure boundaries via `findCodeBoundaries`, then segmenting each region.
- **chunk-file.mjs** - `chunkFile(filePath, options)`: Main entry point - reads file, dispatches to appropriate chunker based on extension, returns array of chunks.
- **chunk-generic-text.mjs** - `chunkGenericText(text, filePath, options)`: Chunks plain text/config files using `pushSegmentedRange`, treating config extensions as "block" type.
- **chunk-json.mjs** - `chunkJson(text, filePath, options)`: Chunks JSON files by top-level keys using `findJsonTopLevelKeyRanges`, falling back to generic segmentation if parsing fails or single-key.
- **chunk-markdown.mjs** - `chunkMarkdown(text, filePath, options)`: Chunks Markdown files by heading boundaries (h1-h4), classifying each section.
- **classify-chunk.mjs** - `classifyChunk(content, ext)`: Determines chunk type: "section" (Markdown with heading), "paragraph" (Markdown without heading), "class", "function", or "block".
- **code-boundary-patterns.mjs** - Array of regex patterns for detecting code structure boundaries: export functions, classes, interfaces, enums, const/let/var declarations, test blocks (describe/it/test).
- **code-extensions.mjs** - Set of code file extensions: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.py`, `.sh`, `.java`, `.kt`, `.swift`, `.gradle`.
- **collect-files.mjs** - `collectFiles(dirPath, extensions)`: Recursively traverses directory (skipping `node_modules` and dotfiles), collecting supported files sorted alphabetically.
- **decorator-pattern.mjs** - Regex pattern: `/^@[A-Za-z_$][\w$.()]*`.
- **default-options.mjs** - Default configuration: `maxChunkSize: 2000`, `overlap: 120`, and a comprehensive list of supported file extensions (.ts, .tsx, .js, .jsx, .mjs, .cjs, .md, .mdx, .json, .css, .html, .yml, .yaml, .sh, .py, .java, .kt, .swift, .gradle, .properties, .xml, .plist, .pbxproj, .xcconfig).
- **find-code-boundaries.mjs** - `findCodeBoundaries(lines)`: Identifies code structure boundaries (functions, classes, interfaces, exports, tests) using `CODE_BOUNDARY_PATTERNS`, including decorators and JSDoc comments.
- **find-json-top-level-key-ranges.mjs** - `findJsonTopLevelKeyRanges(text)`: Parses JSON, extracts top-level key line indices. Returns null for arrays, empty objects, or unparseable JSON.
- **find-preferred-break.mjs** - `findPreferredBreak(text, startOffset, candidateEnd, hardEnd)`: Finds optimal chunk break point prioritizing: newlines, paragraph breaks (double newline), sentence endings (`. `, `; `), then word boundaries. Enforces 55% minimum retention.
- **hash-string.mjs** - `hashString(input)`: FNV-1a hash algorithm returning a 32-bit hash as a base-36 string.
- **include-decorators-and-jsdoc.mjs** - `includeDecoratorsAndJSDoc(lines, lineIndex)`: Extends boundary to include preceding decorators and JSDoc comments.
- **index.mjs** - Generated facade exporting all public API members: constants, utilities, and chunker functions.
- **is-supported-file.mjs** - `isSupportedFile(filePath, extensions)`: Checks if file extension is supported.
- **jsdoc-start-pattern.mjs** - Regex pattern: `/^\s*\/\*\*`.
- **json-extensions.mjs** - Set: `".json"`.
- **line-index-to-offset.mjs** - `lineIndexToOffset(lineStarts, lineIndex, textLength)`: Converts line index to character offset.
- **line-number-for-offset.mjs** - `lineNumberForOffset(lineStarts, offset)`: Binary search to find line number for a character offset.
- **logger.mjs** - Shared logger using `createLogger("rag-chunker")` from `../../logger.mjs`, exports `logDebug`, `logInfo`, `logWarn`, `logError`.
- **make-chunk-from-offsets.mjs** - `makeChunkFromOffsets(text, lineStarts, filePath, ext, startOffset, endOffset, explicitType)`: Creates chunk object with trimmed content, line numbers, type classification, and unique ID.
- **make-chunk-id.mjs** - `makeChunkId(filePath, startLine, endLine, type, content)`: Generates unique chunk ID from normalized path fragment, line range, type, and content length hash.
- **markdown-extensions.mjs** - Set: `".md"`, `".mdx"`.
- **md-heading-pattern.mjs** - Regex pattern: `/^#{1,4}\s+/` for Markdown headings (h1-h4).
- **normalize-extensions.mjs** - `normalizeExtensions(extensions)`: Normalizes extension array or returns defaults.
- **normalize-path-fragment.mjs** - `normalizePathFragment(filePath)`: Sanitizes file paths by replacing non-alphanumeric characters (except `.*/-`) with underscores, truncating to 120 chars.
- **push-segmented-range.mjs** - `pushSegmentedRange(chunks, text, lineStarts, filePath, ext, startOffset, endOffset, maxChunkSize, overlap, type)`: Orchestrates chunk creation - single chunk if under max size, otherwise delegates to `splitRangeBySize`.
- **split-range-by-size.mjs** - Module that supports split range by size. Exports `splitRangeBySize`.
- **text-config-extensions.mjs** - Set for config files: `.css`, `.html`, `.yml`, `.yaml`, `.service`, `.timer`, `.properties`, `.xml`, `.plist`, `.pbxproj`, `.xcconfig`.
- **trim-segment-bounds.mjs** - `trimSegmentBounds(text, startOffset, endOffset)`: Trims leading/trailing whitespace from chunk boundaries while preserving line integrity.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./index.mjs";
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory exposes a public API through `index.mjs`.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
