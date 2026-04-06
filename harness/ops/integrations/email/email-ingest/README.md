# ANQR Email Ingest

## 1. Directory Overview

This directory contains the email ingestion module for the ANQR (Agentic Number Query Runner) harness. It provides automated email-to-issue processing by monitoring a dedicated inbox, parsing incoming emails, and creating Linear issues for authorized sender communications. The module integrates with notmuch for email indexing and mbsync for mail synchronization, providing a bridge between email workflows and the issue tracking system.

## 2. File Summaries

### Core Entry Points

- **main.mjs** - Main orchestration module that coordinates the entire email ingestion workflow. Executes mail sync, indexing, processes unprocessed messages, creates Linear issues, and writes summary reports. Handles sender validation, duplicate detection via external keys, and dispatches notifications for created/rejected emails.

- **runtime.mjs** - Generated runtime carry-forward that serves as the CLI entry point. Imports and executes the main function with error handling and failure reporting to JSON.

- **index.mjs** - Facade index that re-exports all public API members including constants (INGEST_EMAIL, HUMAN_USER_NAME, ALLOWED_SENDERS, NOTMUCH_QUERY), utilities (run, ensureDir, syncMail, indexMail, searchUnprocessed), and core functions (getMessageContent, extractTextContent, tagMessage, lookupHumanAssignee, findExistingByExternalKey, main, writeReport).

### Email Processing

- **get-message-content.mjs** - Retrieves full message content from notmuch using JSON format. Parses the nested structure (data[0]["0"]["0"]) to extract message metadata including id, subject, from, to, date, timestamp, body, and tags. Returns null on parse failure.

- **extract-text-content.mjs** - Recursively extracts text content from email body parts. Prioritizes text/plain content, falls back to text/html by stripping HTML tags. Handles nested multipart MIME structures by traversing the content tree.

- **search-unprocessed.mjs** - Queries notmuch for unprocessed messages matching the NOTMUCH_QUERY filter. Returns array of message IDs (one per line) for messages that are in inbox but not tagged anqr-processed or anqr-rejected.

- **tag-message.mjs** - Tags or untags notmuch messages using the `notmuch tag` command. Accepts arrays of tags to add (prefixed with +) and remove (prefixed with -).

- **index-mail.mjs** - Runs `notmuch new` to index new mail messages. Returns {ok: false, reason: "notmuch not installed"} if notmuch is unavailable, otherwise executes with 30 second timeout.

### Mail Synchronization

- **sync-mail.mjs** - Synchronizes mail using the mbsync command against the "gmail" configuration. Returns {ok: false, reason: "mbsync not installed"} if unavailable, handles lock conflicts ("lock held (another sync running)"), and applies 120 second timeout.

- **run.mjs** - Helper function wrapping spawnSync for executing shell commands. Provides default encoding (utf-8), timeout (60s), and stdio (pipe) settings. Accepts overrides via opts parameter.

### Linear Integration

- **lookup-human-assignee.mjs** - Queries Linear API to find the active team member matching HUMAN_USER_NAME ("Matthew Aldous"). Returns the member's id or null if not found. Used to assign created issues to the human user.

- **find-existing-by-external-key.mjs** - Searches for open Linear issues containing an external key marker in the description. Constructs marker as `<!-- external-key:${externalKey} -->` and uses findOpenIssuesByDescriptionFragment. Returns first match or null.

- **allowed-senders.mjs** - Exports ALLOWED_SENDERS array containing whitelisted email addresses: ["matthew.aldous@gmail.com", "alexander.emmalyn.thomas@gmail.com"]. Only these senders can trigger issue creation.

### Utilities and Constants

- **ingest-email.mjs** - Exports INGEST_EMAIL constant from ANQR_INGEST_EMAIL environment variable (defaults to "email@anqr.link"). Defines the inbox address to monitor for incoming emails.

- **notmuch-query.mjs** - Exports NOTMUCH_QUERY combining inbox, sender/recipient filtering, and processed state: `(from:${INGEST_EMAIL} OR to:${INGEST_EMAIL}) AND tag:inbox AND NOT tag:anqr-processed AND NOT tag:anqr-rejected`.

- **human-user-name.mjs** - Exports constant HUMAN_USER_NAME = "Matthew Aldous". Used for assignee lookup in Linear.

