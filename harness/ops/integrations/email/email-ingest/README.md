# ANQR Email Ingest

## 1. Directory Overview

This directory contains the email ingestion module for the ANQR (Agentic Number Query Runner)
harness. It provides automated email-to-issue processing by monitoring a dedicated inbox, parsing
incoming emails, and creating Linear issues for authorized sender communications. The module
integrates with notmuch for email indexing and mbsync for mail synchronization, providing a bridge
between email workflows and the issue tracking system. It currently contains 23 files and 0
subdirectories.

## 2. File Summaries

### Files

- **allowed-senders.mjs** - Exports ALLOWED_SENDERS array containing whitelisted email addresses: ["matthew.aldous@gmail.com", "alexander.emmalyn.thomas@gmail.com"]. Only these senders can trigger issue creation.
- **dirname.mjs** - ESM polyfill for \_\_dirname using import.meta.url and fileURLToPath.
- **dry-run.mjs** - Exports DRY_RUN boolean flag set when --dry-run appears in command line arguments. When true, skips actual Linear API operations and issue creation.
- **ensure-dir.mjs** - Creates directory recursively if it doesn't exist using fs.mkdirSync.
- **extract-text-content.mjs** - Recursively extracts text content from email body parts. Prioritizes text/plain content, falls back to text/html by stripping HTML tags. Handles nested multipart MIME structures by traversing the content tree.
- **find-existing-by-external-key.mjs** - Searches for open Linear issues containing an external key marker in the description. Constructs marker as `<!-- external-key:${externalKey} -->` and uses findOpenIssuesByDescriptionFragment. Returns first match or null.
- **get-message-content.mjs** - Retrieves full message content from notmuch using JSON format. Parses the nested structure (data[0]["0"]["0"]) to extract message metadata including id, subject, from, to, date, timestamp, body, and tags. Returns null on parse failure.
- **human-user-name.mjs** - Exports constant HUMAN_USER_NAME = "Matthew Aldous". Used for assignee lookup in Linear.
- **index-mail.mjs** - Runs `notmuch new` to index new mail messages. Returns {ok: false, reason: "notmuch not installed"} if notmuch is unavailable, otherwise executes with 30 second timeout.
- **index.mjs** - Facade index that re-exports all public API members including constants (INGEST_EMAIL, HUMAN_USER_NAME, ALLOWED_SENDERS, NOTMUCH_QUERY), utilities (run, ensureDir, syncMail, indexMail, searchUnprocessed), and core functions (getMessageContent, extractTextContent, tagMessage, lookupHumanAssignee, findExistingByExternalKey, main, writeReport).
- **ingest-email.mjs** - Exports INGEST_EMAIL constant from ANQR_INGEST_EMAIL environment variable (defaults to "email@anqr.link"). Defines the inbox address to monitor for incoming emails.
- **logger.mjs** - Shared logger module importing createLogger from lib/logger.mjs. Exports logError for error reporting.
- **lookup-human-assignee.mjs** - Queries Linear API to find the active team member matching HUMAN_USER_NAME ("Matthew Aldous"). Returns the member's id or null if not found. Used to assign created issues to the human user.
- **main.mjs** - Main orchestration module that coordinates the entire email ingestion workflow. Executes mail sync, indexing, processes unprocessed messages, creates Linear issues, and writes summary reports. Handles sender validation, duplicate detection via external keys, and dispatches notifications for created/rejected emails.
- **notmuch-query.mjs** - Exports NOTMUCH_QUERY combining inbox, sender/recipient filtering, and processed state: `(from:${INGEST_EMAIL} OR to:${INGEST_EMAIL}) AND tag:inbox AND NOT tag:anqr-processed AND NOT tag:anqr-rejected`.
- **project-root.mjs** - Exports PROJECT_ROOT computed from \_\_dirname by traversing up 4 directory levels. Resolves to the harness project root.
- **reports-dir.mjs** - Exports REPORTS_DIR path pointing to {PROJECT_ROOT}/reports/email-ingest. Where ingestion summary reports are written.
- **run.mjs** - Helper function wrapping spawnSync for executing shell commands. Provides default encoding (utf-8), timeout (60s), and stdio (pipe) settings. Accepts overrides via opts parameter.
- **runtime.mjs** - Generated runtime carry-forward that serves as the CLI entry point. Imports and executes the main function with error handling and failure reporting to JSON.
- **search-unprocessed.mjs** - Queries notmuch for unprocessed messages matching the NOTMUCH_QUERY filter. Returns array of message IDs (one per line) for messages that are in inbox but not tagged anqr-processed or anqr-rejected.
- **sync-mail.mjs** - Synchronizes mail using the mbsync command against the "gmail" configuration. Returns {ok: false, reason: "mbsync not installed"} if unavailable, handles lock conflicts ("lock held (another sync running)"), and applies 120 second timeout.
- **tag-message.mjs** - Tags or untags notmuch messages using the `notmuch tag` command. Accepts arrays of tags to add (prefixed with +) and remove (prefixed with -).
- **write-report.mjs** - Writes ingestion summary to {REPORTS_DIR}/latest.json with pretty printing. Called at end of main() and on fatal errors.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point, `main.mjs` coordinates the main execution
path, `runtime.mjs` provides a direct execution path. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```bash
node ops/integrations/email/email-ingest/runtime.mjs
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory follows the common harness pattern where `index.mjs` exposes the public API and `runtime.mjs` provides direct execution.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
