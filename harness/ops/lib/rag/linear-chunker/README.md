# Linear Issue Chunker

## 1. Directory Overview

This directory contains the Linear issue chunking module for the RAG (Retrieval-Augmented
Generation) pipeline. It transforms Linear issues into structured text chunks suitable for embedding
and semantic search. The chunking process extracts key metadata from issues (priority, state, team,
project, assignee, labels, etc.) and formats them into a consistent, searchable document structure.
It currently contains 9 files and 0 subdirectories.

## 2. File Summaries

### Files

- **as-comma-list.mjs** - Formats an array of values into a comma-separated string. Filters out falsy values and returns "None" for empty arrays.
- **chunk-linear-issue.mjs** - Core chunking function that transforms a single Linear issue object into a structured chunk. Extracts identifier, title, priority, state, team, project, assignee, creator, labels, timestamps, and URL. Returns a chunk object with `id`, `filePath`, `content`, `startLine`, `endLine`, `type`, and `metadata`.
- **chunk-linear-issues.mjs** - Batch processor that iterates through an array of issues and chunks each one using `chunkLinearIssue`. Returns an array of chunks.
- **compact-whitespace.mjs** - Utility function that normalizes whitespace in text. Converts Windows-style line endings to Unix, collapses multiple consecutive newlines to double newlines, and trims leading/trailing whitespace.
- **count-lines.mjs** - Simple utility that counts the number of lines in a given text string. Returns 1 for null/undefined inputs.
- **index.mjs** - Facade index that re-exports all public API members: `MAX_DESCRIPTION_CHARS`, `compactWhitespace`, `truncateDescription`, `chunkLinearIssue`, and `chunkLinearIssues`.
- **logger.mjs** - Shared logger module for this directory using the project's centralized logger from `../../logger.mjs`. Exports `logDebug` function with the namespace "rag-linear-chunker".
- **max-description-chars.mjs** - Configuration constant for maximum description length. Defaults to 1800 characters, configurable via `LINEAR_RAG_MAX_DESCRIPTION_CHARS` environment variable.
- **truncate-description.mjs** - Truncates issue descriptions that exceed `MAX_DESCRIPTION_CHARS`. Appends a truncation notice when cutting text to maintain transparency about data loss.

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
