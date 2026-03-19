# `@anqr/contracts-analyze`

Portable, shape-only contracts for QR analysis results and related nouns.

This package owns:
- analysis result DTOs
- content classification nouns
- error and ECC enums
- geometry, timing, color, and capacity result shapes

This package must not own:
- analyzer runtime behavior
- decoder implementations
- stores, hooks, or UI state
- adapters, logging, or framework bindings
