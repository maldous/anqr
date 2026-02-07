# ANQR Risk Register (Initial)

| ID | Area | Risk | Severity | Notes | Status |
|---|---|---|---|---|---|
| R1 | Overlay blend modes | Overlay mode implementations may diverge from standard blend math or be incomplete across modes. | High | Core + canvas blend mode tests now cover reference math paths; keep regression checks in CI. | Mitigating |
| R2 | Scanability | Visual effects (overlay, gradients, dithering, animation) can break QR decoding. | High | Robustness + safety suites added; enforcement thresholds still need ongoing tuning with real-world fixtures. | Mitigating |
| R3 | Client/Server parity | Share URL params vs Netlify function mapping mismatches. | High | Parity is 169/169 with unit guard in CI. | Mitigated |
| R4 | Knowledge drift | knowledge.md is outdated vs current module layout. | Medium | Knowledge docs and gap notes updated to current module layout. | Mitigated |
| R5 | i18n completeness | Missing translations / English leaks across locales. | Medium | Regression guard in place; fully untranslated `rm` removed from active supported locales; high-confidence leak checker now filters technical glossary noise. | Mitigated |
| R6 | Performance | Animation + overlay processing may cause frame drops on mobile. | Medium | Bundle baseline captured in `reports/performance-bundle-audit.md`; i18n bundle weight identified as dominant artifact risk. | Mitigating |
| R7 | Output correctness | Export formats/metadata may not match UI selections or server output. | Medium | Netlify integration tests assert decode correctness and response headers (incl. content-type/cache/etag/CORS). | Mitigating |
| R8 | Analyze coverage | Analyze UI might omit key metrics or diagnostics. | Medium | Geometry/palette/timing diagnostics now surfaced and export-backed. | Mitigated |
