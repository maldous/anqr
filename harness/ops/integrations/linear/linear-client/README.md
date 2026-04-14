# Linear Client

## Purpose

Linear Client contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents

- 20 immediate files
- 0 child directories

## Key Files

- `add-comment.mjs` - Exports `addComment`, the main helper defined in this file.
- `create-issue.mjs` - Exports `createIssue`, the main helper defined in this file.
- `find-open-issues-by-description-fragment.mjs` - Exports `findOpenIssuesByDescriptionFragment`, the main helper defined in this file.
- `find-open-issues-by-identifier.mjs` - Exports `findOpenIssuesByIdentifier`, the main helper defined in this file.
- `find-open-issues-by-title.mjs` - Exports `findOpenIssuesByTitle`, the main helper defined in this file.
- `find-open-issues.mjs` - Exports `findOpenIssues`, the main helper defined in this file.
- `get-api-key.mjs` - Exports `getApiKey`, the main helper defined in this file.
- `get-issue-detail.mjs` - Exports `getIssueDetail`, the main helper defined in this file.
- `get-queue-depth.mjs` - Exports `getQueueDepth`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `labels.mjs` - Exports `LABELS`, a shared constant or state value used by sibling modules.
- `linear-api.mjs` - Exports `LINEAR_API`, a shared constant or state value used by sibling modules.
- `list-issues-by-state.mjs` - Exports `listIssuesByState`, the main helper defined in this file.
- `open-state-names.mjs` - Exports `OPEN_STATE_NAMES`, a shared constant or state value used by sibling modules.
- `query.mjs` - Exports `query`, the main helper defined in this file.
- `request-timeout-ms.mjs` - Exports `REQUEST_TIMEOUT_MS`, a shared constant or state value used by sibling modules.
- `states.mjs` - Exports `STATES`, a shared constant or state value used by sibling modules.
- `team-id.mjs` - Exports `TEAM_ID`, a shared constant or state value used by sibling modules.
- `update-comment.mjs` - Exports `updateComment`, the main helper defined in this file.
- `update-issue.mjs` - Exports `updateIssue`, the main helper defined in this file.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 20 immediate file(s) and 0 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus

Check that the current implementation in this directory still matches its intended role in the harness architecture.
