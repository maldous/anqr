# Discord Source Module

## 1. Directory Overview

This directory contains utilities for detecting and marking Linear issues that originate from
Discord. It provides functions to identify Discord-sourced issues and update their state
accordingly, enabling proper tracking and handling of issues created through Discord integrations.
It currently contains 4 files and 0 subdirectories.

## 2. File Summaries

### Files

- **detect-and-mark-discord-source.mjs** - Combined utility that first checks if an issue is Discord-sourced using `isDiscordSourced`, and if so, marks it using `markDiscordSource`. Returns `true` if the issue was marked as Discord-sourced, `false` otherwise.
- **index.mjs** - Facade module that re-exports all three functions (`isDiscordSourced`, `markDiscordSource`, `detectAndMarkDiscordSource`) for convenient imports.
- **is-discord-sourced.mjs** - Detection function that determines if an issue was created from Discord. It checks for:
- **mark-discord-source.mjs** - State update function that marks an issue as Discord-sourced. It retrieves the current issue state using `getIssueState`, and if the source is not already "discord", it patches the state to set `source: "discord"`.

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
