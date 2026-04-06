# ANQR Runtime

## 1. Directory Overview

This directory implements **ANQR Runtime** within the ANQR harness. It primarily acts as a namespace and aggregation layer for child directories, with only a small amount of immediate code. The current inventory is 0 non-README files and 5 subdirectories.

## 2. File Summaries

### Subdirectories

- **discord/** - Contains **ANQR Discord Runtime**; it acts mainly as a namespace over child directories and has 1 child directories.
- **mcp/** - Contains **ANQR MCP Runtime**; it acts mainly as a namespace over child directories and has 2 child directories.
- **openclaw-config/** - Contains **ANQR OpenClaw Configuration**; it holds configuration data and has 6 child directories.
- **symphony/** - Contains **ANQR Symphony Runtime**; it contains 3 immediate files and has 2 child directories.
- **watchdog/** - Contains **ANQR Watchdog**; it acts mainly as a namespace over child directories and has 1 child directories.

## 3. Overall Directory Function

Most of the behavior lives in child directories; the immediate directory mainly provides namespacing and lightweight aggregation.

## 4. Usage Instructions

This directory does not define an obvious standalone entry point. Its files are consumed by adjacent harness modules or by child directories.

## 5. Dependencies

- No explicit code-level dependency imports were found in the immediate non-README files.

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
