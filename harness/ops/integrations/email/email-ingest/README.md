# Email Ingest

## Purpose

Directory for runtime service bootstrap or environment support; immediate files include `allowed-senders.mjs`, `dirname.mjs`, `dry-run.mjs`, `ensure-dir.mjs`, and others.

## Contents

- 23 immediate files
- 0 child directories

## Key Files

- `allowed-senders.mjs` - Exports `ALLOWED_SENDERS`, a shared constant or state value used by sibling modules.
- `dirname.mjs` - Exports `__dirname`, a shared constant or state value used by sibling modules.
- `dry-run.mjs` - Exports `DRY_RUN`, a shared constant or state value used by sibling modules.
- `ensure-dir.mjs` - Exports `ensureDir`, the main helper defined in this file.
- `extract-text-content.mjs` - Exports `extractTextContent`, the main helper defined in this file.
- `find-existing-by-external-key.mjs` - Exports `findExistingByExternalKey`, the main helper defined in this file.
- `get-message-content.mjs` - Exports `getMessageContent`, the main helper defined in this file.
- `human-user-name.mjs` - Exports `HUMAN_USER_NAME`, a shared constant or state value used by sibling modules.
- `index-mail.mjs` - Exports `indexMail`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `ingest-email.mjs` - Exports `INGEST_EMAIL`, a shared constant or state value used by sibling modules.
- `logger.mjs` - Re-export facade that assembles the public surface for this directory.
- `lookup-human-assignee.mjs` - Exports `lookupHumanAssignee`, the main helper defined in this file.
- `main.mjs` - Exports `main`, the main helper defined in this file.
- `notmuch-query.mjs` - Exports `NOTMUCH_QUERY`, a shared constant or state value used by sibling modules.
- `project-root.mjs` - Exports `PROJECT_ROOT`, a shared constant or state value used by sibling modules.
- `reports-dir.mjs` - Exports `REPORTS_DIR`, a shared constant or state value used by sibling modules.
- `run.mjs` - Exports `run`, the main helper defined in this file.
- `runtime.mjs` - Executable runtime bootstrap for this directory.
- `search-unprocessed.mjs` - Exports `searchUnprocessed`, the main helper defined in this file.
- `sync-mail.mjs` - Exports `syncMail`, the main helper defined in this file.
- `tag-message.mjs` - Exports `tagMessage`, the main helper defined in this file.
- `write-report.mjs` - Exports `writeReport`, the main helper defined in this file.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 23 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
