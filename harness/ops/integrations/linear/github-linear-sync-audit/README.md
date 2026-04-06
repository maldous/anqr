# ANQR GitHub-Linear Sync Audit

## 1. Directory Overview

This directory contains automation for auditing the synchronization between GitHub Issues and Linear issue tracking. It provides tools to identify orphaned GitHub issues (not linked to active Linear issues), detect ambiguous references, and optionally close orphaned issues automatically. The module ensures that GitHub Issues are only used as mirrors for Linear issues and helps maintain a clean issue state by closing unreferenced or stale GitHub issues.

## 2. File Summaries

### Core Modules

- **audit-sync.mjs** - Main audit logic that fetches GitHub and Linear issues, analyzes their relationship, and reports findings. Supports optional orphan closure with `--close-orphans` flag. Categorizes issues into linked, orphaned, and ambiguous groups.

- **main.mjs** - CLI entry point that parses command-line arguments and invokes the audit sync process. Supports `--close-orphans` flag to automatically close orphaned GitHub issues.

- **index.mjs** - Facade index exporting all public API members including constants, functions, and the main entry point. Re-exports from all other modules for convenient imports.

- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function via `await main()`. Used for direct execution of the module.

### API Client Modules

- **fetch-git-hub-issues.mjs** - Fetches open GitHub issues from the configured repository using the GitHub REST API with pagination support. Filters out pull requests from the results. Uses a 20-second timeout for requests.

- **close-git-hub-issue.mjs** - Closes a GitHub issue via the API with "not_planned" state reason. Automatically adds a comment explaining why the issue was closed, directing users to use Linear for issue tracking.

- **extract-linear-identifier.mjs** - Extracts Linear issue identifiers from GitHub issue titles and bodies using regex patterns. Supports patterns like ANQR-123, [ANQR-123], and "Linear: ANQR-123". Returns a deduplicated array of found identifiers.

### Configuration & Utilities

- **github-api.mjs** - Exports the GitHub API base URL constant (`https://api.github.com`).

- **github-repo.mjs** - Exports the GitHub repository constant, defaulting to `maldous/anqr` from the `GITHUB_REPO` environment variable.

- **request-timeout-ms.mjs** - Exports the request timeout constant (20,000 ms) for API calls.

- **get-git-hub-token.mjs** - Retrieves the GitHub personal access token from the `GITHUB_TOKEN` environment variable. Throws an error if not set.

- **logger.mjs** - Shared logger module using the project's standard logger from `../../../lib/logger.mjs`. Exports `logInfo`, `logError`, `logWarn`, and `logDebug` functions.

## 3. Overall Directory Function

This directory serves as an integration audit tool ensuring proper GitHub-Linear synchronization. The audit process works as follows:

1. **Fetch GitHub Issues**: Retrieves all open GitHub issues from the configured repository using pagination.

2. **Fetch Linear Issues**: Retrieves all Linear issues across all states (Backlog, Todo, In Progress, In Review, Blocked, Human Review, Done, Canceled).

3. **Analyze Relationships**: For each GitHub issue, extracts potential Linear identifiers and checks if they correspond to active Linear issues.

4. **Categorize Issues**: Classifies issues into:
   - **Linked**: GitHub issues with valid Linear identifier references
   - **Orphaned**: GitHub issues with no Linear reference or references to deleted/canceled Linear issues
   - **Ambiguous**: GitHub issues with multiple Linear references

5. **Report & Action**: Prints detailed audit results and optionally closes orphaned issues with explanatory comments.

This module is critical for maintaining the project's "GitHub Issues are disabled" policy by automatically cleaning up orphaned issues.

## 4. Usage Instructions

### Running the Audit

```bash
# Via facade (recommended)
node ops/integrations/linear/github-linear-sync-audit.mjs
```

Or directly:

```bash
node ops/integrations/linear/github-linear-sync-audit/runtime.mjs
```

### Dry Run Mode (Audit Only)

The audit runs in read-only mode by default, showing all findings without making changes:

```bash
node ops/integrations/linear/github-linear-sync-audit/main.mjs
```

### Close Orphans Mode

To automatically close orphaned GitHub issues:

```bash
node ops/integrations/linear/github-linear-sync-audit/main.mjs --close-orphans
```

Note: This will close issues with the reason stored in the audit results.

### Prerequisites

- `GITHUB_TOKEN` environment variable must be set with a GitHub personal access token
- `GITHUB_REPO` environment variable (optional, defaults to "maldous/anqr")
- Linear API credentials configured (via linear-client.mjs)

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GITHUB_TOKEN` | Yes | - | GitHub personal access token |
| `GITHUB_REPO` | No | `maldous/anqr` | GitHub repository in format "owner/repo" |

### Output Format

The audit outputs categorized results:

- **Linked issues**: Count and percentage of properly linked issues
- **Orphaned issues**: Count, percentage, and detailed listing of orphaned issues with reasons
- **Ambiguous issues**: Count and listing of issues with multiple Linear references
- **Summary**: Final statistics on total issues and categorization breakdown

## 5. Dependencies

### Internal Dependencies

- **../linear-client.mjs** - For fetching Linear issues via `listIssuesByState`
- **../../../lib/logger.mjs** - For logging utilities

### External Services

- **GitHub REST API** - For fetching and closing GitHub issues
- **Linear API** - For fetching Linear issue data

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid GitHub personal access token with repo scope
- Network access to GitHub API and Linear API

## 6. Additional Comments

- **Policy Enforcement**: This module enforces the project's policy that "GitHub Issues are disabled for this repository" by automatically closing orphaned issues that lack valid Linear references.

- **Rate Limiting**: When closing orphaned issues, the module implements a 500ms delay between batches of 10 issues to respect GitHub API rate limits.

- **Fail-Safe Design**: Orphaned issue closure only happens when explicitly requested via the `--close-orphans` flag, ensuring the default behavior is read-only audit.

- **Identifier Patterns**: The module supports multiple identifier patterns to maximize detection of Linear references in GitHub issues, including explicit prefixes, bracketed formats, and "Linear:" prefixes.

- **State Closure Reason**: When closing issues, uses `state_reason: "not_planned"` to clearly indicate these are intentionally closed rather than resolved.

- **Comment on Closure**: Automatically adds a comment to closed issues directing users to use Linear for future issue tracking.