# ANQR Openclaw Config - Identity

## 1. Directory Overview

This directory contains identity and device authentication configuration files for the ANQR (Agentic Number Query Runner) Openclaw runtime. It stores device credentials, authentication tokens, and key material required for device authentication and operator access control.

## 2. File Summaries

### device.json

Configuration file containing device identification and cryptographic key material. Contains:
- `version`: Schema version (currently 1)
- `deviceId`: Unique device identifier (placeholder: "CHANGEME")
- `publicKeyPem`: RSA/Ed25519 public key in PEM format (placeholder: "CHANGEME")
- `privateKeyPem`: RSA/Ed25519 private key in PEM format (placeholder: "CHANGEME")
- `createdAtMs`: Unix timestamp in milliseconds when the device was registered

### device-auth.json

Configuration file containing authentication tokens and operator authorization. Contains:
- `version`: Schema version (currently 1)
- `deviceId`: Associated device identifier (placeholder: "CHANGEME")
- `tokens.operator`: Operator token configuration including:
  - `token`: JWT or access token for operator authentication
  - `role`: Role assignment (e.g., "operator")
  - `scopes`: Array of granted permissions (e.g., ["operator.admin", "operator.read", "operator.write"])
  - `updatedAtMs`: Unix timestamp when token was last updated

## 3. Overall Directory Function

This directory serves as the identity layer for Openclaw device authentication. The files work together to establish device trust and operator authorization:

- **device.json** provides the cryptographic identity (public/private key pair) used to prove device identity during authentication handshake
- **device-auth.json** stores the access tokens and permission scopes granted to the operator role on this device

Together, they enable the Openclaw runtime to authenticate with external services and authorize operations based on the configured permissions. The CHANGEME placeholders indicate these files require configuration with actual credentials before use.

## 4. Usage Instructions

### Initial Setup

1. Generate a new key pair (RSA or Ed25519 recommended)
2. Update `device.json` with your generated keys and a unique deviceId
3. Obtain an operator token from your identity provider
4. Update `device-auth.json` with the token, role, and scopes

### Token Refresh

When the operator token expires or needs rotation:
1. Obtain a new token from your identity provider
2. Update the `tokens.operator.token` field in `device-auth.json`
3. Update the `tokens.operator.updatedAtMs` timestamp

### Security Notes

- Never commit `device.json` or `device-auth.json` to version control with real credentials
- The private key should be stored securely and never shared
- Token files may contain sensitive data - handle with appropriate caution
- Consider using environment variables or a secrets manager for production deployments

## 5. Dependencies

### Runtime Requirements

- **Node.js** - For any scripts that read/write these configuration files
- **Cryptographic library** - For key generation (OpenSSL, Node.js crypto, or similar)

### External Services

- **Identity Provider** - Issues operator tokens (configured externally)
- **Openclaw Runtime** - Reads these files for device authentication

### Prerequisites

- Valid operator token with appropriate scopes
- Generated key pair (public/private)
- Unique device identifier

## 6. Additional Comments

- **Placeholder Values**: Both JSON files contain "CHANGEME" placeholders that must be replaced with actual values before the identity system will function

- **Versioning**: Both files use a `version` field (currently "1") to allow for future schema migrations

- **Timestamp Format**: All timestamps are in Unix milliseconds since epoch

- **Scope Format**: Token scopes follow a dot-separated naming convention (e.g., "operator.admin", "operator.read", "operator.write") for role-based access control

- **Directory Location**: This directory is part of the Openclaw config hierarchy under `ops/runtime/openclaw-config/`, which contains related credentials, settings, and workspace configurations