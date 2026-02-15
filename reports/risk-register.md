# ANQR Risk Register (Iteration 2)

| ID | Area | Risk | Severity | Notes | Status |
|---|---|---|---|---|---|
| R1 | Overlay blend modes | Overlay mode implementations may diverge from expected contrast behavior and become non-scannable on specific fixtures. | High | Full matrix now shows Tier A 120/120 with no production failures. Blend-path rescue logic and occupancy hardening are in place; Tier B residuals remain diagnostic-only. | Mitigated |
| R2 | Scanability | Visual effects (overlay, gradients, dithering, animation) can break QR decoding. | High | Tier A is now fully green (120/120). Remaining Tier B failures are under `scanGateProfile=off` and treated as tunable tradeoffs rather than production blockers. | Mitigated |
| R3 | Client/Server parity | Share URL params vs Netlify function mapping mismatches. | High | Parity remains closed (169/169) with test guard coverage. | Mitigated |
| R4 | Knowledge drift | Knowledge and status docs diverge from runtime behavior. | Medium | Iteration docs reconciled and refreshed to current matrix/signoff baseline. | Mitigated |
| R5 | i18n completeness | Missing translations / English leaks across locales. | Medium | Regression guard remains in place; no new locale leakage blocker identified. | Mitigated |
| R6 | Performance | Animation + overlay processing and bundle footprint may impact mobile performance. | Medium | i18n/static deduplication landed; bundle budgets are enforced in `make quality`/signoff and currently passing (`i18n 21433.4 KiB`, under warn/max thresholds). | Mitigated |
| R7 | Output correctness | Export formats/metadata may not match expected behavior on all runtime targets. | Medium | Android export checklist is now closed on emulator evidence (PNG/SVG/overlay/animated all PASS) with file-level and MediaStore log verification in `reports/android-export-verification.md`. | Mitigated |
| R8 | Analyze coverage | Analyze UI might omit key diagnostics. | Medium | Analyze/export coverage remains present; no new iteration-2 analyzer gap identified. | Mitigated |
