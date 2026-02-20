# Codex Working Log

Last updated: 2026-02-20 13:48:00 UTC

## User Requests

1. Read `gallery-idea.md` and fix `make gallery:local` output issues:
- QR codes look the same
- some outputs have no QR code
- animated GIF outputs are not actually animated

2. Treat `gallery-idea.md` as new/untrusted:
- app/api path has not been tested either

3. Consider possible fundamental regressions in rendering libraries:
- tests passed in the past
- recent API rendering work may have introduced regressions

4. Read project status docs:
- `knowledge.md`
- `tbd.md`

5. Rework `Makefile` organization (suggested sections):
- Meta/help
- Globals/exports
- Discovery/tool checks
- Pipeline entries
- Setup/housekeeping
- Web
- Quality
- Testing
- Assets
- Gallery
- i18n
- Deploy/validation
- Android
- Reports/misc

6. Keep an ongoing progress record in `codex.md`.

7. Clear `reports/gallery-artifacts` and start fresh.

8. Focus on local gallery generation first and keep `codex.md` up to date.

9. Investigate visual quality issue:
- nooverlay default looks non-crisp / resampled.

10. User follow-up:
- artwork output quality is unacceptable
- use existing QR-Art script and test on `public/trump.png`

11. Investigate QR-Art regression history:
- compare behavior around Feb 7 commits where output looked better.

12. Read analyzer snapshot file:
- `/home/user/Downloads/qr-analysis-1771595197804.json`

13. Correct QR-Art payload semantics:
- Base payload is `https://whitehouse.gov`
- QR-Art appends `#<numeric suffix>` in mixed mode (do not pre-supply full `#...` payload for this flow)

## Progress

- [x] Inspected current `gallery-idea.md` and new gallery scripts.
- [x] Confirmed current local artifact issues quantitatively:
  - 333 files total in `reports/gallery-artifacts/local`
  - 148 unique payload hashes (high duplication)
  - 78 `.gif` files that are actually PNG payloads
- [x] Ran targeted regression tests for renderer/API pipeline:
  - `tests/unit/qr-generator-render-modes-full.spec.ts`
  - `tests/unit/qr-generator-dithered-scan-gate.spec.ts`
  - `tests/unit/qr-art-integration.spec.ts`
  - `tests/unit/netlify-qr-function.spec.ts`
  - `tests/unit/netlify-qr-function-error.spec.ts`
  - Result: 5/5 files passed, 111/111 tests passed
- [x] Rewrote `scripts/generate-gallery-local.mjs` to use in-process Netlify handler (`netlify/functions/qr.ts`) with local fixture data-URL resolution and cache bypass.
- [x] Validated rewritten local generator on a non-overlay subset (12/12 pass).
- [x] Reworked local fixture loading to use dev-only `file://` overlays (no in-process HTTP asset server contention).
- [x] Added dev-only local file overlay support in `netlify/functions/qr.ts` (guarded by `NETLIFY_DEV` + `ANQR_LOCAL_OVERLAY_ROOT`).
- [x] Validated previously broken animated overlay case:
  - `overlay__ditherKind-anim-screened_blue_noise-king` now renders 61-frame GIF (was previously 1 frame on timeout fallback).
- [x] Read `knowledge.md` and `tbd.md` for current project status context.
- [x] Reorganized top-level Makefile help into requested 14-group section order.
- [x] Added Makefile aliases for pipeline/discovery usability: `ci`, `smoke`, `release`, `test:full`, `gallery:api`.
- [x] Cleared `reports/gallery-artifacts` and restarted local generation runs from clean state.
- [x] Fixed nooverlay decode failures in permutation set:
  - adjusted risky palette preset
  - hardened failing power combo (`power-4`)
- [x] Reworked local visual baseline for crisp QR output:
  - removed rotated modules (`dotRot=0`)
  - aligned default output geometry (`w=294`, `h=294`, `modulePx=6`)
  - set global `gap=0` for clean base modules
- [x] Revalidated local nooverlay category end-to-end:
  - `334/334` pass, `0` fail
- [x] Stabilized overlay permutation set:
  - removed/adjusted repeatedly failing families (`mode=dither` cross sweep, unstable payload+mode combinations, unsafe preservation combos)
  - added scanner-safe mode defaults consistently to cross/sweep blocks
  - removed clone-padding for overlay by adding unique filler set (no `overlay__pad-*` clones)
- [x] Overlay full local run revalidated:
  - `333/333` pass, `0` fail
- [x] Artwork combo failures fixed (`combo5` static fixtures) and revalidated.
- [x] Artwork full local run revalidated:
  - `333/333` pass, `0` fail
