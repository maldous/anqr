# ANQR Voice Workspace

## 1. Directory Overview

This directory contains the OpenClaw voice agent's workspace configuration files. These files define
the agent's identity, relationship with the user, operational guidelines, and memory management. The
workspace-voice directory serves as the home base for a voice-enabled AI assistant that operates
with genuine personality and continuity across sessions. It currently contains 7 files and 0
subdirectories.

## 2. File Summaries

### Files

- **AGENTS.md** - Comprehensive workspace operational guide. Covers first-run bootstrap process, session startup sequence (reading SOUL.md, USER.md, memory files), memory management (daily notes in memory/, long-term in MEMORY.md), red lines (don't exfiltrate, ask before destructive commands), external vs internal action guidelines, group chat behavior, platform-specific formatting, and proactive heartbeat work.
- **BOOTSTRAP.md** - First-run initialization guide. Provides conversation prompts to help the agent discover its identity (name, nature, vibe, emoji) and learn about the user. **Must be deleted after bootstrap is complete** (as instructed in AGENTS.md).
- **HEARTBEAT.md** - Template for periodic background tasks. Keep this empty or with comments to skip heartbeat API calls. Add specific tasks when you want the agent to check something periodically (e.g., emails, calendar, notifications).
- **IDENTITY.md** - Template for the agent's personal identity. Contains placeholders for name, creature type (AI, robot, familiar, etc.), vibe description, signature emoji, and avatar path. Intended to be filled in during the first conversation with the user.
- **SOUL.md** - Core identity and behavioral guidelines. Defines the agent's fundamental truths (be genuinely helpful, have opinions, be resourceful, earn trust, remember you're a guest), boundaries (privacy, external actions, group chat behavior), and vibe (be the assistant you'd actually want to talk to). Also covers session continuity and how to persist state.
- **TOOLS.md** - Local environment-specific notes. Contains examples for camera names/locations, SSH hosts, preferred TTS voices, speaker/room names, device nicknames, and other infrastructure-specific configuration. Separated from skills to allow updates without losing notes.
- **USER.md** - Template for learning about the human user. Includes fields for name, preferred address, pronouns, timezone, and a context section for learning about their interests, projects, annoyances, and what makes them laugh.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, the files in this directory are intended to be consumed together. The README content
below is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **No dedicated runtime dependency** - This directory mainly stores generated assets or supporting files.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
