# ANQR Test Coverage & Permutation Safety Net Audit

## What's already good

The unit suite is dense in the right places: **4830 passing tests**, with strong coverage of QR encoding internals (`packages/domain/qr/src/encode/` — 21 specs over masks, penalty functions, mode optimization, BCH polynomials, version selection) and color/blend primitives (`packages/domain/render/src/color/` — 7 specs). The MCP and API contract envelopes have schema specs (`packages/contracts/mcp/`, `packages/contracts/api/`), and the new `tests/e2e/basic.web.spec.ts` adds a real E2E smoke for the welcome modal, SPA generator, PNG/SVG API envelopes, and MCP `initialize` + `tools/list`. The harness has serious test depth (63 unit specs + 17 integration specs) for state machines, ownership, and recovery — much more than typical for an automation layer. **However:** the project's automated safety net has three structural holes that dwarf any individual coverage gap (see ⚡ findings).

## Coverage map

| Test layer | What it covers | Major gaps |
|---|---|---|
| **Unit (vitest)** | QR encode/decode primitives, color math, contract type smoke tests, harness state machines, dynamic-testid registry, ad components, MCP descriptor types | `apps/web/` 0 tests; `apps/api/` 0 tests; render pipeline files 19 specs / 743 source files (2.6%); application layer 9/199 (4.5%); no service-worker tests; no i18n loader tests |
| **Contract (vitest)** | 95 spec files mirror each generator/analyze/mcp/api/share/core type | ~95% are tautological type-alias smoke tests — they catch nothing tsc doesn't (see ⚡ "Coverage theater" below) |
| **E2E (Playwright)** | `basic.web.spec.ts` (9 specs: welcome modal, URL/text render, tier switch, format switch, API PNG/SVG/error, MCP initialize, MCP tools/list) | `advanced`, `professional`, `permutations` projects all match **zero** files; no scan round-trip; no visual regression; no perf budget |
| **E2E (vitest)** | Harness lifecycle (`linear-flow`, `discord-flow`, `full-lifecycle`, `live-lifecycle-demo`, `integration-promotion`, `openclaw-symphony`) | Network-dependent — relies on live services at `127.0.0.1:4319` and Symphony; no graceful skip when offline |
| **Integration (vitest)** | 17 specs covering bridge tools, codex routing, worktree concurrency, recovery daemon, key rotation | Excluded from default `test:unit` run; not in CI; runs only when invoked explicitly |
| **Appium (wdio)** | **None — `wdio.conf.ts` is missing**; `test:appium*` scripts fail instantly | 100% gap on mobile (Capacitor Android + iOS) |
| **Visual regression** | None | No `toMatchSnapshot` anywhere in repo; no pixel-diff harness; gallery parity drift PNGs sit at repo root as evidence of past manual checks |
| **Performance regression** | None | No `*.bench.ts`; no timing budgets; no FPS budget for animations |
| **Locale (88-matrix)** | None | No spec loads `apps/web/src/i18n/static/<locale>/*.json` to confirm structural parity or RTL rendering |
| **Scan round-trip** | `qr-encode.spec.ts:96` round-trips `gexp` in GF(256); `qr-decode.spec.ts` exists but isolates decode | No spec couples encode → render → decode across module/finder/ECC permutations to enforce QR scan correctness (hard constraint #1) |

---

## The permutation matrix that actually exists

Pulled from `packages/contracts/generator/src/*.contract.ts`:

| Axis | Values | Count |
|---|---|---|
| `OutputFormat` | png, webp, gif, svg | 4 |
| `ModuleStyle` | square, rounded, dots, diamond, connected | 5 |
| `FinderStyle` | square, rounded, circle | 3 |
| `FrameStyle` | none, rounded_frame, sticker, tag | 4 |
| `GradientType` | none, linear, radial, conic | 4 |
| `AnimationPatternType` | none, pulse, wave, scanline, shimmer, drift, color_cycle | 7 |
| `AnimationEasing` | linear, ease_in, ease_out, ease_in_out, bounce | 5 |
| `DitherKind` | 17 algorithms (error_diffusion, ordered_*, blue_noise_*, perceptual, edge_aware, adaptive_threshold, temporal_blue_noise, …) | 17 |
| `ECCLevel` | L, M, Q, H | 4 |
| `PayloadKind` | 41 (plain_text, url, tel, …, vietqr, qrph, paypal_me, gs1_digital_link, custom) | 41 |
| `OverlayType` | static, gif, apng, webp_anim, video | 5 |
| `WatermarkKind` | text, image, pattern | 3 |
| `EncodingMode` | auto, numeric, alphanumeric, byte, kanji | 5 |
| `CharacterEncoding` | default, utf8, iso-8859-1, shift-jis | 4 |
| QR version | 1–40 | 40 |
| Tier | basic, advanced, professional | 3 |

**Cartesian estimate**: with just the headline visual axes (4 × 5 × 3 × 4 × 4 × 7 × 5 × 17 × 4 × 5 × 3) ≈ **34M combinations**, before animation parameters (speed, seed, reverse, bounce, 2nd-pattern, target, waveAxis), gradient stops, eye overrides, and watermarks. Full coverage is impossible.

**Representative sample target**: ~30 combos. See R3 below.

---

## Findings

### ⚡ CI workflow is fully commented out — there is no automated safety net at all
File: `.github/workflows/ci.yml:1` ("Temporarily disabled due to GitHub Actions billing issues"). The entire file is a comment block. There is no automated typecheck, lint, depcruise, unit-test, or build gate on any PR or push to `main`. Every test discussed below is only useful insofar as a human runs it locally. Risk: high. Effort: low (uncomment + verify billing).

### ⚡ `wdio.conf.ts` does not exist — Appium scripts are dead
`package.json` lines 14–16 declare `test:appium`, `test:appium:android`, `test:appium:ios`, and `Makefile:113-120` exposes them. No file matches `wdio.conf*`. Running any of them errors immediately. `appium`, `appium-xcuitest-driver`, `appium-uiautomator2-driver`, `@wdio/*` are still installed in `package.json:devDependencies` (~7 packages). Risk: low (silent dead code, but pollutes the test-script surface and ships ~hundreds of MB of dev deps). Effort: low (delete scripts + deps OR write a stub conf).

### ⚡ The `permutations` Playwright project matches zero files
`playwright.config.ts:34-37` declares `testMatch: /permutations\..*\.spec\.ts/`. `find tests -name "permutations*"` returns empty. `npm run test:permutations` runs the project, finds no specs, and exits 0 — silently. This is exactly the permutation safety net the audit title asks about, and it doesn't exist. Same applies to `advanced` and `professional` projects (no `advanced.*.spec.ts` or `professional.*.spec.ts` files exist; `--pass-with-no-tests` masks it). Risk: high (false confidence — Makefile and CI templates assume these are real). Effort: medium (build out R3).

### ⚡ Contract specs are coverage theater — ~95 of 4830 unit tests test nothing tsc doesn't
`packages/contracts/generator/src/module-style.contract.spec.ts:7-9` is representative:
```
const styles: ModuleStyle[] = ["square", "rounded", "dots", "diamond", "connected"];
expect(new Set(styles).size).toBe(5);
```
This catches no runtime regression — the `ModuleStyle[]` annotation makes it compile-error-only. Across the contract layer, 53 generator + 18 analyze + 9 mcp + 5 api + 7 core + 3 share = **95 specs** in this shape (counted: `find packages/contracts -name "*.spec.ts" | wc -l = 95`). They inflate the unit-test count without strengthening the net. Risk: low. Effort: medium (replace with single contract-shape Zod assertion per family).

### ⚡ `apps/web` and `apps/api` have zero unit tests
The actual product UI (`apps/web/src/features/{generator,analyze,gallery,onboarding,*}`, payload serializers, routing, SEO, i18n) and the entire `apps/api/` HTTP layer have **no** `.spec.ts`/`.test.ts` files (verified: `find apps -name "*.spec.*"` returns empty). Every regression in those layers is caught (if at all) by the 9 Playwright specs in `basic.web.spec.ts`. Risk: high. Effort: medium-to-high (depends on which feature paths are prioritized).

### ⚡ `typecheck` vs `typecheck:all` vs `typecheck:harness` — three pre-push gaps
- `lefthook.yml:39` pre-push runs `npm run typecheck`, which is `tsc --noEmit` against root `tsconfig.json` — that only includes `src/`. Apps, packages, netlify, and tests are not checked.
- `package.json` defines `typecheck:all` = src + apps + packages + netlify + tests, but it does **not** include `typecheck:harness`.
- `tsconfig.harness.json:15` explicitly excludes harness `*.spec.ts`/`*.test.ts`, so even `typecheck:harness` would not catch the 67 errors in harness test files.

Net effect: the 67 known typecheck errors in test files survive every gate. Risk: medium. Effort: trivial for the lefthook line; medium for the harness-spec exclusion.

### 🔍 The 67 harness/test typecheck errors are stratified
Verified `npm run typecheck:tests` errors: 67 across 9 files. Five files match the user's known set; four are new since the brief was written:
- `tests/unit/eval-sample-provider.spec.ts`, `tests/unit/adaptive-params.spec.ts`, `tests/unit/params-cache.spec.ts`, `tests/unit/request-context.spec.ts`, `tests/unit/runner-lock-exit-code.spec.ts`, `tests/unit/linear-execute-request.spec.ts` — null-narrowing + signature drift
- New: `tests/e2e/full-lifecycle.spec.ts`, `harness/ops/integrations/model/symphony-openai-bridge/install-console-output-guard/get-response-body-summary.spec.ts`, `harness/ops/lib/logger/create-logger/sanitize-value.spec.ts`

Vitest runs them because vitest uses esbuild, not tsc. So they pass at runtime, fail at typecheck. Risk: medium. Effort: low (most are `value!` / `as NonNullable<T>` fixes).

### 🔍 Coverage report is stale and shows zero
`coverage/coverage-summary.json` is dated **2026-04-19 09:39** and reports `total.lines.pct = 0` everywhere — including for files I know are tested (`render-color.spec.ts` runs against `render-color.ts`). Either the v8 instrumentation broke at some point or this is from a run that filtered out everything. Until regenerated, "we have 4830 passing tests" is the only honest coverage claim. Risk: medium (decisions made on this number will be wrong). Effort: trivial (`npm run test:unit:coverage`).

### 🔍 No snapshot/visual regression and no perf budget exist
- `grep -r "toMatchSnapshot\|toMatchInlineSnapshot" tests packages` → **0 hits**.
- `find . -name "*.bench.ts"` → **0 hits**.
- Render parity is currently verified by committing PNGs to the repo root (`parity-animated-client-canvas.png`, `parity-static-client.png`, `gallery-parity-drift-render.png`, `gallery-thumb-drift.gif`, etc.) and eyeballing them. This is the de-facto snapshot system. Risk: high for visual correctness, medium for perf. Effort: medium (R3 covers it).

### 🔍 Service worker is not cleared in Playwright tests
`apps/web` builds a SW (`dist/sw.js`, `dist/manifest.webmanifest` exist; `android/app/src/main/assets/public/sw.js` shipped). `tests/e2e/basic.web.spec.ts` has no `context.clearPermissions`, no `context.serviceWorkers()` cleanup, no `page.context().clearCookies()`. The `webServer` in `playwright.config.ts:48-54` runs `npm run preview`, which serves a built SPA, which can register the SW. Across retries (`retries: 2` in CI), a cached SW could serve stale assets and produce false greens or random fails. Risk: medium. Effort: low (one `beforeEach` helper).

### 🔍 Network-dependent E2E has no mocking discipline
`tests/e2e/openclaw-symphony.spec.ts` requires Symphony at `127.0.0.1:4319` (systemd-managed). Harness `tests/e2e/*` hits `live-lifecycle-demo`. `basic.web.spec.ts` calls `/api/contract/qr` and `/api/mcp` against whatever Netlify dev/preview is serving — could be local edge functions, draft deploy, or prod. No `page.route()` interception, no MSW, no recorded fixtures. AdSense (`packages/analytics/ads/`) and Sentry calls are not stubbed in unit tests either. Risk: medium (test flake + accidental prod-API traffic). Effort: medium.

### 🔍 i18n / 88-locale matrix has no test
`apps/web/src/i18n/static/` has 88 locale directories. No spec loads them, no spec asserts key parity, no spec asserts that RTL locales (ar, fa, he, ur) actually flip layout, no Playwright project iterates `Accept-Language`. The 88 JSON files in `apps/web/src/i18n/locales/` similarly have no validity check. Risk: medium (silent regressions on translation keys + RTL layout). Effort: low (one parity spec + one Playwright RTL smoke).

### 🔍 MCP tools have 2 implementations, only 1 is smoke-tested
`packages/platform/node/src/mcp/create-mcp-server.ts:7-19` registers `generateQrAdvancedTool`, `generateQrTool`, `qrCapabilitiesResource`, and `qrGeneratePrompt`. The 9 new E2E specs cover `initialize` and `tools/list` shape only — no `tools/call` for either tool, no `resources/read` for `qrCapabilitiesResource`, no `prompts/get` for `qrGeneratePrompt`. Tool authorization (`authorizeMcpRequest`, `enforceMcpRateLimit` in `netlify/functions/mcp/handler.ts:7-13`) is not exercised. Risk: high (MCP is one of the three product tiers). Effort: low.

### 💭 Integration tests are excluded from default runs and not in any gate
`vitest.config.ts:43` explicitly excludes `tests/integration/**`. They run only via `npx vitest run --config vitest.integration.config.ts` (manually). 17 specs covering bridge, codex, worktree concurrency, recovery daemon, codebuff key rotation — none of which is wired to any `quality` or `test` Make target. Risk: low (they're harness, not product). Effort: trivial to gate.

### 💭 Gallery scenario fixtures are static and untested
`apps/web/src/content/gallery/canonical-fixtures.const.ts` declares 6 fixtures (tsunami.jpg, king.gif, logo.png, test.png, santa.png, dance.gif). The `gallery-scan-scenarios-preservation.ts` file (out of scope per constraints) presumably validates them, but I can't find any `.spec.ts` that asserts the fixtures load, hash correctly, or render. Risk: low. Effort: low.

---

## Recommendations ranked by ROI

### R1 — **Uncomment CI workflow + add `typecheck:all` and `test:unit` gates** [CI hygiene; ~30 min]
Resolve the billing block on `.github/workflows/ci.yml`, uncomment it, and verify the existing template (it already does `typecheck:all`, `lint:all`, `test:unit:coverage`, `build:web`). Without this, every other recommendation is voluntary. **This is the single biggest safety-net win available.**

### R2 — **Change lefthook pre-push to `typecheck:all`; add a `typecheck:tests` step** [CI hygiene; 5 min]
Edit `lefthook.yml:39` from `npm run typecheck` to `npm run typecheck:all && npm run typecheck:tests`. Closes the test-file typecheck gap. Likely fails on first run because of the 67 known errors — follow with R5.

### R3 — **Build the actual permutation safety net: 30-combo Playwright project with SVG/PNG hash snapshots + 60-combo scan round-trip** [Safety net; 1–2 days]
Two layered tests:
- **Visual sample**: `tests/e2e/permutations.web.spec.ts` (this file is what the `permutations` Playwright project is looking for). Generate ~30 representative QR combos via the SPA — covering each module style × dither family × animation pattern × frame style at least once — and assert `expect(canvas.toDataURL()).toMatchSnapshot()` or hash-equal. This catches every silent rendering regression at the cost of ~30 PNGs in `tests/e2e/__snapshots__/`.
- **Scan round-trip**: new `packages/domain/qr/src/encode-decode-roundtrip.spec.ts` iterates `[L, M, Q, H] × [square, rounded, dots, diamond, connected] × [square, rounded, circle]` (= 60), encodes a known payload, runs the decoder, asserts equality. Hard-enforces constraint #1. Reuses existing `qr-encode.spec.ts` + `qr-decode.spec.ts` infrastructure.

Together these produce the named "permutation safety net" — the title premise of this audit currently has zero implementation.

### R4 — **Delete dead Appium scripts (or write `wdio.conf.ts` stub)** [CI hygiene; 15 min]
Either (a) remove `test:appium*` from `package.json` + `Makefile`, drop `@wdio/*`, `appium`, `appium-*-driver` from devDeps (saves ~hundreds of MB on `npm i`), and update `docs/archive/discovery/01-service-runtime-matrix.md`; or (b) commit a working `wdio.conf.ts` with at least one passing smoke spec on Android emulator. Recommend (a) — there's no signal anywhere that mobile-native testing is on the roadmap; if it is, do it properly later.

### R5 — **Fix the 67 harness/test typecheck errors with non-null narrowing** [CI hygiene; 2–3 h]
The errors are 90% `Object is possibly 'null'` and `Argument type mismatch`. Fix pattern: `params!.x` or `expect(params).not.toBeNull(); const p = params as NonNullable<typeof params>;` followed by use. The four "new" files (incl. `full-lifecycle.spec.ts`, `sanitize-value.spec.ts`, `get-response-body-summary.spec.ts`) are recent — fix them at the same time. Also: remove `"exclude": ["harness/**/*.spec.ts", "harness/**/*.test.ts"]` from `tsconfig.harness.json:15` once green, so harness spec drift never regresses again.

### R6 — **Regenerate `coverage/coverage-summary.json` and pin a baseline** [CI hygiene; 30 min]
Run `npm run test:unit:coverage`. Commit a fresh summary. Compare to the per-package source-count ratios I cited (render 19/743, application 9/199) and identify the three lowest-coverage packages by line-pct. Future commits get a coverage delta on PRs once R1 is live (`actions/upload-artifact` already in the template).

### R7 — **Unit tests for `apps/web/src/features/generator/` payload serializers and state reducers** [Coverage gap; 2–3 days]
Highest-ROI target: anything in `apps/web/src/state/payload-serializers/` and `apps/web/src/state/`. These are pure functions consumed by the entire UI tier and currently have zero coverage. Aim for ≥80% line coverage on those folders before touching React components. Pure-function tests are cheap and break-detect any tier-rendering regression at the unit layer rather than at slow E2E.

### R8 — **MCP `tools/call` + `resources/read` + `prompts/get` smoke specs** [Coverage gap; 1 h]
Extend `tests/e2e/basic.web.spec.ts` "API: /api/mcp" describe block with three more tests — one per non-`initialize`/`tools/list` MCP method that the server actually implements. Use a tiny payload (`data: "hi"`) and assert the response envelope shape, not pixel content (that's R3's job). Closes the MCP-tier gap.

### R9 — **88-locale parity + RTL smoke** [Coverage gap; 2 h]
- Unit: one spec in `apps/web/src/i18n/` that imports each locale JSON, asserts the key set equals the `en-US` key set (or fails with the missing keys). Fail-fast on translation drift.
- E2E: one new spec in `tests/e2e/basic.web.spec.ts` that visits `/?lang=ar`, asserts `<html dir="rtl">` and that the QR canvas still renders. One RTL representative is enough.

### R10 — **Service-worker cleanup in `tests/e2e/e2e-helpers.ts`** [Safety net; 30 min]
Add a `clearSWAndCache(page)` helper that calls `page.context().clearCookies()` and `navigator.serviceWorker.getRegistrations().then(r => r.forEach(x => x.unregister()))`. Call in a top-level `test.beforeEach`. Eliminates a known class of flaky-on-retry false greens.

### R11 — **Replace tautological contract specs with one Zod shape test per family** [CI hygiene; 1 day, optional]
For each contract module (`generator`, `analyze`, `mcp`, `api`, `share`, `core`), have one `*-contracts.spec.ts` that imports every contract type and asserts the discriminated-union shape via Zod (or a typed helper). Delete the 95 individual `*.contract.spec.ts` files. Reduces unit-test count by ~2% but increases signal density. Defer until R1–R10 are landed — this is cleanup, not safety.

### R12 — **Wire integration suite to a manual Make target gated weekly** [Safety net; 30 min]
Add `make test-integration: npx vitest run --config vitest.integration.config.ts` and document that maintainers run it weekly on Testbox. The harness work depends on these; letting them rot risks the brand of automation the project is built on.

### R13 — **Perf budget on QR encode + render** [Safety net; 1 day, defer]
Add `packages/domain/qr/src/encode/qr-encode.bench.ts` + `packages/domain/render/src/render.bench.ts` with Vitest `bench()`. Pin a budget (e.g. `encode(40-H) < 100ms` on the maintainer machine). Catches accidental O(n²) regressions. Defer until R1–R10 land — perf is a secondary concern when correctness has no net.
