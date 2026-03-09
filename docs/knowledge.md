# ANQR — Project Knowledge

## Identity

ANQR is a production QR code generator shipped as a Vite/React web app (anqr.link), a Netlify serverless API, an Android app, and an iOS app (both via Capacitor). It supports rich styling (gradients, overlays, dithering, animation), 25+ payload types, share-link round-tripping, i18n (40+ languages), and monetisation via AdSense (web) and AdMob (native).

## Documentation Model

This repo follows an **agent-first harness model** defined in `docs/harness/agent-first.md`:

- `AGENTS.md` is a concise map — start there, then follow links into `docs/`.
- `docs/` is the **canonical** source of project knowledge.
- Legacy markdown stubs outside `docs/` have been removed (ANQ-66). Do not create new markdown outside `docs/`.
- `docs/inventory/markdown-reconciliation.md` tracks every legacy path and its canonical destination.

### Key docs

| Topic               | Path                                                            |
| ------------------- | --------------------------------------------------------------- |
| Architecture        | `docs/architecture/overview.md`                                 |
| Module catalog      | `docs/modules/index.md`                                         |
| Execution workflow  | `docs/workflow/execution-workflow.md`                           |
| Reports catalog     | `docs/reports/README.md`                                        |
| Launch checklist    | `docs/operations/launch-checklist.md`                           |
| Ops autopilot       | `docs/operations/ops-autopilot.md`                              |
| Provider operations | `docs/harness/provider-operations.md`                           |
| Autonomous harness  | `docs/harness/autonomous-framework.md`                          |
| Error handling      | `docs/operations/ops-autopilot.md` §Error-Aware                 |
| Circuit breaker     | `docs/operations/ops-autopilot.md` §Circuit-Breaker             |
| Email notifications | `docs/operations/ops-autopilot.md` §Email                       |
| CI failure monitor  | `docs/operations/ops-autopilot.md` §CI Failure Monitor          |
| Linear issue CLI    | `docs/operations/ops-autopilot.md` §Linear Issue Management CLI |

## Architecture

```
src/                    Client React app (Vite dev server on :5173, proxied via netlify dev on :8888)
src/modules/            15 domain modules with explicit dependency graph
netlify/functions/qr.ts Serverless QR renderer — shares modules with client
android/                Capacitor Android shell
ios/                    Capacitor iOS shell (Xcode project + Fastlane)
docs/                   Canonical project knowledge
scripts/                Build, gallery, ops, and report tooling
tests/unit/             Vitest unit tests
tests/basic|advanced|professional/ Playwright E2E tests by tier
tests/api/              Playwright API tests (/api/qr) + cross-platform visual parity
tests/appium/           Appium native E2E tests (WebdriverIO + Mocha, iOS + Android)
tests/helpers/          Shared utilities (visual-compare via pixelmatch+pngjs, e2e-library, etc.)
tests/permutations/     Exhaustive settings combination tests (overnight CI)
```

### Module dependency graph

```
qr-spec          (no deps — QR constants, masks, capacities)
├── qr-encoder   (matrix generation, data modes, ECC)
├── qr-decoder   (pure decode from ImageData)
core             (no deps — color math, gradients, contrast)
├── dither-algorithms (no deps — error diffusion, blue noise, ordered)
├── overlay      (depends: core, dither-algorithms)
├── qr-generator (depends: qr-encoder, qr-spec, core, overlay, dither-algorithms)
├── qr-analyzer  (depends: qr-decoder, core)
payload-generators (no deps — URL, WiFi, vCard, crypto, OTP builders)
share-links      (no deps — URL param encode/decode, embed, social)
animation        (depends: dither-algorithms)
exporter         (depends: browser-io, platform)
browser-io       (depends: platform)
browser-clipboard (no deps)
platform         (Capacitor adapters — AdMob, MediaStore)
```

### Share parameter compatibility

Share URL params must stay aligned between the client-side encoder/decoder and the server-side `/api/qr` query parser. Drift causes preview/render mismatches. Test with `tests/unit/share-param-parity.spec.ts`.

## Tech Stack

| Layer      | Technology                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Framework  | React 19, TypeScript 5.9 (strict)                                                                                                |
| Build      | Vite 8 (beta), ESM-only (`"type": "module"`)                                                                                     |
| Styling    | Tailwind CSS v4 (`@tailwindcss/postcss`)                                                                                         |
| Components | Radix UI primitives (Select, Slider, Tabs, Accordion, etc.)                                                                      |
| State      | Zustand 5                                                                                                                        |
| i18n       | i18next + react-i18next (40+ locales, static guides)                                                                             |
| Testing    | Vitest 4 (unit), Playwright 1.58 (E2E web + API), Appium 3 + WebdriverIO 9 (E2E iOS/Android), pixelmatch + pngjs (visual parity) |
| Linting    | oxlint + oxfmt (OXC-powered, not ESLint)                                                                                         |
| Quality    | commitlint (conventional commits), lefthook (git hooks), knip, jscpd, type-coverage, dependency-cruiser                          |
| Hosting    | Netlify (web + functions), Google Play Store (Android), Apple App Store (iOS)                                                    |
| Monitoring | Sentry (React + Node SDKs)                                                                                                       |

