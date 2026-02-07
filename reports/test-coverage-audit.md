# Unit Test Coverage Audit (2026‑02‑07)

## Strong coverage
- **qr‑art**: generation, RS checks, regen flow, scannability.
- **qr‑encoder**: bit buffer, modes, RS blocks, alignment/mask logic.
- **qr‑generator (partial)**: overlay blend/intensity helpers.
- **share‑links (partial)**: param parity test.

## Major gaps
- **qr‑decoder** pipeline: binarizer/locator/perspective/RS decode/data decode.
- **qr‑generator**: dither pipelines, pixel‑matrix variants, overlay transforms, render loop, scaled render, cache behavior.
- **overlay**: crop + filters + watermark blending.
- **exporter**: PNG/GIF/SVG output + metadata.
- **payload‑generators**: payment/identity/enterprise payloads.
- **core**: color/contrast/gradient/harmony math.
- **qr‑analyzer**: safety checks + telemetry.

## Prioritized additions
**P0**: qr‑decoder pipeline tests + encode→decode integration.
**P1**: qr‑encoder API/Shift‑JIS + qr‑generator render/pixel‑matrix coverage.
**P2**: dither‑algorithms, payload‑generators, share‑links round‑trip.
**P3**: overlay/exporter/core utility tests.
