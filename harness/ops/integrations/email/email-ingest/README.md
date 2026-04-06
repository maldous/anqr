# ANQR Email Ingest

## 1. Directory Overview

This directory implements **ANQR Email Ingest** within the ANQR harness. The immediate code follows the common harness pattern of helper modules plus `main.mjs` orchestration, `index.mjs` facade exports, and `runtime.mjs` bootstrap execution. The current inventory is 23 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **allowed-senders.mjs** - Exports `ALLOWED_SENDERS`, a shared constant used by sibling modules.
- **dirname.mjs** - Exports `__dirname`, which implements dirname.
- **dry-run.mjs** - Exports `DRY_RUN`, a shared constant used by sibling modules.
- **ensure-dir.mjs** - Exports `ensureDir`, which ensures dir.
- **extract-text-content.mjs** - Exports `extractTextContent`, which implements extract text content.
- **find-existing-by-external-key.mjs** - Exports `findExistingByExternalKey`, which finds existing by external key.
- **get-message-content.mjs** - Exports `getMessageContent`, which gets message content.
- **human-user-name.mjs** - Exports `HUMAN_USER_NAME`, a shared constant used by sibling modules.
- **index-mail.mjs** - Exports `indexMail`, which re-exports the directory's public modules.
- **index.mjs** - Facade module that re-exports public members from `./dirname.mjs`, `./project-root.mjs`, `./reports-dir.mjs`, `./ingest-email.mjs`, `./human-user-name.mjs`, `./allowed-senders.mjs`, and 14 more siblings.
- **ingest-email.mjs** - Exports `INGEST_EMAIL`, a shared constant used by sibling modules.
- **logger.mjs** - Shared logging helper module exporting `logError`.
- **lookup-human-assignee.mjs** - Exports `lookupHumanAssignee`, which implements lookup human assignee.
- **main.mjs** - Primary orchestration module for the directory. It coordinates the immediate helper modules.
- **notmuch-query.mjs** - Exports `NOTMUCH_QUERY`, a shared constant used by sibling modules.
- **project-root.mjs** - Exports `PROJECT_ROOT`, a shared constant used by sibling modules.
- **reports-dir.mjs** - Exports `REPORTS_DIR`, a shared constant used by sibling modules.
- **run.mjs** - Exports `run`, which implements run.
- **runtime.mjs** - Executable runtime entry point for this directory.
- **search-unprocessed.mjs** - Exports `searchUnprocessed`, which implements search unprocessed.
- **sync-mail.mjs** - Exports `syncMail`, which implements sync mail.
- **tag-message.mjs** - Exports `tagMessage`, which implements tag message.
- **write-report.mjs** - Exports `writeReport`, which writes report.

## 3. Overall Directory Function

The directory is structured as a reusable module set plus an executable entry path: helper files implement the detail work, `main.mjs` coordinates it, `index.mjs` re-exports the public API, and `runtime.mjs` executes the workflow. Verified immediate files in this directory include file-system access, subprocess execution, and Symphony integration. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```bash
node ops/integrations/email/email-ingest/runtime.mjs
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:fs`, `node:path`, `node:url`
- **Internal relative modules** - `../../../lib/logger.mjs`, `../../../lib/notify.mjs`, `../../../linear-client.mjs`, `./allowed-senders.mjs`, `./dirname.mjs`, `./dry-run.mjs`, `./ensure-dir.mjs`, `./extract-text-content.mjs`, `./find-existing-by-external-key.mjs`, `./get-message-content.mjs`, `./human-user-name.mjs`, `./index-mail.mjs`

## 6. Additional Comments

- This README was regenerated from the verified file inventory and current code contents in this directory.
