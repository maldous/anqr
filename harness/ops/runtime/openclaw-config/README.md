# Openclaw Config

## Purpose
Source-controlled OpenClaw configuration tree that supplies gateway auth, model routing, approval, Discord, voice, and workspace settings expected by the live OpenClaw runtime.

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
- `agents/` - Agents scope; child directories include `main/`, `voice/`.
- `canvas/` - Canvas scope; immediate files include `index.html`.
- `credentials/` - Credentials scope; immediate files include `discord-default-allowFrom.json`, `discord-pairing.json`.
- `cron/` - Cron scope; immediate files include `jobs.json`.
- `devices/` - Devices scope; immediate files include `paired.json`, `pending.json`.
- `identity/` - Identity scope; immediate files include `device-auth.json`, `device.json`.
- `settings/` - Settings scope; immediate files include `tts.json`.
- `skills/` - Skills scope; no tracked content beyond README files.
- `subagents/` - Subagents scope; immediate files include `runs.json`.
- `workspace/` - Workspace scope; immediate files include `AGENTS.md`, `HEARTBEAT.md`, `IDENTITY.md`, `plan.md`, and others.
- `workspace-voice/` - Workspace Voice scope; immediate files include `AGENTS.md`, `BOOTSTRAP.md`, `HEARTBEAT.md`, `IDENTITY.md`, and others.

## Operational Notes
- Current on-disk inventory: 7 immediate file(s) and 11 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
