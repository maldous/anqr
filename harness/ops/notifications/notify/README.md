# ANQR Notify

## 1. Directory Overview

This directory implements **ANQR Notify** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 10 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **dirname.mjs** - Exports `__dirname`, which implements dirname.
- **format-email-body.mjs** - Exports `formatEmailBody`, which formats email body.
- **format-stdout.mjs** - Exports `formatStdout`, which formats stdout.
- **index.mjs** - Facade module that re-exports public members from `./dirname.mjs`, `./root.mjs`, `./report-path.mjs`, `./parse-args.mjs`, `./format-stdout.mjs`, `./format-email-body.mjs`, and 1 more siblings.
- **logger.mjs** - Shared logging helper module exporting `logError`, `logInfo`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **parse-args.mjs** - Exports `parseArgs`, which parses args.
- **report-path.mjs** - Exports `REPORT_PATH`, a shared constant used by sibling modules.
- **root.mjs** - Exports `ROOT`, a shared constant used by sibling modules.
- **runtime.mjs** - Executable runtime entry point. Imports `main()` from `./index.mjs` and invokes it.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory use file-system access. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/notifications/notify/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:fs`, `node:path`, `node:url`
- **Internal relative modules** - `../../lib/logger.mjs`, `../../lib/notify.mjs`, `./dirname.mjs`, `./format-email-body.mjs`, `./format-stdout.mjs`, `./index.mjs`, `./logger.mjs`, `./parse-args.mjs`, `./report-path.mjs`, `./root.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