- **dry-run.mjs** - Exports DRY_RUN boolean flag set when --dry-run appears in command line arguments. When true, skips actual Linear API operations and issue creation.

- **reports-dir.mjs** - Exports REPORTS_DIR path pointing to {PROJECT_ROOT}/reports/email-ingest. Where ingestion summary reports are written.

- **project-root.mjs** - Exports PROJECT_ROOT computed from \_\_dirname by traversing up 4 directory levels. Resolves to the harness project root.

- **dirname.mjs** - ESM polyfill for \_\_dirname using import.meta.url and fileURLToPath.

- **ensure-dir.mjs** - Creates directory recursively if it doesn't exist using fs.mkdirSync.

- **logger.mjs** - Shared logger module importing createLogger from lib/logger.mjs. Exports logError for error reporting.

- **write-report.mjs** - Writes ingestion summary to {REPORTS_DIR}/latest.json with pretty printing. Called at end of main() and on fatal errors.

## 3. Overall Directory Function

This directory provides a complete email-to-issue ingestion pipeline. The workflow begins with syncMail() pulling new messages via mbsync, followed by indexMail() indexing with notmuch. The main() function then queries for unprocessed messages using the configured notmuch query, validates sender authorization against ALLOWED_SENDERS, extracts message content including body text, checks for existing issues via findExistingByExternalKey to avoid duplicates, and creates new Linear issues for authorized emails. Each processed message receives the "anqr-processed" tag while rejected unauthorized senders receive "anqr-rejected".

The module marks issues as human-only in Symphony state, routing them to the human lane rather than the agent pool. Issues are assigned to the human team member and include the email message content with metadata (From, Date) and an external key marker for duplicate detection. The system supports dry-run mode for testing without creating issues, and writes structured JSON reports documenting all actions taken during each run.

## 4. Usage Instructions

### Running Email Ingest

```bash
# Via facade (recommended)
node ops/integrations/email/email-ingest/runtime.mjs

# Or directly
node ops/integrations/email/email-ingest/main.mjs
```

### Dry Run Mode

To test without making actual Linear API calls or modifying message tags:

```bash
node ops/integrations/email/email-ingest/runtime.mjs --dry-run
```

### Prerequisites

- **notmuch** - Email indexing tool must be installed and configured
- **mbsync** - Mail synchronization tool (isync) must be installed
- **notmuch config** - Configured for the gmail maildir with appropriate tags
- **Linear API** - Valid credentials configured in the harness
- **Environment variables** - ANQR_INGEST_EMAIL (optional, defaults to email@anqr.link)

### Reports

Ingestion summaries are written to `reports/email-ingest/latest.json` containing:

- startedAt/finishedAt timestamps
- syncResult and indexResult status
- messagesFound count
- issuesCreated array with identifiers
- issuesMatched array for duplicates
- rejected array for unauthorized senders
- errors array for failures

## 5. Dependencies

### Internal Dependencies

- **../../../linear-client.mjs** - Linear API client (createIssue, findOpenIssuesByDescriptionFragment, STATES)
- **../../../symphony-state.mjs** - State management (addExternalKey, markIssueHumanOnly, patchIssueState, recordTransition)
- **../../../lib/logger.mjs** - Logger factory (createLogger)
- **../../../lib/notify.mjs** - Notification system (sendNotification, formatIssueLine)

### External Tools

- **notmuch** - Email indexing and tagging (show, search, tag commands)
- **mbsync** - IMAP mail synchronization (isync package)

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid notmuch configuration with gmail maildir
- Linear API credentials in environment

## 6. Additional Comments

- **Security Model**: Only whitelisted senders can trigger issue creation. Unauthorized emails receive "anqr-rejected" tag and trigger warning notifications.

- **Duplicate Prevention**: Uses external key markers (`<!-- external-key:email:{messageId} -->`) in issue descriptions to detect and skip already-processed emails.

- **Human-Only Routing**: Issues created from email are marked as human_only in Symphony state, ensuring they route to the human execution lane rather than AI agents.

- **Lock Handling**: If mbsync reports a lock conflict, the ingest exits early without indexing or processing to avoid corruption from concurrent syncs.

- **Fallback Content**: If email has no text/plain part, extracts text from text/html by stripping tags. Empty bodies show "(empty body)" placeholder.

- **Graceful Degradation**: If notmuch or mbsync are not installed, the system returns appropriate error status rather than failing completely, allowing downstream handling.
