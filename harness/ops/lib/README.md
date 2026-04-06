# ANQR Library

## 1. Directory Overview

This directory implements **ANQR Library** within the ANQR harness. Key immediate entries include `sonar-linear-sync.mjs`, `update-memory.mjs`, `logger.spec.ts`, `notify.mjs`. The current inventory is 5 non-README files and 4 subdirectories.

## 2. File Summaries

### Files

- **logger.mjs** - Facade module that re-exports public members from `./logger/index.mjs`.
- **logger.spec.ts** - Module that implements logger.spec.
- **notify.mjs** - Facade module that re-exports public members from `./notify/index.mjs`.
- **sonar-linear-sync.mjs** - Facade module that re-exports public members from `../integrations/sonar/sonar-linear-sync.mjs`.
- **update-memory.mjs** - Exports `updateMemory`, which implements update memory.

### Subdirectories

- **logger/** - Contains **ANQR Logger**; it contains 4 immediate files and has 0 child directories.
- **notify/** - Contains **ANQR Notify Library**; it contains 16 immediate files and has 0 child directories.
- **rag/** - Contains **RAG Pipeline - Retrieval Augmented Generation**; it contains 6 immediate files and has 6 child directories.
- **search/** - Contains **ANQR Search Library**; it acts mainly as a namespace over child directories and has 2 child directories.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include file-system access, Linear integration, Symphony integration, SonarQube integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
npx tsx ops/lib/logger.spec.ts
```

## 5. Dependencies

- **Node.js built-ins** - `node:fs/promises`, `node:path`
- **External packages/services referenced in immediate code** - `vitest`
- **Internal relative modules** - `../integrations/sonar/sonar-linear-sync.mjs`, `./logger.mjs`, `./logger/index.mjs`, `./notify/index.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
