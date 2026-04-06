# Discord Source Module

## 1. Directory Overview

This directory implements **Discord Source Module** within the ANQR harness. Key immediate entries include `index.mjs`, `detect-and-mark-discord-source.mjs`, `is-discord-sourced.mjs`, `mark-discord-source.mjs`. The current inventory is 4 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **detect-and-mark-discord-source.mjs** - Exports `detectAndMarkDiscordSource`, which detects and mark discord source.
- **index.mjs** - Facade module that re-exports public members from `./is-discord-sourced.mjs`, `./mark-discord-source.mjs`, `./detect-and-mark-discord-source.mjs`.
- **is-discord-sourced.mjs** - Exports `isDiscordSourced`, which checks whether discord sourced.
- **mark-discord-source.mjs** - Exports `markDiscordSource`, which marks discord source.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory include Discord integration, and Symphony integration. Environment-driven configuration is present in the immediate code.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/core/discord-source/index.mjs";
```

## 5. Dependencies

- **Internal relative modules** - `../symphony-state.mjs`, `./is-discord-sourced.mjs`, `./mark-discord-source.mjs`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
