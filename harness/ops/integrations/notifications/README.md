# ANQR Notifications

## 1. Directory Overview

This directory contains notification integration modules for the ANQR (Agentic Number Query Runner)
harness. It provides Discord-based notification capabilities through the OpenClaw gateway system,
enabling the harness to send messages, embeds, and streaming updates to Discord channels. The
directory follows a decomposition pattern where original monolithic files have been split into
sibling modules, with facade files (ending in `.mjs`) re-exporting from matching directories
containing `index.mjs` modules. It currently contains 2 files and 2 subdirectories.

## 2. File Summaries

### Files

- **openclaw-discord.mjs** - Auto-generated facade exporting from `./openclaw-discord/index.mjs`. Provides the main notification functionality for sending messages and embeds via the OpenClaw Discord gateway.
- **test-discord.mjs** - Auto-generated facade exporting from `./test-discord/index.mjs` and `./test-discord/runtime.mjs`. Provides testing utilities for Discord notification functionality.

### Child Directories

- **openclaw-discord/** - This directory contains Discord notification integration utilities for the ANQR (Agentic Number Query Runner) harness.
- **test-discord/** - This directory contains test utilities for the Discord notification integration within the ANQR (Agentic Number Query Runner) harness.

## 3. Overall Directory Function

In practice, child directories split the area into smaller focused modules. The README content below
is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
