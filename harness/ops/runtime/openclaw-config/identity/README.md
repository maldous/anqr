# ANQR Openclaw Config - Identity

## 1. Directory Overview

This directory contains identity and device authentication configuration files for the ANQR (Agentic
Number Query Runner) Openclaw runtime. It stores device credentials, authentication tokens, and key
material required for device authentication and operator access control. It currently contains 2
files and 0 subdirectories.

## 2. File Summaries

### Files

- **device-auth.json** - Configuration file containing authentication tokens and operator authorization. Contains: - `version`: Schema version (currently 1) - `deviceId`: Associated device identifier (placeholder: "CHANGEME") - `tokens.operator`: Operator token configuration including: - `token`: JWT or access token for operator authentication - `role`: Role assignment (e.g., "operator") - `scopes`: Array of granted permissions (e.g., ["operator.admin", "operator.read", "operator.write"]) - `updatedAtMs`: Unix timestamp when token was last updated
- **device.json** - Configuration file containing device identification and cryptographic key material. Contains: - `version`: Schema version (currently 1) - `deviceId`: Unique device identifier (placeholder: "CHANGEME") - `publicKeyPem`: RSA/Ed25519 public key in PEM format (placeholder: "CHANGEME") - `privateKeyPem`: RSA/Ed25519 private key in PEM format (placeholder: "CHANGEME") - `createdAtMs`: Unix timestamp in milliseconds when the device was registered

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
