# ANQR Linear Incident Evidence

## 1. Directory Overview

This directory implements **ANQR Linear Incident Evidence** within the ANQR harness. Key immediate entries include `index.mjs`, `get-state-file-info.mjs`, `format-evidence-for-issue.mjs`, `get-system-info.mjs`. The current inventory is 8 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **collect-incident-evidence.mjs** - Exports `collectIncidentEvidence`, which collects incident evidence.
- **format-evidence-for-issue.mjs** - Exports `formatEvidenceForIssue`, which formats evidence for issue.
- **get-git-context.mjs** - Exports `getGitContext`, which gets git context.
- **get-service-journal.mjs** - Exports `getServiceJournal`, which gets service journal.
- **get-state-file-info.mjs** - Exports `getStateFileInfo`, which gets state file info.
- **get-system-info.mjs** - Exports `getSystemInfo`, which gets system info.
- **index.mjs** - Facade module that re-exports public members from `./get-service-journal.mjs`, `./get-git-context.mjs`, `./get-system-info.mjs`, `./get-state-file-info.mjs`, `./collect-incident-evidence.mjs`, `./format-evidence-for-issue.mjs`.
- **logger.mjs** - Shared logging helper module exporting `logWarn`.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include subprocess execution, Linear integration, Symphony integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/integrations/linear/incident-evidence/index.mjs";
```

## 5. Dependencies

- **Node.js built-ins** - `node:child_process`, `node:fs`
- **Internal relative modules** - `../../../lib/logger.mjs`, `../../model/symphony-provider-health.mjs`, `./get-git-context.mjs`, `./get-service-journal.mjs`, `./get-state-file-info.mjs`, `./get-system-info.mjs`, `./logger.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
