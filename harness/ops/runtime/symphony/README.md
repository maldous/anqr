# Symphony

## Purpose
Symphony contains the code, configuration, or support files that implement this part of the harness architecture.

## Contents

- 3 immediate files
- 2 child directories

## Key Files
- `symphony-agent.mjs` - JavaScript/TypeScript module used by this directory.
- `watchdog-monitor.mjs` - JavaScript/TypeScript module used by this directory.
- `WORKFLOW.md` - Markdown documentation file headed by "# Archived Workflow Note".

## Subdirectories
- `symphony-agent/` - Symphony Agent scope; immediate files include `allowed-commands.mjs`, `assert-mutation-context.mjs`, `build-issue-prompt.mjs`, `call-llm.mjs`, and others.
- `watchdog-monitor/` - Watchdog Monitor scope; immediate files include `args.mjs`, `bridge-arg.mjs`, `check-bridge-health.mjs`, `codebuff-port.mjs`, and others.

## Operational Notes
- Current on-disk inventory: 3 immediate file(s) and 2 child directories.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus
Check that the current implementation in this directory still matches its intended role in the harness architecture.
