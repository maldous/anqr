# Incident Fingerprint

## Purpose
Directory for Linear ingestion, reconciliation, or issue management; immediate files include `build-fingerprint-marker.mjs`, `generate-incident-fingerprint.mjs`, `index.mjs`.

## Contents
- 3 immediate files
- 0 child directories

## Key Files
- `build-fingerprint-marker.mjs` - Exports `buildFingerprintMarker`, the main helper defined in this file.
- `generate-incident-fingerprint.mjs` - Exports `generateIncidentFingerprint`, the main helper defined in this file.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.

## Subdirectories
- No child directories in this directory.

## Operational Notes
- Current on-disk inventory: 3 immediate files and 0 child directories.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus
Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
