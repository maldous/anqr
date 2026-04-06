# ANQR Openclaw Config - Credentials

## 1. Directory Overview

This directory contains credential configuration files for the Openclaw Discord integration within
the ANQR (Agentic Number Query Runner) runtime. These JSON files manage Discord user pairing and
allow-list configurations that control access to the Openclaw gateway system. It currently contains
2 files and 0 subdirectories.

## 2. File Summaries

### Files

- **discord-default-allowFrom.json** - Discord allow-list configuration file. Contains a version field set to 1 and an allowFrom array containing a single Discord user ID (704669724088336384). This defines the default allowed users who can access the Openclaw Discord gateway.
- **discord-pairing.json** - Discord user pairing configuration file. Contains a version field set to 1 and an empty requests array. This file is designed to track Discord user pairing requests for authentication purposes.

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, the files in this directory are intended to be consumed together. The README content
below is aligned to the current immediate directory contents.

## 4. Usage Instructions

This directory is primarily consumed through its files and child modules rather than a single entry point.

## 5. Dependencies

- **No dedicated runtime dependency** - This directory mainly stores generated assets or supporting files.

## 6. Additional Comments

- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
