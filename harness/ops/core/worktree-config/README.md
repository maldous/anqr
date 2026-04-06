# Worktree Configuration

## 1. Directory Overview

This directory implements **Worktree Configuration** within the ANQR harness. Key immediate entries include `index.mjs`, `get-worktree-path.mjs`, `get-worktree-branch.mjs`, `is-symphony-worktree.mjs`. The current inventory is 11 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **dirname.mjs** - Exports `__dirname`, which implements dirname.
- **discord-worktree-ids.mjs** - Exports `DISCORD_WORKTREE_IDS`, a shared constant used by sibling modules.
- **get-worktree-branch.mjs** - Exports `getWorktreeBranch`, which gets worktree branch.
- **get-worktree-path.mjs** - Exports `getWorktreePath`, which gets worktree path.
- **index.mjs** - Facade module that re-exports public members from `./dirname.mjs`, `./project-root.mjs`, `./worktree-prefix.mjs`, `./worktree-branch-prefix.mjs`, `./get-worktree-path.mjs`, `./get-worktree-branch.mjs`, and 4 more siblings.
- **is-discord-worktree.mjs** - Exports `isDiscordWorktree`, which checks whether discord worktree.
- **is-symphony-worktree.mjs** - Exports `isSymphonyWorktree`, which checks whether symphony worktree.
- **project-root.mjs** - Exports `PROJECT_ROOT`, a shared constant used by sibling modules.
- **symphony-worktree-ids.mjs** - Exports `SYMPHONY_WORKTREE_IDS`, a shared constant used by sibling modules.
- **worktree-branch-prefix.mjs** - Exports `WORKTREE_BRANCH_PREFIX`, a shared constant used by sibling modules.
- **worktree-prefix.mjs** - Exports `WORKTREE_PREFIX`, a shared constant used by sibling modules.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include Discord integration, Symphony integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/core/worktree-config/index.mjs";
```

## 5. Dependencies

- **Node.js built-ins** - `node:path`, `node:url`
- **Internal relative modules** - `./dirname.mjs`, `./discord-worktree-ids.mjs`, `./project-root.mjs`, `./symphony-worktree-ids.mjs`, `./worktree-branch-prefix.mjs`, `./worktree-prefix.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
