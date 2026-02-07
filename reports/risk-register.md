# ANQR Risk Register (Initial)

| ID | Area | Risk | Severity | Notes | Status |
|---|---|---|---|---|---|
| R1 | Overlay blend modes | Overlay mode implementations may diverge from standard blend math or be incomplete across modes. | High | Multiple overlay modes in store; render-modes covers a subset. Needs audit + tests. | Open |
| R2 | Scanability | Visual effects (overlay, gradients, dithering, animation) can break QR decoding. | High | Need multi-decoder scanability suite + enforcement thresholds. | Open |
| R3 | Client/Server parity | Share URL params vs Netlify function mapping mismatches. | High | Previously documented 163 vs 110 keys; verify current share-links vs netlify. | Open |
| R4 | Knowledge drift | knowledge.md is outdated vs current module layout. | Medium | Update required; gap notes captured. | Open |
| R5 | i18n completeness | Missing translations / English leaks across locales. | Medium | Requires automated scan. | Open |
| R6 | Performance | Animation + overlay processing may cause frame drops on mobile. | Medium | Profiling needed. | Open |
| R7 | Output correctness | Export formats/metadata may not match UI selections or server output. | Medium | Unit tests + parity checks. | Open |
| R8 | Analyze coverage | Analyze UI might omit key metrics or diagnostics. | Medium | Expand metrics list & JSON export. | Open |
