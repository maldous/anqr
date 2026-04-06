# ANQR Linear Incident Evidence

## 1. Directory Overview

This directory contains incident evidence collection and formatting utilities for the ANQR (Agentic
Number Query Runner) harness. It provides functionality to gather diagnostic information during
incidents, including git context, system metrics, provider health state, and service logs, then
format them for attachment to Linear issues for incident tracking and resolution. It currently
contains 8 files and 0 subdirectories.

## 2. File Summaries

### Files

- **collect-incident-evidence.mjs** - Main async function that aggregates all incident evidence. Collects timestamp, optional error context, git context, system info, provider health state, state file info, and optionally service journal logs. Returns a structured evidence object.
- **format-evidence-for-issue.mjs** - Formats collected evidence as a Markdown string suitable for inclusion in a Linear issue. Generates sections for Timestamp, Service (if applicable), Error Context, Git Context, System Info, State File, Provider Health, and Service Journal (last 100 lines in a code block).
- **get-git-context.mjs** - Retrieves current git repository state including current commit hash (short), branch name, and whether there are uncommitted changes. Uses `git rev-parse` and `git status --porcelain`. Returns `{ commit, branch, hasUncommitted }`.
- **get-service-journal.mjs** - Fetches recent journalctl logs for a specified user service. Takes service name and line count (default 100). Returns the log output or empty string on failure. Uses `journalctl --user -u <serviceName>`.
- **get-state-file-info.mjs** - Retrieves information about the Symphony state file (`state.json`) including file size in KB and last modified timestamp. Uses `ANQR_SYMPHONY_STATE_DIR` environment variable or defaults to `${XDG_RUNTIME_DIR || "/tmp"}/anqr-symphony-state`.
- **get-system-info.mjs** - Collects system information including hostname (via `hostname`), uptime (via `uptime -p`), and available memory (from `/proc/meminfo`). Returns `{ hostname, uptime, memFree }`. Gracefully handles errors.
- **index.mjs** - Generated facade index that exports all public API members: `getServiceJournal`, `getGitContext`, `getSystemInfo`, `getStateFileInfo`, `collectIncidentEvidence`, and `formatEvidenceForIssue`.
- **logger.mjs** - Shared logger module that imports and re-exports `logWarn` from the central logger at `../../../lib/logger.mjs`.

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
