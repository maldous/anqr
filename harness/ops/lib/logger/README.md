# ANQR Logger

## 1. Directory Overview

This directory contains the logging utilities for the ANQR (Agentic Number Query Runner) harness. It
provides a flexible, configurable logging system with support for log levels, dynamic adjustment via
signals, safe serialization of complex objects (including Error objects with circular references),
and caller location tracking. It currently contains 4 files and 0 subdirectories.

## 2. File Summaries

### Files

- **create-logger.mjs** - The main logger factory module. Exports `createLogger(scriptName, options)` which returns a logger instance with the following API:
- **get-caller-info.mjs** - Exports the `getCallerInfo()` function that extracts caller location from the JavaScript stack trace. It parses the stack to find the filename and line number of the actual caller (skipping internal logger frames). Returns `{ filename: string, lineNumber: string }`. Used by the logger to add location context to log entries.
- **index.mjs** - Generated facade index that re-exports all public API members: - `LOG_LEVELS` from `./log-levels.mjs` - `getCallerInfo` from `./get-caller-info.mjs` - `createLogger` from `./create-logger.mjs`
- **log-levels.mjs** - Exports the `LOG_LEVELS` constant object defining the log severity hierarchy: - `DEBUG` = 0 (most verbose) - `INFO` = 1 - `WARN` = 2 - `ERROR` = 3 (least verbose, only errors shown)

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./index.mjs";
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory exposes a public API through `index.mjs`.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
