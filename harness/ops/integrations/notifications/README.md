# ANQR Notifications

## 1. Directory Overview

This directory implements **ANQR Notifications** within the ANQR harness. It primarily acts as a namespace and aggregation layer for child directories, with only a small amount of immediate code. The current inventory is 2 non-README files and 2 subdirectories.

## 2. File Summaries

### Files

- **openclaw-discord.mjs** - Facade module that re-exports public members from `./openclaw-discord/index.mjs`.
- **test-discord.mjs** - Facade module that re-exports public members from `./test-discord/index.mjs`, `./test-discord/runtime.mjs`.

### Subdirectories

- **openclaw-discord/** - Contains **ANQR OpenClaw Discord Notifications**; it contains 15 immediate files and has 0 child directories.
- **test-discord/** - Contains **ANQR Test Discord Integration**; it contains 8 immediate files and has 0 child directories.

## 3. Overall Directory Function

Most of the behavior lives in child directories; the immediate directory mainly provides namespacing and lightweight aggregation. Verified immediate files in this directory include Discord integration, and OpenClaw integration.

## 4. Usage Instructions

This directory does not define an obvious standalone entry point. Its files are consumed by adjacent harness modules or by child directories.

## 5. Dependencies

- **Internal relative modules** - `./openclaw-discord/index.mjs`, `./test-discord/index.mjs`, `./test-discord/runtime.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
