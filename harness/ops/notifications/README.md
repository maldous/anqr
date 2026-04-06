# ANQR Notifications

## 1. Directory Overview

Notification modules for the ANQR (Agentic Number Query Runner) harness to send alerts via email and
Discord. This directory provides the communication layer that enables the harness to notify users
and systems about task status, completion, errors, and other important events. It currently contains
1 file and 1 subdirectory.

## 2. File Summaries

### Files

- **notify.mjs** - Auto-generated facade module that re-exports from `./notify/index.mjs` and `./notify/runtime.mjs`. Provides the CLI entry point for email notifications via msmtp with rate limiting and deduplication.

### Child Directories

- **notify/** - This directory contains the notification automation module for the ANQR (Agentic Number Query Runner) harness.

## 3. Overall Directory Function

In practice, child directories split the area into smaller focused modules. The README content below
is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
