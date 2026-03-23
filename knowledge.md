# ANQR Knowledge Base

## System Overview

### Purpose

ANQR is a production-ready QR code generator with advanced styling capabilities. It provides:

- **QR Generation**: Standard and highly customizable QR codes with overlay images, blend modes, animations, and various output formats.
- **Analysis**: Scannability diagnostics and structural metrics (version, ECC, mask penalty, contrast, etc.).
- **Sharing**: Web share, clipboard, download, and gallery export.
- **Programmatic Access**: HTTP API and Model Context Protocol (MCP) for integrations.

### Architecture

ANQR is an NX monorepo with a strictly-governed package architecture:

```
packages/<group>/<package>   # Reusable logic (domain, application, UI, platform, etc.)
apps/web                     # Web UI (Vite + React)
netlify/*                   # Serverless functions for API and MCP
public/*                    # Static assets and generated artifacts
docs/*                      # Canonical documentation and doctrine
scripts/ops/*               # Harness and automation (outside product runtime)
```

**Key package groups**:

- `contracts`: Type-level contracts for generator, analyze, share, MCP, API.
- `domain`: Core domain models and logic (QR code model, payload handling, rendering, analysis, sharing, logging).
- `application`: Application services (generation, analysis, gallery, onboarding, monetization).
- `ui`: React component library and design tokens for web and mobile.
- `platform`: Platform-specific implementations (browser, Node.js, native mobile, web workers).
- `observability`: Logging, telemetry, Sentry integration.
- `analytics`: Google Analytics 4 and ads integration.
- `testing`: Fixtures, fakes, contract tests, parity tests, Playwright setups.
- `config`: Linting, TypeScript, dependency-cruiser, build configuration.

**Delivery surfaces**:

- **Web app**: `apps/web` built and served via Netlify CDN.
- **API & MCP**: Netlify Functions under `netlify/*`.
- **Mobile**: Capacitor shells (`apps/mobile`, `android/`, `ios/`) exist but are not in the 1.0 launch claim.

### Current 1.0 Claim

The officially supported launch surface is:

- `apps/web`
- `netlify/*` for public HTTP QR API and MCP

Not currently claimed (deferred):

- `apps/api`
- Android and iPhone apps

---

## Generator Options & Constraints

The QR generator is composed of several functional sections. Exposed options and constraints are defined by the contracts in `packages/contracts` and implemented in `packages/application` and `packages/domain`.

### Payload

- **Supported types**: URL, plain text, vCard, Wi‑Fi credentials, geographic location, SMS, email, calendar event, binary data.
- **Encoding**: UTF‑8 with ECI for extended character sets; emoji support via proper normalization.
- **Constraints**: Payload size limited by QR capacity (version and ECC level). If data exceeds capacity, generation fails with a clear error suggesting options to reduce length or increase ECC.

### Overlay

- **Blend modes**: multiply, screen, overlay, darken, lighten, color-dodge, color-burn, soft-light, hard-light, difference, exclusion, etc.
- **Alpha handling**: Premultiplied alpha; color space sRGB.
- **Placement**: Configurable position (center, corners, custom offset), scaling, and opacity.
- **Constraints**: Overlay must not obscure the QR quiet zone or finder patterns; system warns if overlay coverage threatens scannability.

### Encoding

- **QR specification**: Versions 1–40, automatic or manual version selection.
- **Error correction**: L (low), M (medium), Q (quartile), H (high).
- **Mask selection**: Automatic (penalty scoring) or forced mask pattern.
- **Structured append**: Supported for splitting data across multiple QR codes (if implemented).
- **Determinism**: Same input and seed produce identical output for reproducible builds.

### Rendering

- **Output formats**: PNG (default), SVG (vector), PDF, WebP (if available).
- **Rendering backends**: Canvas (default), SVG (vector), or bitmap fallback.
- **Module style**: Square (default), circle, rounded.
- **DPI & scaling**: High‑DPI support; crisp edges via antialiasing and pixel alignment.
- **Quiet zone**: Default 4 modules; configurable for specialized use cases (with warnings).

### Animation

- **Frame generation**: Per‑frame payload and overlay variations; consistent module grid across frames.
- **Timing**: Frame delay, loop count (infinite or finite).
- **Export formats**: GIF, MP4/WebM (via MediaRecorder or server-side encoding).
- **Constraints**: Total frame count limited by generation time and output size.

### Watermark

- **Types**: Text or image watermark.
- **Placement**: Bottom corners, center, or custom coordinates.
- **Opacity**: 0–100% control.
- **Constraint**: Watermark must not compromise scanability (checked by analysis).

### Metadata

