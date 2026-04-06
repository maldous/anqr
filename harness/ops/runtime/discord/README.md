# ANQR Discord Runtime

## 1. Directory Overview

This directory implements **ANQR Discord Runtime** within the ANQR harness. It primarily acts as a namespace and aggregation layer for child directories, with only a small amount of immediate code. The current inventory is 1 non-README files and 1 subdirectories.

## 2. File Summaries

### Files

- **openclaw-gateway-singleton.mjs** - Facade module that re-exports public members from `./openclaw-gateway-singleton/index.mjs`, `./openclaw-gateway-singleton/runtime.mjs`.

### Subdirectories

- **openclaw-gateway-singleton/** - Contains **OpenClaw Gateway Singleton**; it contains a runtime-oriented module set with helper files, `main.mjs`, and `runtime.mjs` and has 0 child directories.

## 3. Overall Directory Function

Most of the behavior lives in child directories; the immediate directory mainly provides namespacing and lightweight aggregation. Verified immediate files in this directory include Discord integration, and OpenClaw integration.

## 4. Usage Instructions

This directory does not define an obvious standalone entry point. Its files are consumed by adjacent harness modules or by child directories.

## 5. Dependencies

- **Internal relative modules** - `./openclaw-gateway-singleton/index.mjs`, `./openclaw-gateway-singleton/runtime.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
