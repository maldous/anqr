# ANQR RAG Chunker

## 1. Directory Overview

This directory contains the core text chunking engine for the ANQR (Agentic Number Query Runner) RAG (Retrieval-Augmented Generation) system. It provides intelligent file chunking capabilities that parse and segment various file types (code, Markdown, JSON, and plain text) into semantic chunks suitable for vector embeddings and retrieval. The chunker respects code structure boundaries, Markdown headings, and JSON top-level keys to produce semantically meaningful chunks.

## 2. File Summaries

### Constants and Patterns

- **default-options.mjs** - Default configuration: `maxChunkSize: 2000`, `overlap: 120`, and a comprehensive list of supported file extensions (.ts, .tsx, .js, .jsx, .mjs, .cjs, .md, .mdx, .json, .css, .html, .yml, .yaml, .sh, .py, .java, .kt, .swift, .gradle, .properties, .xml, .plist, .pbxproj, .xcconfig).

- **code-extensions.mjs** - Set of code file extensions: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.py`, `.sh`, `.java`, `.kt`, `.swift`, `.gradle`.

- **markdown-extensions.mjs** - Set: `".md"`, `".mdx"`.

- **json-extensions.mjs** - Set: `".json"`.

- **text-config-extensions.mjs** - Set for config files: `.css`, `.html`, `.yml`, `.yaml`, `.service`, `.timer`, `.properties`, `.xml`, `.plist`, `.pbxproj`, `.xcconfig`.

- **code-boundary-patterns.mjs** - Array of regex patterns for detecting code structure boundaries: export functions, classes, interfaces, enums, const/let/var declarations, test blocks (describe/it/test).

- **decorator-pattern.mjs** - Regex pattern: `/^@[A-Za-z_$][\w$.()]*`.

- **jsdoc-start-pattern.mjs** - Regex pattern: `/^\s*\/\*\*`.

- **md-heading-pattern.mjs** - Regex pattern: `/^#{1,4}\s+/` for Markdown headings (h1-h4).

### Utility Functions

- **normalize-path-fragment.mjs** - `normalizePathFragment(filePath)`: Sanitizes file paths by replacing non-alphanumeric characters (except `.*/-`) with underscores, truncating to 120 chars.

- **hash-string.mjs** - `hashString(input)`: FNV-1a hash algorithm returning a 32-bit hash as a base-36 string.

- **build-line-starts.mjs** - `buildLineStarts(text)`: Builds an array of line start positions for efficient line offset lookup.

- **line-number-for-offset.mjs** - `lineNumberForOffset(lineStarts, offset)`: Binary search to find line number for a character offset.

- **line-index-to-offset.mjs** - `lineIndexToOffset(lineStarts, lineIndex, textLength)`: Converts line index to character offset.

- **trim-segment-bounds.mjs** - `trimSegmentBounds(text, startOffset, endOffset)`: Trims leading/trailing whitespace from chunk boundaries while preserving line integrity.

- **normalize-extensions.mjs** - `normalizeExtensions(extensions)`: Normalizes extension array or returns defaults.

- **is-supported-file.mjs** - `isSupportedFile(filePath, extensions)`: Checks if file extension is supported.

### Chunking Logic

- **find-code-boundaries.mjs** - `findCodeBoundaries(lines)`: Identifies code structure boundaries (functions, classes, interfaces, exports, tests) using `CODE_BOUNDARY_PATTERNS`, including decorators and JSDoc comments.

- **include-decorators-and-jsdoc.mjs** - `includeDecoratorsAndJSDoc(lines, lineIndex)`: Extends boundary to include preceding decorators and JSDoc comments.

- **find-preferred-break.mjs** - `findPreferredBreak(text, startOffset, candidateEnd, hardEnd)`: Finds optimal chunk break point prioritizing: newlines, paragraph breaks (double newline), sentence endings (`. `, `; `), then word boundaries. Enforces 55% minimum retention.

- **split-range-bySize.mjs** - `splitRangeBySize(text, startOffset, endOffset, maxChunkSize, overlap)`: Recursively splits text range into chunks using preferred breaks, with safety ceiling (hardLimit) to prevent infinite loops.

- **classify-chunk.mjs** - `classifyChunk(content, ext)`: Determines chunk type: "section" (Markdown with heading), "paragraph" (Markdown without heading), "class", "function", or "block".

- **make-chunk-id.mjs** - `makeChunkId(filePath, startLine, endLine, type, content)`: Generates unique chunk ID from normalized path fragment, line range, type, and content length hash.

- **make-chunk-from-offsets.mjs** - `makeChunkFromOffsets(text, lineStarts, filePath, ext, startOffset, endOffset, explicitType)`: Creates chunk object with trimmed content, line numbers, type classification, and unique ID.

- **push-segmented-range.mjs** - `pushSegmentedRange(chunks, text, lineStarts, filePath, ext, startOffset, endOffset, maxChunkSize, overlap, type)`: Orchestrates chunk creation - single chunk if under max size, otherwise delegates to `splitRangeBySize`.

### File-Type Specific Chunkers

- **chunk-code.mjs** - `chunkCode(text, filePath, options)`: Chunks code files by detecting structure boundaries via `findCodeBoundaries`, then segmenting each region.

- **chunk-markdown.mjs** - `chunkMarkdown(text, filePath, options)`: Chunks Markdown files by heading boundaries (h1-h4), classifying each section.