- **Embedded**: Creator name, creation date, custom key‑value pairs (where format supports).
- **Exposed**: In the UI’s “metadata” section and via API response.

### Sharing

- **Web Share API**: Native share on mobile browsers.
- **Clipboard**: Copy image to clipboard (where supported).
- **Download**: Direct file download with auto‑generated filename.
- **Fallbacks**: For unsupported browsers, show download button and instructions.

### Safety

- **Input sanitization**: No script injection; strict MIME type checks for external images.
- **Size limits**: Payload size, overlay image size, and overall response size are bounded.
- **External fetches**: Overlay images from URLs are fetched with timeout and size limits; CORS respected.
- **Error handling**: User‑friendly error messages; technical details logged server‑side.

---

## Testing & Gallery

### Test Strategy

ANQR uses a layered testing approach:

- **Unit tests**: Cover pure functions in `packages/domain` and `packages/application`. No network, storage, or real SDKs.
- **Integration tests**: Validate boundaries with fakes for analytics, ads, telemetry, and storage.
- **Parity tests**: Compare local/browser/API paths against a shared scenario corpus to ensure consistency across platforms.
- **E2E tests**: Playwright for critical user journeys (generation, customization, export, analysis). Semantic selectors preferred; `data-testid` used as fallback.
- **Property‑based & fuzz tests**: Randomized payloads and option combinations to stress‑test decoding success and error handling.

### Gallery

An automated permutation builder generates a large set of QR codes covering:

- All payload types
- ECC levels and versions
- Color schemes and overlay configurations
- Blend modes and opacity levels
- Output formats

The gallery output includes the generated images and a JSON manifest with metadata (config, metrics, file paths). This manifest is used for visual regression tests and as a public showcase.

**Usage**:

- Locally: `npm run gallery:build` (or similar script; check `package.json`).
- CI: Gallery build runs on schedule or before releases.
- Viewing: Manifest can be loaded in the web UI’s gallery section.

---

## Scanability Guidelines

Scanability is a first‑class quality gate. All generated QR codes must be reliably decoded by common scanners.

### Validation Process

- **Automated scan tests**: Use multiple decoders (e.g., ZXing, ZBar, and native OS scanners in CI where possible) to verify decode success.
- **Metrics recorded**: Decode confidence, time to decode, number of attempts.
- **Threshold**: ≥ 99% success across the supported decoder set for the default configuration set. Overlay‑heavy configurations have relaxed but monitored thresholds.

### Analysis Display

The `analyze` section exposes:

- QR version, mask pattern, ECC level, capacity utilization %
- Module count, quiet zone size, scaling factor
- Contrast ratio (foreground vs background)
- Overlay coverage % and its impact
- Mask penalty breakdown and final score
- Render timing and output size

### User Guidelines

To ensure good scanability:

1. Maintain high contrast between foreground and background.
2. Avoid overlay opacity > 50% unless necessary; test scanability with analysis tool.
3. Preserve quiet zone (do not place content in the empty border).
4. Keep module size ≥ 3 pixels on physical devices; be mindful of print size.
5. Test on multiple devices and scanner apps before production use.

---

## Technical Standards

### Development

- **Language**: TypeScript in strict mode.
- **Linting**: `oxlint` with project‑specific rules.
- **Formatting**: Prettier; enforced via `lint-staged` and CI.
- **Commits**: Conventional Commits; validated by commitlint.
- **Code review**: All changes require PR review; CI must pass.

### Testing

- Coverage thresholds: 90%+ for packages (configurable per package).
- Test organization: `__tests__` or `*.test.ts` colocated with source; integration tests in `tests/`.
- Naming: Descriptive test names reflecting behavior.

### Security

- **Authentication**: JWT for API; MCP default is anonymous with perimeter controls.
- **Authorization**: Role‑based checks for any privileged operations.
- **Data protection**: No secrets in Git; use Netlify env and `.env` (gitignored). PII masked in logs.
- **Dependency audits**: Snyk and `npm audit` run in CI; critical vulnerabilities must be fixed.

### Performance

Product runtime budgets (from `docs/discovery/05-performance-budgets-and-slos.md`):

- **Initial load**: ≤ 2 s (broadband), ≤ 3 s (mobile); max 4 s.
- **UI response**: ≤ 100 ms; after setting change ≤ 200 ms.
- **Render time**:
  - Standard QR: ≤ 200 ms
  - Styled QR: ≤ 500 ms
  - Complex overlay/animation: ≤ 1 s
- **Worker tasks** (gallery, scan validation, analysis): ≤ 2 s typical, ≤ 5 s max.
- **Memory**:
  - Web: ≤ 150 MB typical, ≤ 300 MB max.
  - Mobile: ≤ 100 MB typical, ≤ 200 MB max.
