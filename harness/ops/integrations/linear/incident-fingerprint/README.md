# ANQR Linear Incident Fingerprint

## 1. Directory Overview

This directory implements **ANQR Linear Incident Fingerprint** within the ANQR harness. Key immediate entries include `index.mjs`, `generate-incident-fingerprint.mjs`, `build-fingerprint-marker.mjs`. The current inventory is 3 non-README files and 0 subdirectories.

## 2. File Summaries

### Files

- **build-fingerprint-marker.mjs** - Exports `buildFingerprintMarker`, which builds fingerprint marker.
- **generate-incident-fingerprint.mjs** - Exports `generateIncidentFingerprint`, which implements generate incident fingerprint.
- **index.mjs** - Facade module that re-exports public members from `./generate-incident-fingerprint.mjs`, `./build-fingerprint-marker.mjs`.

## 3. Overall Directory Function

The directory primarily provides reusable modules that are imported by sibling runtime, orchestration, or validation code. Verified immediate files in this directory use Linear integration.

## 4. Usage Instructions

```javascript
import * as moduleApi from "./ops/integrations/linear/incident-fingerprint/index.mjs";
```

## 5. Dependencies

- **Node.js built-ins** - `node:crypto`

## 6. Additional Comments

- No direct standalone runtime entry point is defined in the immediate directory contents.