- **chunk-json.mjs** - `chunkJson(text, filePath, options)`: Chunks JSON files by top-level keys using `findJsonTopLevelKeyRanges`, falling back to generic segmentation if parsing fails or single-key.

- **chunk-generic-text.mjs** - `chunkGenericText(text, filePath, options)`: Chunks plain text/config files using `pushSegmentedRange`, treating config extensions as "block" type.

### File Operations

- **collect-files.mjs** - `collectFiles(dirPath, extensions)`: Recursively traverses directory (skipping `node_modules` and dotfiles), collecting supported files sorted alphabetically.

- **chunk-file.mjs** - `chunkFile(filePath, options)`: Main entry point - reads file, dispatches to appropriate chunker based on extension, returns array of chunks.

### Index and Logging

- **index.mjs** - Generated facade exporting all public API members: constants, utilities, and chunker functions.

- **logger.mjs** - Shared logger using `createLogger("rag-chunker")` from `../../logger.mjs`, exports `logDebug`, `logInfo`, `logWarn`, `logError`.

### JSON Parsing

- **find-json-top-level-key-ranges.mjs** - `findJsonTopLevelKeyRanges(text)`: Parses JSON, extracts top-level key line indices. Returns null for arrays, empty objects, or unparseable JSON.

## 3. Overall Directory Function

This directory serves as the RAG system's text segmentation engine. It transforms raw source files into semantically meaningful chunks suitable for vector embedding and retrieval.

**Workflow:**
1. `chunkFile()` is the main entry point - it reads a file and dispatches to the appropriate chunker
2. File type detection uses file extension to choose: `chunkCode()`, `chunkMarkdown()`, `chunkJson()`, or `chunkGenericText()`
3. Each chunker identifies logical boundaries (code functions/classes, Markdown headings, JSON keys)
4. `pushSegmentedRange()` handles the size management - if a segment exceeds `maxChunkSize`, it calls `splitRangeBySize()` which finds preferred break points
5. Each final chunk gets a unique ID, line numbers, content, and type classification

**Key Design Decisions:**
- **Structure-aware**: Respects code/Markdown structure rather than blindly chunking by character count
- **Overlap support**: Chunks can overlap (default 120 chars) to preserve context across boundaries
- **Safe splitting**: `findPreferredBreak()` ensures chunks don't break mid-sentence when possible
- **JSDoc/Decorator preservation**: Code chunking includes preceding documentation and decorators
- **Fail-safe**: JSON parsing falls back to generic chunking if top-level key extraction fails

## 4. Usage Instructions

### Basic Usage

```javascript
import { chunkFile, collectFiles } from "./ops/lib/rag/chunker/index.mjs";

// Chunk a single file
const chunks = await chunkFile("./src/myFile.ts");
console.log(chunks.length); // Number of chunks
console.log(chunks[0].content); // Chunk text
console.log(chunks[0].startLine); // Starting line number
console.log(chunks[0].type); // "function", "class", "block", etc.

// Collect files from directory
const files = await collectFiles("./src", [".ts", ".js", ".md"]);

// Chunk all files in directory
for (const file of files) {
  const fileChunks = await chunkFile(file);
  // Process chunks...
}
```

### Custom Options

```javascript
const chunks = await chunkFile("./src/myFile.ts", {
  maxChunkSize: 3000,  // Max characters per chunk (default: 2000)
  overlap: 200,        // Character overlap between chunks (default: 120)
  extensions: [".ts", ".tsx", ".js"], // Supported extensions
});
```

### Direct Module Imports

You can also import specific functions for granular control:

```javascript
import { chunkCode } from "./ops/lib/rag/chunker/chunk-code.mjs";
import { chunkMarkdown } from "./ops/lib/rag/chunker/chunk-markdown.mjs";
import { findCodeBoundaries } from "./ops/lib/rag/chunker/find-code-boundaries.mjs";
```

## 5. Dependencies

### Internal Dependencies

- **../../logger.mjs** - Logger factory used by `logger.mjs` in this directory.

### Runtime Requirements

- **Node.js** - ESM modules with `.mjs` extension, requires Node.js with ESM support.
- **Node.js built-ins** - `node:path`, `node:fs/promises` for file operations.

### File Type Support

The chunker natively supports:
- **Code**: TypeScript, JavaScript, Python, Java, Kotlin, Swift, Shell, Gradle
- **Markdown**: .md, .mdx
- **Data**: JSON
- **Config**: CSS, HTML, YAML, XML, Properties, Plist, Xcode configs

## 6. Additional Comments

- **Semantic vs. Mechanical Chunking**: Unlike simple character-count chunkers, this system preserves code structure (functions, classes) and Markdown sections, making retrieved chunks more meaningful for AI contexts.

- **Chunk ID Format**: `normalizePathFragment(filePath)__startLine_endLine__hash` provides uniqueness while remaining readable (e.g., `src_controllers_user_mjs__42_58__abc123`).

- **Overlap Strategy**: Default 120-char overlap (~10% of maxChunkSize) ensures context bleeds across boundaries, useful for retrieving partial functions or paragraphs.

- **Safety Limits**: `splitRangeBySize()` includes a hardLimit (calculated ceiling + 16 iterations) to prevent infinite loops on pathological inputs.

- **Empty File Handling**: `chunkFile()` returns empty array for empty/ whitespace-only files.

- **Error Resilience**: JSON chunking gracefully falls back to generic text chunking if parsing fails, ensuring robust operation across diverse inputs.