# ANQR Library

## 1. Directory Overview

This directory contains shared library utilities for the ANQR (Agentic Number Query Runner) harness.
It provides fundamental infrastructure components including logging, notifications, RAG (Retrieval
Augmented Generation) for semantic search, and hybrid search capabilities. These modules are used
throughout the harness and can be imported by other operational scripts. It currently contains 5
files and 4 subdirectories.

## 2. File Summaries

### Files

- **logger.mjs** - Auto-generated facade that re-exports from `./logger/index.mjs`. Provides flexible, configurable logging with support for log levels, dynamic adjustment via signals, safe serialization of complex objects, and caller location tracking.
- **logger.spec.ts** - Unit tests for logger.mjs. Tests default log level (INFO), environment variable configuration, signal handling (SIGUSR1/SIGUSR2), log level control, log formatting, and edge cases. Run with: `npx vitest run harness/ops/lib/logger.spec.ts`
- **notify.mjs** - Auto-generated facade that re-exports from `./notify/index.mjs`. Provides email notification capabilities with deduplication, rate limiting, and Linear issue integration using msmtp.
- **sonar-linear-sync.mjs** - Compatibility shim that re-exports from `../integrations/sonar/sonar-linear-sync.mjs`.
- **update-memory.mjs** - Shared utility for runtime event logging. Writes timestamped events to `reports/runtime-events.log` (gitignored) to avoid tainting git status during Symphony runner operations. Exports `updateMemory(note, cwd)` function.

### Child Directories

- **logger/** - This directory contains the logging utilities for the ANQR (Agentic Number Query Runner) harness.
- **notify/** - This directory contains the notification library for the ANQR (Agentic Number Query Runner) harness.
- **rag/** - This directory contains a local-first RAG (Retrieval Augmented Generation) pipeline for ANQR codebase search and context retrieval, backed by Ollama embeddings on the same machine that serves Symphony agents.
- **search/** - This directory contains search functionality for the ANQR (Agentic Number Query Runner) harness.

## 3. Overall Directory Function

In practice, child directories split the area into smaller focused modules. The README content below
is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.
- **Imported packages** - Representative external dependencies referenced here include `vitest`.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
