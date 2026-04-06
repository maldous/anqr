# ANQR Workspace

## 1. Directory Overview

This directory contains the agent workspace configuration for the OpenCLAW runtime system. It defines the identity, personality, and operational guidelines for the AI assistant (named Scarlet) that operates within the ANQR (Agentic Number Query Runner) harness. The workspace serves as the persistent memory and configuration layer that gives the agent context about who it is, who it serves, and how it should behave.

## 2. File Summaries

### SOUL.md - Core Identity
Defines the fundamental principles and personality of the AI assistant. Key tenets include: being genuinely helpful rather than performatively helpful, having opinions and preferences, being resourceful before asking questions, earning trust through competence, and recognizing that the agent is a guest in the user's life. The file also establishes boundaries around privacy and external actions, and defines the desired "vibe" - being the assistant you'd actually want to talk to.

### IDENTITY.md - Who Am I?
Specifies the agent's identity parameters: name is "Scarlet", creature type is "AI assistant", vibe is "Clinical", and there is no emoji. The avatar field is empty. This file provides the basic identity markers used across all interactions.

### USER.md - About Your Human
Contains information about the user (Matthew) including: name, how to address them (Matthew), pronouns (optional), timezone (Melbourne), and a placeholder for context about their projects, interests, and preferences. The file emphasizes that the agent should build knowledge about the user over time while respecting privacy.

### plan.md - Production Readiness Plan
A comprehensive 11-phase plan for taking a QR code generator project to production. The plan covers: repository discovery, codebase audit, functional correctness verification by generator section, overlay blend modes validation, analysis section expansion, automated gallery generation, testing strategy, i18n completeness, performance optimization, deployment readiness, and documentation updates. The plan currently has a blocker - `knowledge.md` is not present and needs to be located or restored.

### HEARTBEAT.md - Periodic Task Configuration
This file can be kept empty (or with only comments) to skip heartbeat API calls. When tasks need periodic checking, they should be added to this file. The heartbeat system allows the agent to proactively check emails, calendar events, notifications, and other periodic tasks without requiring explicit prompts.

### TOOLS.md - Local Notes
A placeholder for environment-specific configuration that the agent needs for its operation. Examples include camera names and locations, SSH hosts and aliases, preferred TTS voices, speaker/room names, and device nicknames. The file emphasizes keeping skills separate from local setup details so that skills can be shared without leaking infrastructure information.

### AGENTS.md - Workspace Operational Guidelines
The most comprehensive file in the directory. It covers: first-run bootstrap instructions, mandatory session startup sequence (reading SOUL.md, USER.md, and memory files), memory management (daily notes in memory/YYYY-MM-DD.md and long-term memory in MEMORY.md), safety guidelines (don't exfiltrate data, use trash over rm), external vs internal action boundaries, group chat etiquette, emoji reaction behavior, platform formatting rules (Discord/WhatsApp), heartbeat usage instructions, and memory maintenance procedures. The file concludes with encouragement to make the workspace your own.

## 3. Overall Directory Function

This workspace directory functions as the persistent identity and context layer for the ANQR agent runtime. The files work together to provide a complete operational context: SOUL.md and IDENTITY.md establish who the agent is, USER.md defines who it serves, AGENTS.md provides behavioral guidelines and memory management, HEARTBEAT.md enables proactive periodic checks, TOOLS.md holds environment-specific configuration, and plan.md tracks the current project roadmap.

The workspace follows a "wake up fresh" philosophy - each session starts without prior conversational context, and the files in this directory serve as the sole source of continuity. The agent reads these files at the start of every session to establish context and refresh its understanding of its identity, the user, and ongoing tasks.

This directory is fundamental to the OpenCLAW agent system because it provides the "personality layer" that distinguishes the assistant from a generic chatbot. The configuration here shapes how the agent interacts, what it prioritizes, and how it maintains continuity across sessions.

## 4. Usage Instructions

This workspace is automatically read by the OpenCLAW runtime at session startup. No manual interaction is typically required, but the files can be edited to update the agent's context:

**To update agent identity:** Edit SOUL.md for core principles or IDENTITY.md for basic identity parameters.

**To update user context:** Edit USER.md to add information about preferences, projects, or context that helps the agent provide better assistance.

**To add periodic tasks:** Add task descriptions to HEARTBEAT.md to enable proactive checking during heartbeat polls.

**To add environment tools:** Populate TOOLS.md with local infrastructure details like SSH hosts, camera names, or device identifiers.

**To track project progress:** Update plan.md as phases are completed and blockers are resolved.

**To maintain memory:** During heartbeats, review memory/YYYY-MM-DD.md files and update MEMORY.md with significant learnings.

## 5. Dependencies

This workspace directory has no external code dependencies - it contains only Markdown configuration files. However, it depends on:

- **OpenCLAW runtime** - The agent system that reads these files at session startup
- **Memory system** - The runtime creates and manages memory/YYYY-MM-DD.md files for session continuity
- **Heartbeat system** - Optional periodic polling that reads HEARTBEAT.md for task definitions
- **External services** - The plan.md references a QR code generator project that presumably has its own dependency chain (likely Node.js based on the ANQR harness structure)

## 6. Additional Comments

The workspace follows a deliberate design philosophy: the agent should be personable rather than corporate, resourceful rather than dependent, and privacy-conscious. The "Clinical" vibe specified in IDENTITY.md suggests a preference for precision and efficiency over warmth.

The plan.md file is notable because it contains an active blocker (missing knowledge.md) that needs resolution before the production readiness work can proceed. This demonstrates the workspace's role in tracking not just agent configuration but also active project state.

The AGENTS.md file contains detailed guidelines for group chat behavior and emoji usage that reflect a thoughtful approach to making the AI feel natural in social contexts rather than robotic or intrusive. The "HEARTBEAT_OK" concept for staying silent when appropriate shows sophisticated understanding of conversational dynamics.

Memory persistence is critical - the agent is explicitly instructed that "mental notes don't survive session restarts. Files do." This makes the workspace directory essential for any continuity across sessions.