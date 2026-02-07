# Android Export Verification Checklist

Date: 2026-02-07
Device: Samsung Galaxy Tab S6 Lite (`T612B`, serial `DI8T45BAZ5NB5TLV`)
Android Version: 14 (SDK 34)
ANQR Build/Commit: local debug build from workspace (post MediaStore + Analyze export fixes)
Tester: user + Codex session

## Scope
Manual verification of export behavior on Android for Documents/Downloads visibility and openability.

## Preconditions
- Install latest Android build.
- Grant storage/media permissions requested by app.
- Ensure at least one file manager app is installed.
- Ensure at least one image viewer app is installed.

## Test Matrix
1. Export PNG from generator.
2. Export SVG from generator.
3. Export JSON from Analyze page.
4. Export after using image overlay.
5. Export after using animated content (if enabled for selected format).

## Steps (Run for each matrix row)
1. Generate QR with known content.
2. Tap export and select target format.
3. Confirm success toast/message appears.
4. Open file manager:
- Verify file appears in expected directory (`Documents` and/or `Downloads`).
- Verify filename pattern and extension are correct.
- Verify file size is non-zero.
5. Open file with external app:
- Verify file opens successfully.
- For image formats, verify rendered QR visually matches in-app preview.
6. Scan exported QR with external scanner app:
- Verify payload decodes correctly.

## Pass/Fail Criteria
- PASS: All rows produce visible, openable files with correct payload decode.
- FAIL: Any missing file, wrong extension, open failure, or decode mismatch.

## Results
- PNG: NOT VERIFIED in this run
- SVG: NOT VERIFIED in this run
- JSON: PASS
- Overlay export: NOT VERIFIED in this run
- Animated export: PASS (GIF saved successfully)

## Notes / Defects
- Fixed during this run: Android native export path now uses implemented plugin method (`saveToDocuments`) via `MediaStoreWriter.saveBase64ToDocuments` fallback order.
- Fixed during this run: Analyze JSON export now uses native save path and visible native export button label.
- Fixed during this run: AdMob banner fallback to test IDs when prod IDs are unset in runtime env.
- Evidence captured in session log:
  - "test ad working"
  - "export saved as gif"
  - "export json succesful"
