# Export Linear All

## 1. Directory Overview

This directory implements **export-linear-all** within the ANQR harness. The immediate code is centered on `main.mjs`, with `index.mjs` exposing the reusable surface for callers. The current inventory is 3 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **fetch-all-issues.mjs** - Exports `fetchAllIssues`, which fetches all issues.
- **index.mjs** - Facade module that re-exports public members from `./fetch-all-issues.mjs`, `./main.mjs`.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.

## 3. Overall Directory Function

The directory's behavior is coordinated by `main.mjs`, with the surrounding files supplying parsing, validation, formatting, state, or integration helpers. Verified immediate files in this directory include file-system access, and Linear integration.

## 4. Usage Instructions

```bash
node export-linear-all/main.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:fs/promises`
- **Internal relative modules** - `../ops/integrations/linear/linear-client.mjs`, `./fetch-all-issues.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