## Essential Commands

### Setup

```bash
make bootstrap    # Full env setup: secrets from bootstrap.zip + npm install + git hooks + Playwright
make pristine     # Nuclear reset: git clean -xfd + make bootstrap (fresh clone equivalent)
```

### Development

```bash
make dev          # Vite dev server (:5173)
make build        # tsc + vite build
npm run typecheck # tsc --noEmit
```

### Quality & Linting

```bash
make fix          # oxlint --fix + oxfmt --write
make lint         # oxlint only (no write)
make check        # oxlint + oxfmt --check (CI mode)
make quality      # Full 19-check quality gate pipeline
make harness      # Full 22-domain harness report (FACE-BPH)
make harness:quick # Quick 4-check smoke test
make notify:test  # Test outbound email notification
make email:ingest # Process inbound emails → Linear issues
make monitor:ci   # GitHub CI failure monitor → create/close Linear issues
make issue:create # Show usage for standalone Linear issue creation
make issue:create:child # Show usage for child issue creation
```

### Testing

```bash
npm run test:unit        # Vitest unit tests
npm run test:unit:ci     # Same (CI alias)
make test:basic          # Playwright basic tier
make test                # Full quality gates + unit + E2E + API (uses netlify dev)
make test:tiers          # All Playwright tiers + API (no permutations)
make test:api            # Playwright API tests (/api/qr endpoint + browser↔API parity)
make test:parity         # Alias for test:api (cross-platform visual comparison)
make test:appium         # Appium native E2E (auto-detects OS: macOS→iOS, Linux→Android)
make test:appium:ios     # Appium iOS explicitly (macOS only, requires Xcode + Simulator)
make test:appium:android # Appium Android explicitly (Linux only, requires emulator/device)
```

### Cross-Platform Testing Strategy

QR codes must be visually consistent across all rendering paths. The test matrix:

| Platform | Runner     | QR Renderer              | Test Location                                 |
| -------- | ---------- | ------------------------ | --------------------------------------------- |
| Browser  | Playwright | Client canvas            | `tests/basic\|advanced\|professional/`        |
| API      | Playwright | `@napi-rs/canvas` (Node) | `tests/api/qr-api.spec.ts`                    |
| Parity   | Playwright | Both (pixel comparison)  | `tests/api/cross-platform-parity.spec.ts`     |
| iOS      | Appium     | WebView canvas           | `tests/appium/specs/ios-platform.spec.ts`     |
| Android  | Appium     | WebView canvas           | `tests/appium/specs/android-platform.spec.ts` |

OS gates enforce platform correctness:

- **macOS** runs iOS Appium tests (`make test:appium:ios`)
- **Linux** runs Android Appium tests (`make test:appium:android`), auto-sets `ANQR_BASE_URL=http://10.0.2.2:8888`
- **Both** run Playwright browser + API tests via `netlify dev` on port 8888

### Validation

```bash
npm run typecheck           # TypeScript
npm run test:i18n           # i18n regression check
npm run test:bundle:budget  # Bundle size gates
npm run test:testid         # Test ID coverage audit
npm run test:required:strict # Required test matrix validation
```

### Deploy (requires ALLOW_PAID_ACTIONS=1)

```bash
make deploy       # Netlify production deploy with Sentry sourcemaps
make android      # Full Android AAB build
make all          # Complete 16-step production pipeline
```

## Conventions

