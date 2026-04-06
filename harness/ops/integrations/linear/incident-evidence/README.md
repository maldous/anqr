# ANQR Linear Incident Evidence

## 1. Directory Overview

This directory contains incident evidence collection and formatting utilities for the ANQR (Agentic Number Query Runner) harness. It provides functionality to gather diagnostic information during incidents, including git context, system metrics, provider health state, and service logs, then format them for attachment to Linear issues for incident tracking and resolution.

## 2. File Summaries

### Facade Module

- **index.mjs** - Generated facade index that exports all public API members: `getServiceJournal`, `getGitContext`, `getSystemInfo`, `getStateFileInfo`, `collectIncidentEvidence`, and `formatEvidenceForIssue`.

### Core Implementation Files

- **collect-incident-evidence.mjs** - Main async function that aggregates all incident evidence. Collects timestamp, optional error context, git context, system info, provider health state, state file info, and optionally service journal logs. Returns a structured evidence object.

- **get-git-context.mjs** - Retrieves current git repository state including current commit hash (short), branch name, and whether there are uncommitted changes. Uses `git rev-parse` and `git status --porcelain`. Returns `{ commit, branch, hasUncommitted }`.

- **get-system-info.mjs** - Collects system information including hostname (via `hostname`), uptime (via `uptime -p`), and available memory (from `/proc/meminfo`). Returns `{ hostname, uptime, memFree }`. Gracefully handles errors.

- **get-state-file-info.mjs** - Retrieves information about the Symphony state file (`state.json`) including file size in KB and last modified timestamp. Uses `ANQR_SYMPHONY_STATE_DIR` environment variable or defaults to `${XDG_RUNTIME_DIR || "/tmp"}/anqr-symphony-state`.

- **get-service-journal.mjs** - Fetches recent journalctl logs for a specified user service. Takes service name and line count (default 100). Returns the log output or empty string on failure. Uses `journalctl --user -u <serviceName>`.

- **format-evidence-for-issue.mjs** - Formats collected evidence as a Markdown string suitable for inclusion in a Linear issue. Generates sections for Timestamp, Service (if applicable), Error Context, Git Context, System Info, State File, Provider Health, and Service Journal (last 100 lines in a code block).

- **logger.mjs** - Shared logger module that imports and re-exports `logWarn` from the central logger at `../../../lib/logger.mjs`.

## 3. Overall Directory Function

This directory serves as the incident evidence collection layer for Linear-integrated incident management in the ANQR harness. When an incident occurs, the `collectIncidentEvidence` function aggregates diagnostic data from multiple sources:

- **Git context** identifies what code version was running
- **System info** provides hostname, uptime, and memory state
- **Provider health** shows the status of AI providers
- **State file** indicates Symphony's internal state
- **Service journal** captures recent service logs

The evidence is then formatted via `formatEvidenceForIssue` to produce Markdown suitable for attaching to a Linear issue, enabling incident responders to quickly understand the context when investigating issues.

## 4. Usage Instructions

This directory is primarily used through imports from other harness modules. The index.mjs facade is the canonical entry point:

```javascript
import { collectIncidentEvidence, formatEvidenceForIssue } from "./ops/integrations/linear/incident-evidence/index.mjs";
```

### Collecting Evidence

```javascript
// Collect evidence with optional service name and error context
const evidence = await collectIncidentEvidence("symphony-bridge", {
  error: "Connection timeout",
  provider: "ollama"
});

// Format for Linear issue
const markdown = formatEvidenceForIssue(evidence);
```

### Individual Functions

```javascript
import { getGitContext, getSystemInfo, getStateFileInfo, getServiceJournal } from "./ops/integrations/linear/incident-evidence/index.mjs";

const git = getGitContext();
const system = getSystemInfo();
const state = getStateFileInfo();
const journal = getServiceJournal("my-service", 50);
```

## 5. Dependencies

### Internal Dependencies

- **../../../lib/logger.mjs** - Central logger module for warning logs
- **../../model/symphony-provider-health.mjs** - Provider health state loading (`loadHealthState`)
- **Node.js built-ins** - `node:fs`, `node:child_process`

### External Requirements

- **Git** - Required for git context retrieval (git command must be available)
- **systemd** - Required for journalctl (Linux systems with user journal)
- **procfs** - Required for memory info (`/proc/meminfo`)

### Environment Variables

- **ANQR_SYMPHONY_STATE_DIR** - Optional override for state file directory (defaults to `${XDG_RUNTIME_DIR || "/tmp"}/anqr-symphony-state`)
- **XDG_RUNTIME_DIR** - Used as fallback for state directory if ANQR_SYMPHONY_STATE_DIR not set

## 6. Additional Comments

- **Fail-Safe Design**: All functions gracefully handle errors and return sensible defaults. Git context returns `{ commit: "unknown", branch: "unknown", hasUncommitted: false }` on failure. System info returns `{ hostname: "unknown", uptime: "unknown", memFree: "unknown" }`.

- **Linux-Centric**: System info and journalctl are Linux-specific. The module works cross-platform but some functions will return "unknown" values on non-Linux systems.

- **Graceful Degradation**: If any component fails to collect (e.g., no journal access, missing git repo), the evidence collection continues with available data rather than throwing errors.

- **Markdown Output**: The formatter produces clean Markdown with sections, bullet points, and code blocks for logs, making it easy to read in Linear's issue UI.