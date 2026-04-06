# Linear Issue Chunker

## 1. Directory Overview

This directory implements **Linear Issue Chunker** within the ANQR harness. Key immediate entries include `index.mjs`, `chunk-linear-issue.mjs`, `chunk-linear-issues.mjs`, `as-comma-list.mjs`. The current inventory is 9 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **as-comma-list.mjs** - Exports `asCommaList`, which implements as comma list.
- **chunk-linear-issue.mjs** - Exports `chunkLinearIssue`, which implements chunk linear issue.
- **chunk-linear-issues.mjs** - Exports `chunkLinearIssues`, which implements chunk linear issues.
- **compact-whitespace.mjs** - Exports `compactWhitespace`, which implements compact whitespace.
- **count-lines.mjs** - Exports `countLines`, which implements count lines.
- **index.mjs** - Facade module that re-exports public members from `./max-description-chars.mjs`, `./compact-whitespace.mjs`, `./truncate-description.mjs`, `./chunk-linear-issue.mjs`, `./chunk-linear-issues.mjs`.
- **logger.mjs** - Shared logging helper module exporting `logDebug`.
- **max-description-chars.mjs** - Exports `MAX_DESCRIPTION_CHARS`, a shared constant used by sibling modules.
- **truncate-description.mjs** - Exports `truncateDescription`, which implements truncate description.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory use Linear integration. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/lib/rag/linear-chunker/index.mjs";
```

## 5. Dependencies

- **Internal relative modules** - `../../logger.mjs`, `./as-comma-list.mjs`, `./chunk-linear-issue.mjs`, `./compact-whitespace.mjs`, `./count-lines.mjs`, `./logger.mjs`, `./max-description-chars.mjs`, `./truncate-description.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
