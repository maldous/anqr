# ANQR Discord Runtime

## 1. Directory Overview

This directory contains the Discord runtime integration for the ANQR (Agentic Number Query Runner)
harness. It manages the OpenClaw Discord gateway process using a singleton pattern that ensures only
one gateway process runs across multiple worktree runners through file-based locking with a
follower/owner pattern. It currently contains 1 file and 1 subdirectory.

## 2. File Summaries

### Files

- **openclaw-gateway-singleton.mjs** - Auto-generated facade that re-exports from `./openclaw-gateway-singleton/index.mjs` and `./openclaw-gateway-singleton/runtime.mjs`. This decomposition pattern maintains backwards compatibility by providing a single entry point that delegates to the sibling modules. Provides the entry point for the OpenClaw gateway singleton wrapper.

### Child Directories

- **openclaw-gateway-singleton/** - This directory implements a singleton pattern for managing the OpenClaw Discord gateway process across multiple worktree runners.

## 3. Overall Directory Function

In practice, child directories split the area into smaller focused modules. The README content below
is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
