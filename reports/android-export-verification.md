# Android Export Verification Checklist

Date: 2026-02-15
Device: Android Emulator (`emulator-5554`, model `sdk_gphone64_x86_64`)
Android Version: 16 (SDK 36)
ANQR Build/Commit: local debug build from workspace (post overlay gallery native load fix + MediaStore export path)
Tester: Codex session (adb automation)

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
- PNG: PASS
- SVG: PASS
- JSON: PASS
- Overlay export: PASS
- Animated export: PASS (GIF saved successfully)

## Notes / Defects
- 2026-02-15 verification evidence (emulator run):
  - Overlay gallery selection now succeeds on native (`tsunami.jpg` selected and preview rendered).
  - Exported files observed in `/sdcard/Documents/ANQR`:
    - `anqr-qrcode.gif` (overlay/animated path), size `51711`, timestamp `2026-02-15 18:13`
    - `anqr-qrcode.png`, size `174360`, timestamp `2026-02-15 18:17`
    - `anqr-qrcode (1).svg`, size `232711`, timestamp `2026-02-15 18:18`
  - Log evidence confirms native writes via `MediaStoreWriter.saveToDocuments` and `MediaProvider` move-to-final-path for PNG/SVG.
- Defect fixed in this run:
  - Overlay gallery load failed on native WebView due cross-origin fetch path (`https://anqr.link/...`) causing `[OVERLAY] Failed to load gallery image`.
  - Resolved by using same-origin bundled public assets (`/tsunami.jpg`, `/king.gif`, `/logo.png`, `/test.png`) in `src/components/sections/OverlaySection.tsx`.
