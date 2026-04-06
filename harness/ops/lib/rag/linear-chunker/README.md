# Linear Issue Chunker

## 1. Directory Overview

This directory contains the Linear issue chunking module for the RAG (Retrieval-Augmented Generation) pipeline. It transforms Linear issues into structured text chunks suitable for embedding and semantic search. The chunking process extracts key metadata from issues (priority, state, team, project, assignee, labels, etc.) and formats them into a consistent, searchable document structure.

## 2. File Summaries

- **max-description-chars.mjs** - Configuration constant for maximum description length. Defaults to 1800 characters, configurable via `LINEAR_RAG_MAX_DESCRIPTION_CHARS` environment variable.

- **compact-whitespace.mjs** - Utility function that normalizes whitespace in text. Converts Windows-style line endings to Unix, collapses multiple consecutive newlines to double newlines, and trims leading/trailing whitespace.

- **truncate-description.mjs** - Truncates issue descriptions that exceed `MAX_DESCRIPTION_CHARS`. Appends a truncation notice when cutting text to maintain transparency about data loss.

- **count-lines.mjs** - Simple utility that counts the number of lines in a given text string. Returns 1 for null/undefined inputs.

- **as-comma-list.mjs** - Formats an array of values into a comma-separated string. Filters out falsy values and returns "None" for empty arrays.

- **chunk-linear-issue.mjs** - Core chunking function that transforms a single Linear issue object into a structured chunk. Extracts identifier, title, priority, state, team, project, assignee, creator, labels, timestamps, and URL. Returns a chunk object with `id`, `filePath`, `content`, `startLine`, `endLine`, `type`, and `metadata`.

- **chunk-linear-issues.mjs** - Batch processor that iterates through an array of issues and chunks each one using `chunkLinearIssue`. Returns an array of chunks.

- **logger.mjs** - Shared logger module for this directory using the project's centralized logger from `../../logger.mjs`. Exports `logDebug` function with the namespace "rag-linear-chunker".

- **index.mjs** - Facade index that re-exports all public API members: `MAX_DESCRIPTION_CHARS`, `compactWhitespace`, `truncateDescription`, `chunkLinearIssue`, and `chunkLinearIssues`.

## 3. Overall Directory Function

This directory serves as the Linear-specific chunking layer within the RAG pipeline. The chunking process:

1. Takes raw Linear issue objects (typically from GraphQL queries)
2. Validates each issue has required fields (`identifier`, `title`)
3. Extracts and normalizes metadata (priority, state, team, labels, etc.)
4. Truncates descriptions to maintain consistent chunk sizes for embedding
5. Formats content as a Markdown document with structured fields
6. Returns a standardized chunk object with content and metadata for vector storage

The module is typically imported by `build-index-linear.mjs` which fetches issues from Linear and processes them into chunks for embedding.

## 4. Usage Instructions

This module is primarily used through imports from other RAG pipeline components:

```javascript
import { chunkLinearIssue, chunkLinearIssues, MAX_DESCRIPTION_CHARS } from "./ops/lib/rag/linear-chunker/index.mjs";

// Chunk a single issue
const chunk = chunkLinearIssue(linearIssue);

// Chunk multiple issues
const chunks = chunkLinearIssues(linearIssues);

// Configure max description length
// Set environment variable: LINEAR_RAG_MAX_DESCRIPTION_CHARS=2000
```

The chunk output structure:

```javascript
{
  id: "linear-ABC-123",
  filePath: "linear://ABC-123",
  content: "...",
  startLine: 1,
  endLine: 15,
  type: "issue",
  metadata: {
    identifier: "ABC-123",
    title: "Issue title",
    state: "In Progress",
    priority: 1,
    team: "Engineering",
    project: "Website",
    assignee: "John Doe",
    creator: "Jane Smith",
    labels: ["bug", "urgent"],
    updatedAt: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-10T08:00:00Z",
    url: "https://linear.app/team/issue/ABC-123"
  }
}
```

## 5. Dependencies

### Internal Dependencies

- **../../logger.mjs** - Centralized logging utility used by logger.mjs
- **../../linear-client.mjs** - Not directly imported but issues originate from Linear API

### External Dependencies

- **Node.js** - ESM modules with .mjs extension
- **Linear API** - Source of issue data (GraphQL)

### Environment Variables

- **LINEAR_RAG_MAX_DESCRIPTION_CHARS** - Optional. Controls max description length (default: 1800)

## 6. Additional Comments

- **Validation**: Invalid issues (missing identifier or title) are skipped and logged via `logDebug`
- **Line Counting**: The `countLines` function is used to determine `startLine` and `endLine` for IDE integration compatibility
- **Chunk ID Format**: IDs follow the pattern `linear-{identifier}` for easy identification in vector stores
- **FilePath Format**: Uses `linear://{identifier}` URL-style path for cross-referencing with Linear
- **Description Truncation**: When truncated, appends `\n\n[truncated for embedding efficiency]` to inform downstream consumers
- **Batch Processing**: `chunkLinearIssues` uses a simple loop to allow streaming processing of large issue lists