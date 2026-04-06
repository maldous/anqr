# ANQR OpenClaw Configuration

## 1. Directory Overview

This directory contains the local copy of the OpenClaw gateway configuration for the ANQR (Agentic
Number Query Runner) harness. OpenClaw is an agentic runtime that provides Discord voice
integration, tool execution, and multi-model AI connectivity. The configuration has been sanitized
with secrets replaced by placeholder values for version control safety. It currently contains 6
files and 6 subdirectories.

## 2. File Summaries

### Files

- **.env.example** - Environment variable template:
- **clawdbot.json** - Bot runtime settings:
- **config.json** - TTS and gateway HTTP configuration:
- **exec-approvals.json** - Exec approval socket configuration:
- **models.json** - Provider and model definitions:
- **openclaw.json** - Main OpenClaw configuration file containing:

### Child Directories

- **agents/** - This directory contains agent configuration files for the OpenClaw runtime system.
- **credentials/** - This directory contains credential configuration files for the Openclaw Discord integration within the ANQR (Agentic Number Query Runner) runtime.
- **identity/** - This directory contains identity and device authentication configuration files for the ANQR (Agentic Number Query Runner) Openclaw runtime.
- **settings/** - This directory contains runtime configuration settings for the Openclaw voice agent system.
- **workspace/** - This directory contains the agent workspace configuration for the OpenCLAW runtime system.
- **workspace-voice/** - This directory contains the OpenClaw voice agent's workspace configuration files.

## 3. Overall Directory Function

In practice, child directories split the area into smaller focused modules. The README content below
is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **No dedicated runtime dependency** - This directory mainly stores generated assets or supporting files.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
