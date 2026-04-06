# ANQR Core

## 1. Directory Overview

This directory implements **ANQR Core** within the ANQR harness. Key immediate entries include `symphony-state.spec.ts`, `symphony-config.spec.ts`, `bridge-result.spec.ts`, `symphony-config.mjs`. The current inventory is 10 non-README files and 6 subdirectories.

## 2. File Summaries

### Files

- **bridge-result.mjs** - Facade module that re-exports public members from `./bridge-result/index.mjs`.
- **bridge-result.spec.ts** - Module that implements bridge result.spec.
- **discord-source.mjs** - Facade module that re-exports public members from `./discord-source/index.mjs`.
- **symphony-config.mjs** - Module that implements symphony config.
- **symphony-config.spec.ts** - Module that implements symphony config.spec.
- **symphony-state.mjs** - Facade module that re-exports public members from `./symphony-state/index.mjs`.
- **symphony-state.spec.ts** - Module that implements symphony state.spec.
- **symphony-validation.mjs** - Facade module that re-exports public members from `./symphony-validation/index.mjs`.
- **worktree-config.mjs** - Facade module that re-exports public members from `./worktree-config/index.mjs`.
- **worktree-health.mjs** - Facade module that re-exports public members from `./worktree-health/index.mjs`, `./worktree-health/runtime.mjs`.

### Subdirectories

- **bridge-result/** - Contains **Bridge Result Normalization**; it contains 6 immediate files and has 0 child directories.
- **discord-source/** - Contains **Discord Source Module**; it contains 4 immediate files and has 0 child directories.
- **symphony-state/** - Contains **ANQR Symphony State**; it contains 62 immediate files and has 0 child directories.
- **symphony-validation/** - Contains **ANQR Symphony Validation**; it contains 15 immediate files and has 0 child directories.
- **worktree-config/** - Contains **Worktree Configuration**; it contains 11 immediate files and has 0 child directories.
- **worktree-health/** - Contains **ANQR Worktree Health**; it contains 10 immediate files and has 0 child directories.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include network/API integration, timer, scheduling, cooldown, or watchdog behavior, Linear integration, Discord integration, Symphony integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
npx tsx ops/core/bridge-result.spec.ts
npx tsx ops/core/symphony-config.spec.ts
npx tsx ops/core/symphony-state.spec.ts
```

## 5. Dependencies

- **Node.js built-ins** - `node:fs`, `node:path`
- **External packages/services referenced in immediate code** - `vitest`
- **Internal relative modules** - `../linear-client.mjs`, `./bridge-result.mjs`, `./bridge-result/index.mjs`, `./discord-source/index.mjs`, `./symphony-state/index.mjs`, `./symphony-validation/index.mjs`, `./worktree-config/index.mjs`, `./worktree-health/index.mjs`, `./worktree-health/runtime.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
