# ANQ-148: Deterministic Local vs API Artifact Parity

## command(s) run
- `GALLERY_IDS='nooverlay__default--1,nooverlay__style-rounded--2,nooverlay__style-dots--3,nooverlay__style-diamond--4,nooverlay__style-connected--5,nooverlay__finder-rounded--6,overlay__mode-center-tsunami--1,overlay__mode-center-logo--2,overlay__mode-center-test--3,overlay__mode-center-santa--4,overlay__mode-blend-tsunami--5,overlay__mode-blend-logo--6,artwork__art-santa-anim-stack-wave-drift--267,artwork__art-santa-anim-shimmer--259,artwork__art-santa-mega--271,artwork__art-santa-anim-drift--261,artwork__art-santa-anim-wave--258,artwork__art-santa-anim-wave-y--262' GALLERY_CONCURRENCY=4 ../ANQ-105/node_modules/.bin/tsx scripts/generate-gallery-local.mjs`
- `GALLERY_IDS='nooverlay__default--1,nooverlay__style-rounded--2,nooverlay__style-dots--3,nooverlay__style-diamond--4,nooverlay__style-connected--5,nooverlay__finder-rounded--6,overlay__mode-center-tsunami--1,overlay__mode-center-logo--2,overlay__mode-center-test--3,overlay__mode-center-santa--4,overlay__mode-blend-tsunami--5,overlay__mode-blend-logo--6,artwork__art-santa-anim-stack-wave-drift--267,artwork__art-santa-anim-shimmer--259,artwork__art-santa-mega--271,artwork__art-santa-anim-drift--261,artwork__art-santa-anim-wave--258,artwork__art-santa-anim-wave-y--262' GALLERY_CONCURRENCY=2 ../ANQ-105/node_modules/.bin/tsx scripts/generate-gallery-remote.mjs`
- `node reports/anq-148 parity comparer (sha256 + byte-size local vs remote comparison by scenario id)`

## evidence artifact paths
- `reports/gallery-artifacts/local/report.json`
- `reports/gallery-artifacts/remote/report.json`
- `reports/anq-148/local-run.log`
- `reports/anq-148/remote-run.log`
- `reports/anq-148/local-vs-api-parity.json`
- `reports/anq-148/local-vs-api-parity.md`
- `reports/anq-148/evidence.json`
- `reports/anq-148/evidence.md`

## mismatch/root-cause notes
- Comparison set: 18 deterministic scenarios (6 nooverlay, 6 overlay, 6 artwork).
- Byte-equal scenarios: 17/18.
- Mismatch scenario: `artwork__art-santa-mega--271`.
- Local artifact: `artwork__art-santa-mega.png` (49,483 bytes, sha256 `a84d9e87b394bf3e60d46b0af9cad0d13455458aeace42ba0a94a88c67b30dd1`).
- API artifact: `artwork__art-santa-mega.png` (48,443 bytes, sha256 `dcfc95399535de068372aea0ff41166df3c22d641ec635ad9f7215fd8589a485`).
- Pixel-level delta for mismatch: `381/86,436` pixels differ (`0.4408%`), max channel delta `229`.
- Reproducible params (mismatch scenario):
  `v=6&align=match_finder&timing=match_module&gap=0&gradAngle=135&radius=25&dotRot=0&modulePx=6&animSpeed=100&jitter=0&wmPos=bottom-center&gifPal=256&gifMaxFps=30&w=294&h=294&frameText=ANQR&ec=M&format=png&intensity=50&colorMode=color&fit=cover&keepFinders=1&keepTiming=1&keepAlign=1&protectFmt=1&protectVer=1&ditherKind=error_diffusion&ditherStrength=50&finderDither=65&blendPres=0&blendPresMode=overlay&serpentine=0&diffusionKernel=floyd_steinberg&matrix=bayer4&bnTile=64&bnSeed=0&colorDither=none&mode=artwork&img=%2Fsanta.png&style=diamond&finder=rounded&frame=tag&grad=conic&gradStops=7c3aed%2C0%2Cec4899%2C0.5%2Cf59e0b%2C1&eyeOuter=circle&eyeInner=rounded&gapMode=inset&fg=1a365d&bg=fff5e6&wmEn=1&wmKind=text&wmText=ANQR&wmBlend=soft-light&wmOpacity=50&data=https%3A%2F%2Fanqr.link&mask=0`
- Both local and API generator reports marked this scenario as `pass`, so mismatch is a deterministic local/API render drift rather than a decode failure.

## pass/fail verdict
- **FAIL**: local-vs-API byte parity did not fully pass (`17/18` byte-equal).
