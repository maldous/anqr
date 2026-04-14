# Symphony

## Purpose

Directory for fleet recovery, quarantine, and health enforcement; immediate files include `symphony-agent.mjs`, `watchdog-monitor.mjs`, `WORKFLOW.md`, with child directories `symphony-agent/`, `watchdog-monitor/`.

## Contents

- 3 immediate files
- 2 child directories

## Key Files

- `symphony-agent.mjs` - JavaScript/TypeScript module used by this directory.
- `watchdog-monitor.mjs` - JavaScript/TypeScript module used by this directory.
- `WORKFLOW.md` - Documentation file headed by "Archived Workflow Note".

## Subdirectories

- `symphony-agent/` - Directory for runtime service bootstrap or environment support; immediate files include `allowed-commands.mjs`, `assert-mutation-context.mjs`, `build-issue-prompt.mjs`, `call-llm.mjs`, and others.
- `watchdog-monitor/` - Directory for fleet recovery, quarantine, and health enforcement; immediate files include `args.mjs`, `bridge-arg.mjs`, `check-bridge-health.mjs`, `codebuff-port.mjs`, and others.

## Operational Notes

- Current on-disk inventory: 3 immediate files and 2 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether runtime bootstrap assumptions and configuration boundaries still match the service topology described in the ADRs and workspace model.
