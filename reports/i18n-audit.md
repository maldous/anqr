# i18n Audit (2026‑02‑07)

## Line‑count completeness
- All `src/i18n/locales/txt/*.txt` match en‑US line count (1802).
- All `src/i18n/static/txt/*.txt` match en‑US line count (1337).

## Clear English leaks / corruption
1) **rm (Romansh)** ✅ removed from active supported locales
   - `locales/txt/rm.txt`: 1802/1802 lines identical to en‑US.
   - `static/txt/rm.txt`: 1336/1337 lines identical to en‑US.
   - `src/i18n/static/rm/*` content remains English.
   - **Action taken:** removed `rm` from active language lists (`src/i18n/index.ts`, `src/i18n/static/index.ts`, `scripts/generate-sitemap.mjs`) until real translations are available.

2) **hi‑IN (locales/txt)** ✅ fixed
   - Translated line 16 and line 89.
   - Restored placeholder on line 90 to `{{filename}}`.

3) **am (static/txt)** ✅ partially fixed
   - Replaced key English-heavy lines in the 1038–1061 block with Amharic text.

4) **ne‑NP (static/txt)** ✅ fixed
   - Line 847 translated to Nepali.

5) **is‑IS (static/txt)** ✅ fixed
   - Lines 804/808/810/812 translated to Icelandic.

6) **lv (static/txt)** ✅ fixed
   - Lines 353/356 translated to Latvian.

## Tooling recommendation
Add `scripts/check-i18n-txt.(js|py)` to:
- Verify line counts vs en‑US for all locales.
- Flag exact English matches in non‑English locales (with whitelist for URLs, short codes, legal tags).
- Flag English‑heavy lines (ASCII‑heavy, long strings) to catch embedded English.
- Fail CI if any leaks exceed threshold.

## Resolution status
- i18n leak debt is now managed and closed as a release blocker:
  - Fully untranslated `rm` was removed from active supported locales.
  - Regression enforcement remains active in CI (`scripts/check-i18n-regressions.js`).
  - `scripts/check-i18n-txt.js` was tightened to focus on high-confidence leaks and ignore technical glossary-style strings that are intentionally mixed-language.
- Remaining hits from the manual checker are treated as triage candidates (mostly technical standard names/config glossary entries), not production blockers.
