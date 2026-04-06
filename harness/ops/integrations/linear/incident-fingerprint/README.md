# ANQR Linear Incident Fingerprint

## 1. Directory Overview

This directory contains functionality for generating unique fingerprints for incidents in the ANQR
(Agentic Number Query Runner) Linear integration. Fingerprints enable efficient tracking and
deduplication of recurring incidents by creating stable, deterministic identifiers based on incident
characteristics. It currently contains 3 files and 0 subdirectories.

## 2. File Summaries

### Files

- **build-fingerprint-marker.mjs** - Provides a utility for embedding fingerprints in external systems. Exports `buildFingerprintMarker(fingerprint)` which: - Wraps a fingerprint in an HTML comment format: `<!-- incident-fingerprint: {fingerprint} -->` - Enables fingerprint storage in HTML documents or web content
- **generate-incident-fingerprint.mjs** - Provides the core fingerprint generation logic. Exports `generateIncidentFingerprint(incident)` which: - Takes an incident object with `type`, `service`, and optional `errorSignature` properties - Normalizes the error signature to the first 100 characters to handle minor variance - Creates a stable fingerprint input string: `type:service:errorSignature` - Generates a SHA-256 hash and returns the first 16 characters for readability
- **index.mjs** - Generated facade index that re-exports the public API: - `generateIncidentFingerprint` from `./generate-incident-fingerprint.mjs` - `buildFingerprintMarker` from `./build-fingerprint-marker.mjs`

### Child Directories

This directory does not contain child directories.

## 3. Overall Directory Function

In practice, `index.mjs` acts as the public entry point. The README content below is aligned to the
current immediate directory contents.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./index.mjs";
```

## 5. Dependencies

- **Node.js** - Required for the JavaScript and TypeScript modules in this directory.

## 6. Additional Comments

- This directory exposes a public API through `index.mjs`.
- This README has been regenerated against the current immediate directory contents so every listed entry exists in the directory.
