# ANQR Linear Client

## 1. Directory Overview

This directory implements **ANQR Linear Client** within the ANQR harness. Key immediate entries include `index.mjs`, `find-open-issues-by-description-fragment.mjs`, `find-open-issues-by-identifier.mjs`, `find-open-issues-by-title.mjs`. The current inventory is 20 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **add-comment.mjs** - Exports `addComment`, which implements add comment.
- **create-issue.mjs** - Exports `createIssue`, which creates issue.
- **find-open-issues-by-description-fragment.mjs** - Exports `findOpenIssuesByDescriptionFragment`, which finds open issues by description fragment.
- **find-open-issues-by-identifier.mjs** - Exports `findOpenIssuesByIdentifier`, which finds open issues by identifier.
- **find-open-issues-by-title.mjs** - Exports `findOpenIssuesByTitle`, which finds open issues by title.
- **find-open-issues.mjs** - Exports `findOpenIssues`, which finds open issues.
- **get-api-key.mjs** - Exports `getApiKey`, which gets api key.
- **get-issue-detail.mjs** - Exports `getIssueDetail`, which gets issue detail.
- **get-queue-depth.mjs** - Exports `getQueueDepth`, which gets queue depth.
- **index.mjs** - Facade module that re-exports public members from `./linear-api.mjs`, `./request-timeout-ms.mjs`, `./team-id.mjs`, `./states.mjs`, `./labels.mjs`, `./open-state-names.mjs`, and 13 more siblings.
- **labels.mjs** - Exports `LABELS`, a shared constant used by sibling modules.
- **linear-api.mjs** - Exports `LINEAR_API`, a shared constant used by sibling modules.
- **list-issues-by-state.mjs** - Exports `listIssuesByState`, which lists issues by state.
- **open-state-names.mjs** - Exports `OPEN_STATE_NAMES`, a shared constant used by sibling modules.
- **query.mjs** - Exports `query`, which implements query.
- **request-timeout-ms.mjs** - Exports `REQUEST_TIMEOUT_MS`, a shared constant used by sibling modules.
- **states.mjs** - Exports `STATES`, a shared constant used by sibling modules.
- **team-id.mjs** - Exports `TEAM_ID`, a shared constant used by sibling modules.
- **update-comment.mjs** - Exports `updateComment`, which implements update comment.
- **update-issue.mjs** - Exports `updateIssue`, which implements update issue.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include network/API integration, timer, scheduling, cooldown, or watchdog behavior, Linear integration, Discord integration, Symphony integration, and git/worktree awareness. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/integrations/linear/linear-client/index.mjs";
```

## 5. Dependencies

- **Internal relative modules** - `../../../symphony-state.mjs`, `./find-open-issues.mjs`, `./get-api-key.mjs`, `./get-issue-detail.mjs`, `./linear-api.mjs`, `./list-issues-by-state.mjs`, `./open-state-names.mjs`, `./query.mjs`, `./request-timeout-ms.mjs`, `./team-id.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
