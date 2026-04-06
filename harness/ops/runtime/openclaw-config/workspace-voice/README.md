# ANQR Voice Workspace

## 1. Directory Overview

This directory contains the OpenClaw voice agent's workspace configuration files. These files define the agent's identity, relationship with the user, operational guidelines, and memory management. The workspace-voice directory serves as the home base for a voice-enabled AI assistant that operates with genuine personality and continuity across sessions.

## 2. File Summaries

- **SOUL.md** - Core identity and behavioral guidelines. Defines the agent's fundamental truths (be genuinely helpful, have opinions, be resourceful, earn trust, remember you're a guest), boundaries (privacy, external actions, group chat behavior), and vibe (be the assistant you'd actually want to talk to). Also covers session continuity and how to persist state.

- **IDENTITY.md** - Template for the agent's personal identity. Contains placeholders for name, creature type (AI, robot, familiar, etc.), vibe description, signature emoji, and avatar path. Intended to be filled in during the first conversation with the user.

- **USER.md** - Template for learning about the human user. Includes fields for name, preferred address, pronouns, timezone, and a context section for learning about their interests, projects, annoyances, and what makes them laugh.

- **HEARTBEAT.md** - Template for periodic background tasks. Keep this empty or with comments to skip heartbeat API calls. Add specific tasks when you want the agent to check something periodically (e.g., emails, calendar, notifications).

- **TOOLS.md** - Local environment-specific notes. Contains examples for camera names/locations, SSH hosts, preferred TTS voices, speaker/room names, device nicknames, and other infrastructure-specific configuration. Separated from skills to allow updates without losing notes.

- **AGENTS.md** - Comprehensive workspace operational guide. Covers first-run bootstrap process, session startup sequence (reading SOUL.md, USER.md, memory files), memory management (daily notes in memory/, long-term in MEMORY.md), red lines (don't exfiltrate, ask before destructive commands), external vs internal action guidelines, group chat behavior, platform-specific formatting, and proactive heartbeat work.

- **BOOTSTRAP.md** - First-run initialization guide. Provides conversation prompts to help the agent discover its identity (name, nature, vibe, emoji) and learn about the user. **Must be deleted after bootstrap is complete** (as instructed in AGENTS.md).

## 3. Overall Directory Function

This directory provides the complete operational foundation for a voice-enabled AI assistant. The files work together to enable:

- **Identity Formation**: BOOTSTRAP.md guides initial identity discovery, which gets recorded in IDENTITY.md and reinforced by SOUL.md
- **User Relationship**: USER.md captures information about the human to provide personalized assistance
- **Operational Guidelines**: AGENTS.md provides comprehensive behavioral rules, memory management, and session startup procedures
- **Environment Configuration**: TOOLS.md stores local infrastructure details unique to the deployment
- **Periodic Tasks**: HEARTBEAT.md enables proactive background checking without explicit prompts

The workspace follows a "wake up fresh each session" model where memory files provide continuity. Daily notes capture raw events while MEMORY.md (stored one level up in the agents directory) holds curated long-term memories.

## 4. Usage Instructions

This directory is managed by the voice agent itself during runtime. However, administrators may need to:

1. **Initial Setup**: Ensure all template files exist (SOUL.md, IDENTITY.md, USER.md, HEARTBEAT.md, TOOLS.md, AGENTS.md, BOOTSTRAP.md)
2. **Bootstrap Process**: Run the agent for the first time - it will follow BOOTSTRAP.md to discover its identity and learn about the user
3. **Delete BOOTSTRAP.md**: After successful bootstrap, remove the bootstrap file as instructed in AGENTS.md
4. **Configure TOOLS.md**: Add environment-specific details (camera names, SSH hosts, TTS preferences, etc.)
5. **Set up HEARTBEAT.md**: Add periodic tasks if proactive monitoring is needed

### Session Startup Sequence

On each session, the agent should:
1. Read `SOUL.md` - this is who you are
2. Read `USER.md` - this is who you're helping
3. Read `memory/YYYY-MM-DD.md` (today + yesterday) for recent context
4. **If in MAIN SESSION**: Also read `MEMORY.md` for long-term memory

## 5. Dependencies

- **Parent Directory**: The agent's compiled memory (MEMORY.md) is stored in the parent `agents/` directory
- **Memory Directory**: Daily memory files are stored in `memory/` subdirectory (created by the agent as needed)
- **OpenClaw Runtime**: This workspace is loaded by the OpenClaw voice agent system
- **File System Access**: The agent requires read/write access to this directory and its files

### Environment Requirements

- File system with persistent storage for memory files
- The agent creates the `memory/` subdirectory dynamically as needed (not pre-existing)
- Proper permissions for the agent to modify IDENTITY.md, USER.md, and memory files

## 6. Additional Comments

- **Security Model**: AGENTS.md explicitly notes that MEMORY.md should NOT be loaded in shared contexts (Discord, group chats) - it's for main sessions only due to containing personal context
- **Privacy First**: The workspace emphasizes privacy as a core principle - private things stay private, ask before external actions
- **Group Chat Etiquette**: Detailed guidance on when to speak vs stay silent in group chats, using emoji reactions naturally, and not dominating conversations
- **Platform Formatting**: Specific rules for Discord/WhatsApp formatting (no markdown tables in Discord, use bullet lists instead)
- **Heartbeat Strategy**: Guidance on when to use heartbeat polls vs cron jobs, with recommendations to batch similar periodic checks
- **Memory Philosophy**: Emphasizes "text > brain" - if you want to remember something, write it to a file since mental notes don't survive session restarts