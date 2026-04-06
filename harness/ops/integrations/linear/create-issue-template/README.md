# ANQR Linear Issue Template

## 1. Directory Overview

This directory implements **ANQR Linear Issue Template** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 6 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **customize-issue.mjs** - Exports `customizeIssue`, which implements customize issue.
- **index.mjs** - Facade module that re-exports public members from `./issue-template.mjs`, `./customize-issue.mjs`, `./validate-issue.mjs`, `./main.mjs`.
- **issue-template.mjs** - Exports `issueTemplate`, which implements issue template.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **validate-issue.mjs** - Exports `validateIssue`, which validates issue.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include network/API integration, Linear integration, and Discord integration.

## 4. Usage Instructions

```bash
node ops/integrations/linear/create-issue-template/runtime.mjs
```

## 5. Dependencies

- **Internal relative modules** - `../linear-client.mjs`, `../validate-issue.mjs`, `./customize-issue.mjs`, `./index.mjs`, `./issue-template.mjs`, `./validate-issue.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
