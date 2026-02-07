# i18n Audit (2026‑02‑07)

## Line‑count completeness
- All `src/i18n/locales/txt/*.txt` match en‑US line count (1802).
- All `src/i18n/static/txt/*.txt` match en‑US line count (1337).

## Clear English leaks / corruption
1) **rm (Romansh)**
   - `locales/txt/rm.txt`: 1802/1802 lines identical to en‑US.
   - `static/txt/rm.txt`: 1336/1337 lines identical to en‑US.
   - `src/i18n/static/rm/*` content remains English.
   - **Action:** translate rm or remove locale.

2) **hi‑IN (locales/txt)**
   - Line 16: "⚠️ May affect scannability" (English)
   - Line 89: "Failed to save file: {{error}}" (English)
   - Line 90: placeholder corrupted; should be `{{filename}}`.
   - **Action:** translate lines 16/89 and restore placeholder.

3) **am (static/txt)**
   - Lines 1038–1061 contain long English paragraphs (case‑study section).
   - **Action:** translate or replace.

4) **ne‑NP (static/txt)**
   - Line 847 contains an English sentence fragment.
   - **Action:** translate.

5) **is‑IS (static/txt)**
   - Lines 808–812 include full English sentences.
   - **Action:** translate.

6) **lv (static/txt)**
   - Lines 353/356 are English headings.
   - **Action:** translate.

## Tooling recommendation
Add `scripts/check-i18n-txt.(js|py)` to:
- Verify line counts vs en‑US for all locales.
- Flag exact English matches in non‑English locales (with whitelist for URLs, short codes, legal tags).
- Flag English‑heavy lines (ASCII‑heavy, long strings) to catch embedded English.
- Fail CI if any leaks exceed threshold.
