# Openclaw Config

## Purpose
Repository copy of the OpenClaw gateway and workspace configuration that the harness expects to sync into `~/.openclaw/` for Discord, voice, approvals, models, and workspace identity.

## Contents
- 7 immediate files
- 11 child directories

## Key Files
- `.env.example` - Environment variable template or inventory file.
- `clawdbot.json` - JSON configuration/data file with top-level keys `meta`, `agents`, `commands`, `messages`, `talk`, `gateway`, `wizard`.
- `config.json` - JSON configuration/data file with top-level keys `$schema`, `tts`, `gateway`.
- `exec-approvals.json` - JSON configuration/data file with top-level keys `version`, `socket`, `defaults`, `agents`.
- `models.json` - JSON configuration/data file with top-level keys `providers`, `agents`.
- `openclaw.json` - JSON configuration/data file with top-level keys `meta`, `env`, `wizard`, `auth`, `models`, `agents`, `tools`, `messages`, and others.
- `update-check.json` - JSON configuration/data file with top-level keys `lastCheckedAt`, `lastNotifiedVersion`, `lastNotifiedTag`.

## Subdirectories
- `agents/` - Directory for OpenClaw gateway/runtime configuration, with child directories `main/`, `voice/`.
- `canvas/` - Directory for OpenClaw gateway/runtime configuration; immediate files include `index.html`.
- `credentials/` - Directory for OpenClaw gateway/runtime configuration; immediate files include `discord-default-allowFrom.json`, `discord-pairing.json`.
- `cron/` - Directory for OpenClaw gateway/runtime configuration; immediate files include `jobs.json`.
- `devices/` - Directory for OpenClaw gateway/runtime configuration; immediate files include `paired.json`, `pending.json`.
- `identity/` - Directory for OpenClaw gateway/runtime configuration; immediate files include `device-auth.json`, `device.json`.
- `settings/` - Directory for OpenClaw gateway/runtime configuration; immediate files include `tts.json`.
- `skills/` - Directory for OpenClaw gateway/runtime configuration.
- `subagents/` - Directory for OpenClaw gateway/runtime configuration; immediate files include `runs.json`.
- `workspace/` - Directory for OpenClaw gateway/runtime configuration; immediate files include `AGENTS.md`, `HEARTBEAT.md`, `IDENTITY.md`, `plan.md`, and others.
- `workspace-voice/` - Directory for OpenClaw gateway/runtime configuration; immediate files include `AGENTS.md`, `BOOTSTRAP.md`, `HEARTBEAT.md`, `IDENTITY.md`, and others.

## Operational Notes
- This tree is configuration, not executable orchestration code, but it materially shapes Discord and OpenClaw behavior.
- The harness depends on operators syncing selected files from this directory into the live OpenClaw config home.

## Review Focus
Check which files are true source-of-truth config, which are runtime-state placeholders, and how the Discord, voice, and approval settings line up with the systemd service topology.
