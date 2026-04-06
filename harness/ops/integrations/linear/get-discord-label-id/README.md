# ANQR Linear - Get Discord Label ID

## 1. Directory Overview

This directory contains a utility module for the ANQR (Agentic Number Query Runner) harness that manages Discord label identification in the Linear workspace. It provides functionality to search for an existing Discord label or create one if it doesn't exist, then outputs the label ID for use in system configuration.

## 2. File Summaries

### Facade Module

- **index.mjs** - Generated facade index that exports the public API: `getAllLabels`, `createDiscordLabel`, and `main` functions from sibling modules.

### Implementation Files

- **get-all-labels.mjs** - Queries the Linear API to fetch all labels for the configured team. Returns an array of label objects containing id, name, description, and color fields.

- **create-discord-label.mjs** - Creates a new label named "source:discord" with the description "Issue created from Discord via OpenClaw Gateway" and Discord brand color "#7289da". Uses the Linear GraphQL mutation `issueLabelCreate`.

- **main.mjs** - Main entry point that orchestrates the workflow: searches for an existing Discord label by name or description, displays its ID if found, or creates a new one if missing. Outputs instructions for adding the label ID to systemd user environment.

- **logger.mjs** - Shared logger module that re-exports `logInfo` and `logError` from the central logger library (`../../../lib/logger.mjs`).

### Runtime Files

- **runtime.mjs** - Generated runtime carry-forward that imports and executes the main function. This is the executable entry point when running the module directly.

## 3. Overall Directory Function

This directory serves as a configuration utility for the Linear-Discord integration. The workflow:

1. `main.mjs` fetches all labels from the Linear team via `getAllLabels()`
2. Searches for a label named "source:discord" or containing "discord" in the name
3. If found, displays the label ID for configuration
4. If not found, creates the label via `createDiscordLabel()` and displays the new ID

The label ID is needed for the `DISCORD_LABEL_ID` environment variable in the systemd user configuration (`~/.config/systemd/user/anqr-ops.env`), enabling proper routing of Discord-sourced issues in the ANQR system.

## 4. Usage Instructions

### Running the Module

```bash
# Via facade (recommended)
node ops/integrations/linear/get-discord-label-id.mjs
```

Or directly:

```bash
node ops/integrations/linear/get-discord-label-id/runtime.mjs
```

### Expected Output

The script will either:

- Display the existing Discord label ID:

  ```
  Add this to your ~/.config/systemd/user/anqr-ops.env:
  DISCORD_LABEL_ID=<label-id>
  ```

- Or create a new label and display its ID with setup instructions:
  ```
  Then reload systemd and restart services:
    systemctl --user daemon-reload
    systemctl --user restart anqr-linear-webhook anqr-queue-feeder
  ```

## 5. Dependencies

### Internal Dependencies

- **../linear-client.mjs** - Provides `query` function for GraphQL API calls and `TEAM_ID` constant
- **../../../lib/logger.mjs** - Central logger module providing `createLogger` factory

### External Services

- **Linear** - Issue tracking platform API (requires configured API credentials)

### Runtime Requirements

- Node.js with ESM support (.mjs files)
- Valid Linear API credentials in environment

## 6. Additional Comments

- **Label Color**: The created label uses Discord's brand color `#7289da` for visual consistency with the Discord integration.

- **Auto-Creation**: The module automatically creates the label if it doesn't exist, reducing manual setup overhead.

- **Integration Purpose**: This label is used by the OpenClaw Gateway to mark issues created from Discord messages, enabling proper issue routing and tracking in the ANQR system.

- **Configuration Output**: The script provides ready-to-use environment variable configuration, making it easy to integrate with systemd-based deployment.
