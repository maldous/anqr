# ChatGPT Project Setup

## Project name

`ANQR 1.0 Product OS`

## Purpose

This project is the planning and governance brain for ANQR 1.0.

It is not the local executor. Local execution remains with Symphony, Codex, Linear, Ollama, systemd services, CI, and scripts.

## Files to upload to the ChatGPT Project

Upload these first:

- this entire bootstrap pack
- old architecture docs
- `tree.txt`
- `git.log.txt`
- sanitized Linear export
- sanitized harness/systemd summary
- any later UI/UX references
- any later deployment/runtime inventory docs

Do **not** upload:

- live tokens
- raw `.env` files
- unredacted systemd unit files containing secrets
- signing keys or credentials
- private certificates

## Recommended starter chats

Create these chats inside the Project:

1. `ANQR 1.0 program charter`
2. `ANQR 1.0 autonomy charter`
3. `ANQR 1.0 architecture standards`
4. `ANQR 1.0 harness architecture`
5. `ANQR 1.0 observability and logging`
6. `ANQR 1.0 testing strategy`
7. `ANQR 1.0 release and launch readiness`
8. `ANQR 1.0 Linear reboot and issue taxonomy`

## Suggested Project instructions

Use the following as the initial Project instructions:

```text
ANQR 1.0 is a doctrine-first, harness-first migration.

Treat ANQR as:
- a product platform
- a local autonomous harness
- a governance system
- a corrective-healing system
- a learning/improvement system

Always preserve:
- ANQR identity and existing external service continuity
- explicit ownership
- explicit authority boundaries
- explicit evidence requirements
- explicit rollback and approval requirements
- secrets/config hygiene
- product/harness separation

Never assume the old repo layout is the target.
Never start by migrating legacy files directly into main.
Prefer program doctrine, discovery controls, and standards before code.

When proposing work:
- separate product work from harness work
- separate human-only work from autonomous work
- make authority, evidence, risk, and rollback explicit
- keep recommendations compatible with local supervision and 24/7 unattended operation
```