- **Module system**: ESM-only. All source uses `import`/`export`.
- **TypeScript**: Strict mode. Do not use `any` casts. Maintain ≥95% type-coverage.
- **Formatting**: oxfmt (not Prettier). Run `make fix` or `npx oxfmt --write .`.
- **Linting**: oxlint (not ESLint). Config in `.oxlintrc.json`.
- **Commits**: Conventional commits enforced by commitlint (`feat:`, `fix:`, `docs:`, `chore:`, etc.). Reference the relevant Linear issue where appropriate (e.g., `fix(ops): add provider failover (ANQ-194)`).
- **Git hooks**: lefthook runs lint-staged + typecheck on pre-commit, commitlint on commit-msg.
- **New docs**: Always add to `docs/`, never to root-level markdown.
- **Test IDs**: Managed inventory in `tests/ids.txt`; audited by `npm run test:testid`.
- **Bundle budgets**: Main entry ≤720 KiB, non-i18n total ≤6200 KiB.
- **Issue evidence**: Every Done issue requires a comment with commit hashes, validation output, and pass/fail verdict. See `docs/workflow/execution-workflow.md` §Evidence Policy.
- **Email handling**: Symphony NEVER sends emails autonomously. Inbound emails are ingested, read, and reviewed — then a NEW actionable issue is created that quotes the original email. The raw email does not become the issue itself.
- **CI failure monitoring**: The CI monitor (`scripts/ops/ci-failure-monitor.mjs`) watches for GitHub Actions notification emails. "Run failed:" creates a `[CI]` Linear issue per unique workflow; "Run succeeded:" auto-closes it. Deduplicates repeat failures. Run via `make monitor:ci`.
- **Issue assignment**: `[HUMAN]` and `[EMAIL]` issues are assigned to matthewaldous. All other issues are left unassigned — the credit-gate handles AI provider routing independently of Linear assignee. Do NOT assign automatable issues to any specific user. The guardian enforces this every 15 minutes and removes stale Codex assignments.
- **State routing**: true human-only tasks stay in `Pending`; catastrophic AI retry escalations are routed to `Todo` so they remain in the AI retry queue.
- **Sonar contract**: `make sonar` is non-blocking when local SonarQube is down; when SonarQube is running it must execute a real scan and results should be triaged into actionable issues (ongoing parent: `ANQ-266`).
- **Bootstrap secrets hygiene**: whenever `env` / `env.txt` secrets change (including `SONAR_TOKEN`, `SONARQUBE_TOKEN`, `SONAR_HOST_URL`), refresh `bootstrap.zip` so `make bootstrap` restores the same working token set on new hosts.
- **Symphony env parity**: keep `~/.config/symphony/anqr.env` aligned with required automation secrets (including `SONAR_TOKEN` and `SONAR_HOST_URL`) so agent workspaces inherit the same access as local shell runs.
- **Project health**: The guardian computes project health (`onTrack`/`atRisk`/`offTrack`) from issue completion ratios and posts Linear project updates when health changes.
- **Symphony liveness**: The guardian verifies Symphony is running every 15 minutes via a deterministic systemd + dashboard check. This replaces the old AI-powered sentinel heartbeat — no AI credits consumed, cannot enter retry queues.
- **Harness-driven issues**: The guardian reads the latest harness report and automatically creates `[HARNESS]` issues for FAIL/ERROR checks. It tracks state to avoid duplicates and marks issues resolved when checks pass.
- **AI Hints**: When a Linear issue needs course-correction for AI agents (unclear instructions, legacy context, excessive comments, or stale state), add a comment starting with `AI Hint:` that gives the next agent concise, actionable guidance. Use AI Hints proactively when issues are at risk of blowing out or getting stuck. Periodically run a board sanity check to identify issues needing hints.

## Key File Locations

| File                                 | Purpose                                                |
| ------------------------------------ | ------------------------------------------------------ |
| `src/stores/`                        | Zustand stores (app state)                             |
| `vite.config.ts`                     | Build config, chunk splitting, plugins                 |
| `vitest.config.ts`                   | Unit test config                                       |
| `playwright.config.ts`               | E2E test config (web + API, uses netlify dev on :8888) |
| `wdio.conf.ts`                       | E2E test config (mobile/Appium, iOS + Android)         |
| `.oxlintrc.json`                     | Linter rules                                           |
| `.oxfmtrc.json`                      | Formatter config                                       |
| `.dependency-cruiser.cjs`            | Architectural boundary rules                           |
| `knip.json`                          | Unused dependency/export detection                     |
| `Makefile`                           | Orchestration entry point for all tasks                |
| `scripts/ops/create-issue.mjs`       | CLI: create standalone Linear issues                   |
| `scripts/ops/ci-failure-monitor.mjs` | GitHub CI → Linear issue bridge                        |

## Things to Avoid

- Do not edit `WORKFLOW.md` YAML front-matter — it is operator-managed infrastructure config.
- Do not run paid/deploy commands (`make deploy`, `make indexnow`, `make android:upload`) without explicit approval and `ALLOW_PAID_ACTIONS=1`.
- Do not use ESLint or Prettier — this project uses oxlint and oxfmt.
- Do not add new markdown documentation outside `docs/` — legacy stubs have been removed (ANQ-66).
- Do not duplicate canonical content from `docs/` into other files.
- Do not cast TypeScript expressions as `any`.
