# Discord Source Module

## 1. Directory Overview

This directory contains utilities for detecting and marking Linear issues that originate from Discord. It provides functions to identify Discord-sourced issues and update their state accordingly, enabling proper tracking and handling of issues created through Discord integrations.

## 2. File Summaries

- **is-discord-sourced.mjs** - Detection function that determines if an issue was created from Discord. It checks for:
  - Discord label ID in issue labels (from `DISCORD_LABEL_ID` or `LINEAR_DISCORD_LABEL_ID` environment variables)
  - Creator's email containing "discord"
  - Creator's name containing "discord"
  - Creator's ID matching `DISCORD_BOT_USER_ID` environment variable
    Returns `true` if any of these conditions are met, `false` otherwise.

- **mark-discord-source.mjs** - State update function that marks an issue as Discord-sourced. It retrieves the current issue state using `getIssueState`, and if the source is not already "discord", it patches the state to set `source: "discord"`.

- **detect-and-mark-discord-source.mjs** - Combined utility that first checks if an issue is Discord-sourced using `isDiscordSourced`, and if so, marks it using `markDiscordSource`. Returns `true` if the issue was marked as Discord-sourced, `false` otherwise.

- **index.mjs** - Facade module that re-exports all three functions (`isDiscordSourced`, `markDiscordSource`, `detectAndMarkDiscordSource`) for convenient imports.

## 3. Overall Directory Function

This module serves as part of the issue source tracking system within the ANQR harness. It enables the system to identify and categorize issues that originate from Discord, which is essential for:

- Proper issue routing and handling
- Source attribution in analytics and reporting
- Discord-specific workflow processing

The detection logic uses multiple signals (labels, creator email, creator name, creator ID) to ensure robust identification of Discord-originated issues across different integration patterns.

## 4. Usage Instructions

```javascript
import {
  isDiscordSourced,
  markDiscordSource,
  detectAndMarkDiscordSource,
} from "./discord-source/index.mjs";

// Check if an issue is from Discord
const isDiscord = isDiscordSourced(issueData);

// Mark an issue as Discord-sourced
markDiscordSource(issueIdentifier);

// Detect and mark in one step
const wasMarked = detectAndMarkDiscordSource(issueData, issueIdentifier);
```

## 5. Dependencies

- **Environment Variables:**
  - `DISCORD_LABEL_ID` - Linear label ID for Discord-sourced issues
  - `LINEAR_DISCORD_LABEL_ID` - Alternative env var for Discord label ID
  - `DISCORD_BOT_USER_ID` - User ID of the Discord bot that creates issues

- **Internal Modules:**
  - `../symphony-state.mjs` - For `getIssueState` and `patchIssueState` functions

## 6. Additional Comments

- The detection function is designed with multiple fallback mechanisms to handle different Discord integration patterns
- The module uses short-circuit evaluation for efficiency - it stops checking once a Discord source is confirmed
- The facade pattern in `index.mjs` provides a clean public API while keeping implementation details in separate modules
- State persistence is handled by the symphony-state module, which this module depends on for reading and writing issue state
