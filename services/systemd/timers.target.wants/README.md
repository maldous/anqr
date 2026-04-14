# Timers.target

## Purpose

Directory for systemd topology and host runtime configuration; immediate files include `anqr-email-ingest.timer`, `anqr-linear-export.timer`, `anqr-nightly.timer`, `anqr-rag-rebuild.timer`, and others.

## Contents

- 5 immediate files
- 0 child directories

## Key Files

- `anqr-email-ingest.timer` - systemd unit for ANQR Email Ingest Timer (every 5 minutes).
- `anqr-linear-export.timer` - systemd unit for ANQR Linear issue export timer.
- `anqr-nightly.timer` - systemd unit for ANQR Symphony nightly operations timer.
- `anqr-rag-rebuild.timer` - systemd unit for ANQR RAG vector index rebuild timer.
- `anqr-worktree-health.timer` - systemd unit for ANQR Worktree Fleet Health Timer.

## Subdirectories

- No child directories in this directory.

## Operational Notes

- Current on-disk inventory: 5 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Confirm that the unit descriptions, dependencies, environment files, and startup targets still match the maintained harness runtime topology.
