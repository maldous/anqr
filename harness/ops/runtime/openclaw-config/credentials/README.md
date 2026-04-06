# ANQR Openclaw Config - Credentials

## 1. Directory Overview

This directory contains credential configuration files for the Openclaw Discord integration within the ANQR (Agentic Number Query Runner) runtime. These JSON files manage Discord user pairing and allow-list configurations that control access to the Openclaw gateway system.

## 2. File Summaries

- **discord-pairing.json** - Discord user pairing configuration file. Contains a version field set to 1 and an empty requests array. This file is designed to track Discord user pairing requests for authentication purposes.

- **discord-default-allowFrom.json** - Discord allow-list configuration file. Contains a version field set to 1 and an allowFrom array containing a single Discord user ID (704669724088336384). This defines the default allowed users who can access the Openclaw Discord gateway.

## 3. Overall Directory Function

This directory serves as the credential configuration layer for the Openclaw Discord integration. The files work together to provide:

- **Access Control**: The `discord-default-allowFrom.json` file defines which Discord users are permitted to interact with the Openclaw gateway system by default.

- **Pairing Management**: The `discord-pairing.json` file tracks pending Discord user pairings, currently initialized with an empty requests array ready to store future pairing requests.

These configuration files are typically consumed by the Openclaw Discord gateway runtime to enforce user authentication and authorization policies.

## 4. Usage Instructions

This directory is primarily used through imports by the Openclaw Discord gateway system. The configuration files are read at runtime to determine access permissions.

To modify access permissions, edit the `allowFrom` list in `discord-default-allowFrom.json` to add or remove allowed Discord user IDs.

To track new Discord user pairings, add entries to the `requests` array in `discord-pairing.json`.

## 5. Dependencies

### Internal Dependencies

- **../openclaw-config.mjs** - Parent configuration module that imports these credential files
- **Runtime Discord gateway** - Requires these files for access control

### Runtime Requirements

- Node.js with JSON file system access
- Valid JSON syntax in credential files

## 6. Additional Comments

- **Security Note**: The allowFrom list currently contains a single Discord user ID. Additional user IDs should be added with caution, as they grant access to the Openclaw gateway.

- **Versioning**: Both files use a "version": 1 field for potential future schema migration support.

- **Pairing Workflow**: The discord-pairing.json file is designed to store pending Discord user pairings that require approval before being added to the allowFrom list.