# ANQR Symphony Worktree Pool

## 1. Directory Overview

This directory implements **ANQR Symphony Worktree Pool** within the ANQR harness. The immediate code includes a standalone runtime entry point alongside helper modules. The current inventory is 21 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **cleanup-worktree-pool.d.ts** - Exports `cleanupWorktreePool`, which implements cleanup worktree pool.
- **cleanup-worktree-pool.mjs** - Exports `cleanupWorktreePool`, which implements cleanup worktree pool.
- **create-worktree.d.ts** - Exports `createWorktree`, which creates worktree.
- **create-worktree.mjs** - Exports `createWorktree`, which creates worktree.
- **get-symphony-worktrees.d.ts** - Exports `getSymphonyWorktrees`, which gets symphony worktrees.
- **get-symphony-worktrees.mjs** - Exports `getSymphonyWorktrees`, which gets symphony worktrees.
- **index.d.ts** - Facade module that re-exports public members from `./create-worktree.d.ts`, `./remove-worktree.d.ts`, `./list-worktrees.d.ts`, `./get-symphony-worktrees.d.ts`, `./init-worktree-pool.d.ts`, `./cleanup-worktree-pool.d.ts`, and 2 more siblings.
- **index.mjs** - Facade module that re-exports public members from `./create-worktree.mjs`, `./remove-worktree.mjs`, `./list-worktrees.mjs`, `./get-symphony-worktrees.mjs`, `./init-worktree-pool.mjs`, `./cleanup-worktree-pool.mjs`, and 3 more siblings.
- **init-worktree-pool.d.ts** - Exports `initWorktreePool`, which implements init worktree pool.
- **init-worktree-pool.mjs** - Exports `initWorktreePool`, which implements init worktree pool.
- **list-worktrees.d.ts** - Exports `listWorktrees`, which lists worktrees.
- **list-worktrees.mjs** - Exports `listWorktrees`, which lists worktrees.
- **logger.mjs** - Shared logging helper module exporting `logDebug`, `logError`, `logInfo`, `logWarn`.
- **print-worktree-status.d.ts** - Exports `printWorktreeStatus`, which implements print worktree status.
- **print-worktree-status.mjs** - Exports `printWorktreeStatus`, which implements print worktree status.
- **remove-worktree.d.ts** - Exports `removeWorktree`, which implements remove worktree.
- **remove-worktree.mjs** - Exports `removeWorktree`, which implements remove worktree.
- **repair-worktrees.d.ts** - Exports `repairWorktrees`, which implements repair worktrees.
- **repair-worktrees.mjs** - Exports `repairWorktrees`, which implements repair worktrees.
- **reprovision-worktree.mjs** - Exports `reprovisionWorktree`, which implements reprovision worktree.
- **runtime.mjs** - Executable runtime entry point for this directory.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include subprocess execution, Symphony integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/orchestration/symphony-worktree-pool/runtime.mjs
npx tsx ops/orchestration/symphony-worktree-pool/cleanup-worktree-pool.d.ts
npx tsx ops/orchestration/symphony-worktree-pool/create-worktree.d.ts
npx tsx ops/orchestration/symphony-worktree-pool/get-symphony-worktrees.d.ts
npx tsx ops/orchestration/symphony-worktree-pool/index.d.ts
npx tsx ops/orchestration/symphony-worktree-pool/init-worktree-pool.d.ts
npx tsx ops/orchestration/symphony-worktree-pool/list-worktrees.d.ts
npx tsx ops/orchestration/symphony-worktree-pool/print-worktree-status.d.ts
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:fs`, `node:path`
- **Internal relative modules** - `../../core/worktree-config.mjs`, `../../lib/logger.mjs`, `./create-worktree.mjs`, `./get-symphony-worktrees.mjs`, `./list-worktrees.mjs`, `./logger.mjs`, `./remove-worktree.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
