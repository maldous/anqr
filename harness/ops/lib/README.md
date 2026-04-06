# ANQR Library

## 1. Directory Overview

This directory contains shared library utilities for the ANQR (Agentic Number Query Runner) harness. It provides fundamental infrastructure components including logging, notifications, RAG (Retrieval Augmented Generation) for semantic search, and hybrid search capabilities. These modules are used throughout the harness and can be imported by other operational scripts.

## 2. File Summaries

### Root Level Files

- **logger.mjs** - Auto-generated facade that re-exports from `./logger/index.mjs`. Provides flexible, configurable logging with support for log levels, dynamic adjustment via signals, safe serialization of complex objects, and caller location tracking.

- **logger.spec.ts** - Unit tests for logger.mjs. Tests default log level (INFO), environment variable configuration, signal handling (SIGUSR1/SIGUSR2), log level control, log formatting, and edge cases. Run with: `npx vitest run harness/ops/lib/logger.spec.ts`

- **notify.mjs** - Auto-generated facade that re-exports from `./notify/index.mjs`. Provides email notification capabilities with deduplication, rate limiting, and Linear issue integration using msmtp.

- **update-memory.mjs** - Shared utility for runtime event logging. Writes timestamped events to `reports/runtime-events.log` (gitignored) to avoid tainting git status during Symphony runner operations. Exports `updateMemory(note, cwd)` function.

- **sonar-linear-sync.mjs** - Compatibility shim that re-exports from `../integrations/sonar/sonar-linear-sync.mjs`.

### Subdirectories

- **logger/** - Logging utilities providing:
  - `LOG_LEVELS` constant (DEBUG=0, INFO=1, WARN=2, ERROR=3)
  - `getCallerInfo()` function for stack trace parsing
  - `createLogger(scriptName, options)` factory for creating loggers with env var control, signal-based level adjustment, and safe serialization

- **rag/** - RAG (Retrieval Augmented Generation) pipeline for semantic code search:
  - **chunker** - Splits code, docs, and config into semantic chunks
  - **embeddings** - Generates vector embeddings via Ollama API
  - **vector-store** - Persists and searches embeddings with cosine similarity
  - **build-index** - Full-repo index builder with noise filtering
  - **linear-chunker** - Specialized chunker for Linear issues
  - **build-index-linear** - Builds Linear issue index

- **notify/** - Notification library providing:
  - Configuration (recipient email, Linear workspace, deduplication window)
  - State management (load/save state, deduplication checking)
  - Formatting utilities (Linear issue URLs, issue line formatting)
  - `sendNotification()` function with severity levels (info, warn, critical)

- **search/** - Search functionality providing:
  - **linear-search** - Basic linear search for file content
  - **hybrid-search** - Combines BM25 keyword search with embedding-based semantic search using Reciprocal Rank Fusion (RRF)

## 3. Overall Directory Function

This directory serves as the foundational library layer for the ANQR harness. The modules provide essential infrastructure that other operational scripts depend on:

- **Logging** (`logger/`) - Consistent logging across all harness modules with configurable levels, runtime adjustment via signals, and safe handling of complex objects including Error chains and circular references.

- **Notifications** (`notify/`) - Email notification system with deduplication to prevent spam, rate limiting with 24-hour state retention, and Linear issue URL generation for integrated issue tracking.

- **Semantic Search** (`rag/`) - Local-first RAG pipeline backed by Ollama embeddings providing codebase search and context retrieval. Supports deterministic storage, atomic writes, sharded indexes for large codebases, and Context7 fallback.

- **Hybrid Search** (`search/`) - Combines BM25 keyword search with embedding-based semantic search using Reciprocal Rank Fusion. Features graceful degradation when optional components are unavailable.

- **Runtime Events** (`update-memory.mjs`) - Appends runtime events to gitignored log file during Symphony operations, keeping human-curated MEMORY.md separate from automated event tracking.

## 4. Usage Instructions

### Logger

```javascript
import { createLogger } from "./ops/lib/logger.mjs";

const logger = createLogger("my-script");
logger.logInfo("Informational message");
logger.logDebug("Debug info", { key: "value" });
logger.setLogLevel("DEBUG");
```

```bash
# Environment variable control
MY_SCRIPT_LOG_LEVEL=DEBUG node my-script.mjs

# Signal-based control while running
kill -SIGUSR2 $pid  # More verbose
kill -SIGUSR1 $pid  # Less verbose
```

### Notifications

```javascript
import { sendNotification } from "./ops/lib/notify.mjs";

sendNotification({
  subject: "Queue processing complete",
  body: "Processed 25 issues",
  severity: "warn"
});
```

### RAG Index Building

```bash
node --max-old-space-size=8192 harness/ops/lib/rag/build-index.mjs
```

### Hybrid Search

```javascript
import { hybridSearch } from "./ops/lib/search/hybrid-search.mjs";

const results = await hybridSearch("authentication middleware", { topK: 10 });
```

### Runtime Events

```javascript
import { updateMemory } from "./ops/lib/update-memory.mjs";

await updateMemory("Issue ANQR-123 processing started");
```

## 5. Dependencies

### Runtime Dependencies

- **Node.js** - ESM modules with .mjs extension
- **minisearch** - BM25 full-text search library
- **msmtp** - Mail transfer agent for notifications

### Internal Dependencies

- **../logger.mjs** - Used by notify, rag, and search modules
- **../integrations/sonar/sonar-linear-sync.mjs** - Re-exported by sonar-linear-sync.mjs

### Environment Variables

- **LOG_LEVEL** / **{SCRIPT_NAME}_LOG_LEVEL** - Logger configuration
- **ANQR_NOTIFY_EMAIL** - Notification recipient (default: matthew.aldous@gmail.com)
- **LINEAR_WORKSPACE** - Linear workspace identifier (default: "anqr")
- **OLLAMA_API_BASE** - Ollama server URL for embeddings (default: http://127.0.0.1:11434)
- **CONTEXT7_API_KEY** - Optional Context7 cloud fallback for RAG

## 6. Additional Comments

- **Fail-Safe Design**: The notify module returns `{ sent: false, reason: "..." }` instead of throwing when msmtp is unavailable. Logger handles serialization errors gracefully.

- **Graceful Degradation**: The search module automatically falls back to BM25-only mode when embeddings are unavailable, and basic substring matching when neither returns results.

- **Deterministic Storage**: RAG pipeline uses repo-relative storage paths and atomic writes for reliability during unattended nightly rebuilds.

- **State Persistence**: Notification deduplication state persists across process restarts via `reports/notify/state.json`.

- **Signal Handling**: Logger supports SIGUSR1/SIGUSR2 for runtime log level adjustment without code changes - a common Unix pattern for operational flexibility.