- **Crash rate**: < 0.5% target; alert > 1%.

### Quality Gates

CI/CD enforces:

- Type checking (`npm run typecheck:all`)
- Linting (`npm run lint:all`)
- Dependency boundaries (`npm run depcruise`)
- Unit tests (`npm run test:unit`)
- E2E tests (`npm run test:basic` and `npm run test:advanced`)
- SonarCloud quality gate

---

## Environment Configuration

### Local Development

- **Node**: 20.x (see `package.json` engines)
- **Package manager**: npm 10.x
- **Setup**: `npm install` to install dependencies.
- **Env file**: Copy `.env.example` to `.env` and fill required values (see below).
- **Run dev server**: `npm run dev` (Vite) at `http://localhost:5173`.
- **API functions**: Can be tested locally with `netlify-cli` (`netlify functions:serve`).

### Required Environment Variables

#### Logging & Monitoring

```
GRAFANA_CLOUD_API_KEY=
FARO_API_URL=
APP_VERSION=
LOG_LEVEL=
LOKI_USERNAME=
LOKI_API_URL=
TEMPO_API_URL=
```

#### Database

Not required for standalone QR generation; used only for optional analytics or persistence.

#### AWS

Not used in core QR generation.

#### Services

```
API_URL=            # Backend API base (for web app)
AUTH_URL=           # Authentication service (if any)
STORAGE_URL=        # Storage backend for generated assets (if any)
```

#### Third‑Party Integration

```
SENTRY_DSN=
GA4_Measurement_ID=
GOOGLE_PLACES_API_KEY=     # if location lookup used
ELEVENLABS_API_KEY=         # optional voice
# AI provider keys for harness (not needed for product runtime)
OPENAI_API_KEY=
OPENROUTER_TOKEN=
```

See `.env` for full local development variables.

### Netlify Configuration

- **Build command**: `npm run build`
- **Functions directory**: `netlify/.netlify/functions`
- **Environment variables**: Set in Netlify UI, including `SENTRY_DSN`, `GA4_MEASUREMENT_ID`, and any feature flags.
- **Deploy contexts**: Production and Deploy Previews.

---

## Deployment

### Infrastructure

- **Hosting**: Netlify (CDN + serverless functions).
- **DNS & CDN**: Cloudflare (optional for custom domain and edge caching).
- **Static assets**: Served from `public/` and Netlify CDN.

### CI/CD Pipeline

- **Triggers**: Push to `main` or PRs.
- **Steps**:
  1. Install dependencies (`npm ci`).
  2. Type check (`npm run typecheck:all`).
  3. Lint (`npm run lint:all`).
  4. Dependency cruiser checks (`npm run depcruise`).
  5. Unit tests (`npm run test:unit`).
  6. Build (`npm run build`).
  7. E2E tests against deploy preview (`npm run test:basic`).
  8. SonarCloud analysis.
- **Gate**: All checks must pass before merge; production deploy automatically on merge to `main`.

### Rollback

- Netlify provides instant rollback to previous deploy.
- For database or external service changes, follow separate migration rollback plan.

---

## Observability Standards

### Context Propagation

- Frontend and backend include request IDs (`x-request-id`) and trace context (`traceparent`) for correlation.
- User context (if authenticated) attached via headers: `x-user-id`, `x-user-email` (masked in logs).

### Logging

- **Frontend**: Use `loglevel` with prefix plugin; send errors to Sentry.
- **Backend (Netlify Functions)**: Structured JSON logs; captured by Netlify logs and optionally Sentry.
- **Sensitive data**: PII (emails, names) masked; do not log raw payloads.

### Metrics

- **Product**: GA4 tracks usage events (generation, analysis, sharing). Custom performance marks for render timings.
- **Reliability**: Sentry captures errors with release version and stack traces.
- **Performance**: Netlify Analytics and Lighthouse CI track Core Web Vitals.

### Alerting

- **Sentry alerts**: New issues or spike in crash‑free rate.
- **Uptime monitoring**: External service (UptimeRobot) pings the public site and API health endpoint.
- **CI failures**: Notify via GitHub or Linear.

---

## Additional Resources

- **Canonical docs index**: `docs/README.md`
- **Harness documentation**: `docs/harness/00-index.md`
- **Program definition**: `docs/program/01-anqr-1.0-definition.md`
- **Service & runtime matrix**: `docs/discovery/01-service-runtime-matrix.md`
- **Performance budgets**: `docs/discovery/05-performance-budgets-and-slos.md`
- **Testing standards**: `docs/standards/testing-standards.md`
- **API/MCP schema**: `docs/api/` (generated)

---

_Last updated: 2026‑03‑22 (auto‑generated from repository sources)_
