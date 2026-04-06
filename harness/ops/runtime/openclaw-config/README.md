# ANQR OpenClaw Configuration

## 1. Directory Overview

This directory holds configuration data for **ANQR OpenClaw Configuration** within the ANQR harness. Key immediate entries include `openclaw.json`, `exec-approvals.json`, `models.json`, `clawdbot.json`. The current inventory is 6 non-README files and 6 subdirectories.

## 2. File Summaries

### Files

- **.env.example** - Example configuration file used as a template for local setup.
- **clawdbot.json** - JSON configuration or data file with top-level keys `meta`, `agents`, `commands`, `messages`, `talk`, `gateway`, `wizard`.
- **config.json** - JSON configuration or data file with top-level keys `$schema`, `tts`, `gateway`.
- **exec-approvals.json** - JSON configuration or data file with top-level keys `version`, `socket`, `defaults`, `agents`.
- **models.json** - JSON configuration or data file with top-level keys `providers`, `agents`.
- **openclaw.json** - JSON configuration or data file with top-level keys `meta`, `env`, `wizard`, `auth`, `models`, `agents`, `tools`, `messages`.

### Subdirectories

- **agents/** - Contains **OpenClaw Agent Configuration**; it acts mainly as a namespace over child directories and has 2 child directories.
- **credentials/** - Contains **ANQR Openclaw Config - Credentials**; it holds configuration data and has 0 child directories.
- **identity/** - Contains **ANQR Openclaw Config - Identity**; it holds configuration data and has 0 child directories.
- **settings/** - Contains **ANQR Openclaw Config - Settings**; it holds configuration data and has 0 child directories.
- **workspace/** - Contains **ANQR Workspace**; it contains 7 immediate files and has 0 child directories.
- **workspace-voice/** - Contains **ANQR Voice Workspace**; it contains 7 immediate files and has 0 child directories.

## 3. Overall Directory Function

This directory primarily contributes configuration artifacts consumed by adjacent runtime code rather than executable logic of its own. Filenames and top-level keys show that the configuration targets OpenClaw, and model selection behavior.

## 4. Usage Instructions

This directory is consumed indirectly by adjacent runtime modules. No standalone executable entry point is defined here.

## 5. Dependencies

- Immediate files are configuration artifacts rather than import-bearing source modules.

## 6. Additional Comments

- Behavioral meaning for configuration-only files was inferred from keys and structure rather than from executable code in this directory.
