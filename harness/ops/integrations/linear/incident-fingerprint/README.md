# ANQR Linear Incident Fingerprint

## 1. Directory Overview

This directory contains functionality for generating unique fingerprints for incidents in the ANQR (Agentic Number Query Runner) Linear integration. Fingerprints enable efficient tracking and deduplication of recurring incidents by creating stable, deterministic identifiers based on incident characteristics.

## 2. File Summaries

### generate-incident-fingerprint.mjs

Provides the core fingerprint generation logic. Exports `generateIncidentFingerprint(incident)` which:
- Takes an incident object with `type`, `service`, and optional `errorSignature` properties
- Normalizes the error signature to the first 100 characters to handle minor variance
- Creates a stable fingerprint input string: `type:service:errorSignature`
- Generates a SHA-256 hash and returns the first 16 characters for readability

### build-fingerprint-marker.mjs

Provides a utility for embedding fingerprints in external systems. Exports `buildFingerprintMarker(fingerprint)` which:
- Wraps a fingerprint in an HTML comment format: `<!-- incident-fingerprint: {fingerprint} -->`
- Enables fingerprint storage in HTML documents or web content

### index.mjs

Generated facade index that re-exports the public API:
- `generateIncidentFingerprint` from `./generate-incident-fingerprint.mjs`
- `buildFingerprintMarker` from `./build-fingerprint-marker.mjs`

## 3. Overall Directory Function

This directory provides the incident fingerprinting system for the Linear integration. The fingerprint system enables:

- **Deduplication**: Recurring incidents with the same type, service, and error signature produce identical fingerprints, allowing the system to detect and handle repeat issues
- **Tracking**: Fingerprints serve as stable identifiers for incident correlation across multiple occurrences
- **Normalization**: By truncating error signatures to 100 chars, minor variations in error messages don't create different fingerprints

The workflow: `generateIncidentFingerprint` creates the fingerprint, optionally used with `buildFingerprintMarker` to embed in external content.

## 4. Usage Instructions

Import and use the fingerprint functions:

```javascript
import { generateIncidentFingerprint, buildFingerprintMarker } from "./ops/integrations/linear/incident-fingerprint/index.mjs";

// Generate fingerprint for an incident
const fingerprint = generateIncidentFingerprint({
  type: "error",
  service: "api-gateway",
  errorSignature: "Connection refused to upstream service"
});

// Create HTML marker for embedding
const marker = buildFingerprintMarker(fingerprint);
// Output: <!-- incident-fingerprint: a1b2c3d4e5f67890 -->
```

## 5. Dependencies

### Runtime Dependencies

- **Node.js** - Uses `node:crypto` module for SHA-256 hashing
- **ESM** - Uses ES modules (.mjs extension)

### Internal Dependencies

- None (self-contained module)

## 6. Additional Comments

- **Fingerprint Format**: Uses first 16 characters of SHA-256 hash for readability while maintaining reasonable collision resistance
- **Stability**: The fingerprint is deterministic - same inputs always produce same output
- **Normalization Strategy**: Truncating error signature to 100 chars prevents minor message variations from creating different fingerprints (e.g., timestamps in error messages)
- **Use Case**: Primarily used by other Linear integration modules for incident correlation and deduplication