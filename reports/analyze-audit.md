# Analyze Section Audit (2026‑02‑07)

## What’s displayed today
- Status: success/failure, confidence, warnings, export JSON.
- Summary bar: version, ECC, mask, encoding mode, content type, contrast badge, module count, payload length/bytes, quiet zone status, image dimensions.
- Previews: original image + reproduced QR.
- Payload detail + copy.
- Content analysis (URL/WiFi/vCard/etc.).
- QR structure + encoding + capacity + structural patterns.
- Capacity by mode + encoding efficiency.
- Decoder metadata (version/mask/ECC/errors/erasures/raw bits/orientation/segments).
- Format info, image properties, colors/contrast, spatial analysis.
- Advanced: hex dump, module matrix, debug log.

## Data present but not surfaced (or buried)
- Decoder geometry (finder centers/corners, bounding box, rotation/tilt metrics).
- dataBytes from decoder vs computed payload bytes.
- Erasures/orientation not promoted to summary.
- Safety analyzer outputs (scan simulation, min module size/quiet zone validation, readability heatmap) not integrated.
- Dominant colors not shown.
- URL UTM fields computed but not surfaced.

## Suggested additions
- Geometry panel: bounding box, finder distances, rotation summary.
- Decoder bytes vs payload bytes row.
- Scannability/quality panel (module size vs min, quiet zone vs min, scan simulation).
- Dominant color palette (top 3) with percentages.
- Promote orientation + erasures to summary.

## Test hooks
Add `data-testid` (or `data-qa`) to key blocks:
- Inputs: current‑qr, upload, url‑input, url‑submit, camera.
- Status blocks: analyze‑success, analyze‑error, analyze‑warnings.
- Summary chips: version/ecc/mask/encoding/content‑type/contrast/module‑count/payload‑chars/payload‑bytes/quiet‑zone/image‑dims.
- Collapsible sections + key detail rows.
- Module matrix canvas + reproduced canvas.