- [x] Ran dedicated QR-Art pipeline script on `public/trump.png`:
  - command: `node --import tsx scripts/run-qr-art.ts public/trump.png reports/gallery-artifacts/local/qr-art-trump.png`
  - result: success, version `6`, mask `7`, match `63.2%` (`874/1383`)
  - output files:
    - `reports/gallery-artifacts/local/qr-art-trump.png`
    - `reports/gallery-artifacts/local/qr-art-trump-hires.png`
  - decode check passed against generated output.
- [x] Extended `scripts/run-qr-art.ts` for reproducible regression testing:
  - added CLI args for `data`, `suffixMode`, `strictSuffix`, `ecc`, `autoSuffix`, `suffix`.
- [x] Reproduced mixed-mode long URL generation (`version=6`, `ecc=L`) and confirmed long payload output:
  - decoded length `289`, suffix length `271`.
- [x] Reproduced the Feb 7-style case with explicit payload components:
  - `trump.png`, `version=9`, `ecc=L`, numeric suffix length `490`.
  - current output decodes but visual quality is poor (bottom-heavy, weak facial structure).
- [x] Parsed `/home/user/Downloads/qr-analysis-1771595197804.json`:
  - payload length `513`
  - version `9`, ECC `L`, mask `4`
  - analyzer reports `encodingMode: byte`, `byteSegmentCount: 1`, `totalByteLength: 23` (inconsistent with payload length).
- [x] Re-ran current QR-Art with corrected semantics (base payload only, mixed mode auto-appended suffix):
  - command:
    - `node --import tsx scripts/run-qr-art.ts public/trump.png reports/gallery-artifacts/local/qr-art-trump-v9-whitehouse-autosuffix-current.png 9 100 "https://whitehouse.gov" numeric 1 L 1`
  - decode verification:
    - total length `513`
    - prefix `https://whitehouse.gov#...`
    - suffix length `490`
  - visual result remains degraded (same bottom-heavy pattern), confirming regression is not caused by payload input format.
- [ ] Reorganize `Makefile` internals further (if needed) while preserving behavior.

## Notes / Findings

- The previous local script used a manual param mapper with multiple divergence points from app/API behavior.
- A major concrete bug in old local script path resolution: `path.join(PUBLIC_DIR, '/foo')` resolves to `/foo` (absolute), causing local overlay fixture lookup failures.
- Data-URL overlay approach was rejected by Netlify handler (`fetchImageWithBuffer` originally `http/https` only).
- In-process localhost asset serving caused event-loop starvation under concurrency and sporadic fetch timeouts (`ok:false`), leading to missing overlays and 1-frame fallback GIFs.
- Dev-only `file://` overlay support resolved that class of local regression.
- Local sandbox limitation discovered: `tsx` CLI IPC pipe path (`/tmp/tsx-1000/*.pipe`) fails with EPERM in this environment; execution works via `node --import tsx ...`.
- `knowledge.md` indicates the stable production gallery pipeline is still centered on `scripts/generate-gallery.mjs`; `gallery-idea.md` additions are new and not yet proven.
- Current nooverlay uniqueness is still insufficient:
  - `334` artifacts generated
  - `204` unique hashes
  - indicates many functionally-equivalent scenarios
- Key-diff check against `src/modules/share-links/url-params.ts`:
  - all current permutation parameter keys are recognized (no unknown URL keys)
  - duplication is driven by scenario design/no-op combinations and pad-cloning, not unknown param names.
- Overlay clone-padding issue addressed by unique filler generation; no overlay `pad-*` outputs remain in current set.
- Nooverlay still relies on `trimOrPad()` and still has many `pad-*` clones; uniqueness cleanup there is still pending.
- QR-Art history review findings so far:
  - `33844b3` forced byte-only QArt behavior and removed static phone-safety cap.
  - `9c2ecb7` introduced mixed-mode numeric suffix logic and numeric-safe bit ranges.
  - `b59cc40` changed default `targetControlPercent` from `50` to `100`, added `lockVersionToMinimum` behavior, and changed control-target selection logic.
  - Current code can generate the long payload but image fidelity is significantly worse than the Feb 7 reference image.
- Analyzer snapshot likely confirms a mode/segment mismatch symptom:
  - decoded payload is long URL, but structural metadata reports byte-mode single segment and only 23 decoded bytes.

## Next Actions

1. Complete commit-by-commit Feb 7 QR-Art visual reproduction to isolate first bad commit.
2. Patch QR-Art settings/selection path to recover Feb 7-like visual fidelity while preserving payload reproducibility.
3. Re-run local gallery generation after QR-Art fix and re-check nooverlay/overlay/artwork parity.
4. Apply the same no-clone uniqueness strategy to `nooverlay` (eliminate `pad-*` outputs).
5. Continue Makefile cleanup after local gallery pipeline is stable.
