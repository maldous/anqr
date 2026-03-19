# ANQR MCP + Migration Consolidation

## Purpose

This document replaces the pending-work portions of:

- `MCP-REQUIREMENTS.md`
- `MIGRATION-COMPLETION.md`
- `MIGRATION-STATUS.md`

It is a one-way consolidation of:

1. what is already complete
2. what still remains for the current in-scope platform
3. what is intentionally deferred
4. what is external/operational rather than code-only
5. what still needs to come over from legacy branches for a real 1.0 launch

If the older documents are removed, this file should remain sufficient to resume work without losing any identified remaining tasks.

## Current Truth

### Architecture and Governance

These are complete and green now for the authoritative current-platform scope:

- strict hexagonal package architecture is enforced by the split depcruise gates
- contracts layer is explicit and enforced
- `domain -X-> contracts`
- `domain -X-> platform/ui/application/apps/netlify/observability/analytics`
- `application -X-> platform/ui/apps/netlify/observability/analytics`
- `apps/web -X-> domain`
- `netlify -X-> domain`
- `packages/apps/netlify -X-> src/*`
- `domain/application/platform/ui/apps -X-> netlify`
- external deep imports into package internals are blocked
- real folder-scope package-cycle enforcement is enabled and green

### Validation

These are currently green:

- `npm run typecheck`
- `npm run lint`
- `npm run depcruise`
- `npm run depcruise:architecture`
- `npm run depcruise:contracts`
- `npm run depcruise:all`
- `npm run contracts:check`
- `npm run audit:ast`
- `npm run test:unit`
- `npm run openapi:generate`

### HTTP / API / MCP

These are complete in-repo:

- contract-backed HTTP QR API exists
- OpenAPI generation exists
- canonical public host is `https://anqr.link`
- public HTTP contract route is `https://anqr.link/api/contract/qr`
- public MCP route is `https://anqr.link/api/mcp`
- MCP is implemented as a Netlify-hosted Streamable HTTP server
- MCP tools call application entrypoints only
- MCP advanced QR generation reaches practical parity with the guarded server render surface
- HTTPS-only overlays and SSRF protections are implemented
- rate limiting, audit logging, and auth adapter seams exist in `platform/node`
- optional Firebase-backed JWKS auth path exists and is ready to enable later

### Important Scope Distinction

The current purity/completion claim is valid for the current authoritative graph:

- `packages/*`
- `apps/web`
- `netlify/*`

It is not yet a claim that every deferred root in the whole repository is finished.

### Current Main Directory Structure

The current repository surface is broader than the authoritative current-platform purity claim. The directory layout needs to be understood explicitly before documentation and harness context are reset.

Current top-level roots on `main` and their current role:

- `packages/`
  - the authoritative reusable architecture surface
  - grouped by:
    - `contracts`
    - `domain`
    - `application`
    - `platform`
    - `ui`
    - `observability`
    - `analytics`
    - `testing`
    - `config`
- `apps/`
  - delivery shells and transitional app roots
  - currently includes:
    - `apps/web`
    - `apps/api`
    - `apps/mobile`
    - `apps/android`
    - `apps/ios`
- `netlify/`
  - deployed server/API delivery surface
  - includes:
    - `netlify/functions`
    - `netlify/edge-functions`
- `android/`
  - root native Android scaffold/runtime
- `ios/`
  - root native iOS scaffold/runtime
- `public/`
  - static web-delivery assets only
  - not executable product logic
- `docs/`
  - current canonical documentation surface, but still organizationally incomplete/disordered
  - includes:
    - `docs/program`
    - `docs/discovery`
    - `docs/workflows`
    - `docs/standards`
    - `docs/api`
    - `docs/adr`
- `scripts/`
  - engineering/runtime scripts
  - `scripts/ops/` is the canonical harness runtime
- `services/`
  - service/timer installation/runtime definitions
- `migration/`
  - historical migration doctrine/bundle docs
- `src/`
  - residual non-authoritative root
  - imports into it are blocked by the authoritative architecture gate
- `tests/`
  - current test root, intentionally not yet re-architected as final package form
- `reports/`
  - currently sparse on `main`, but legacy treated it as a meaningful operator/release surface
- `dist/`
  - build output, not a source-of-truth authoring surface

This means the documentation restart cannot assume a single already-clean surface. It must explain:

- what is authoritative now
- what is deferred
- what is transitional residue
- what is generated output
- what is launch-critical versus archival

### Documentation / AI Context Reboot Requirements

The current documentation set is useful, but still disorganized for agent-first operation. Migration completion should include a deliberate documentation/context reboot suitable for Codex, Codebuff, and related agent tooling.

Still required:

- define the canonical documentation entrypoints for agents and humans
- define the minimal root-level context files that initialize tool behavior cleanly
- remove ambiguity between canonical docs, archive docs, migration-history docs, and generated artifacts
- ensure app-initialized context files point to the right current-main architecture, not the old migration bundle assumptions

Recommended end-state for agent-context/bootstrap files:

- one concise root agent map such as:
  - `AGENTS.md`
  - or an equivalent canonical root entrypoint for AI tools
- Codex-specific bootstrap/context files if intentionally maintained
- Codebuff-specific bootstrap/context files if intentionally maintained
- skill/context directories only where they are real maintained inputs, not stale legacy fragments
- clear links from any tool-specific bootstrap file back to canonical docs in `docs/`

The reboot should explicitly classify documentation into:

- canonical operational doctrine
- canonical architecture doctrine
- product/launch knowledge
- workflow/runbook docs
- archive/history
- generated artifacts

The reboot should also decide what the current canonical read order is for:

- a new human operator
- Codex
- Codebuff
- a third-party AI reviewer
- a harness runtime bootstrap

Current repo gap to resolve:

- there is no tracked root `AGENTS.md`, `CLAUDE.md`, `.codex/`, or equivalent Codebuff-specific bootstrap surface in the repo tree
- current root `README.md` is still largely framed as the old migration-bundle control surface rather than the stable post-migration operating handbook

For migration completion, the documentation/context reboot should end in a truthful answer for:

- what root file a new model reads first
- what files define architecture rules
- what files define launch scope and remaining work
- what files define harness runtime behavior
- what files define issue/workspace governance
- what files are historical only

### Current 1.0 Product Truth

The current repo and current program/discovery docs now make the 1.0 launch bar more explicit than the older migration docs did.

What 1.0 is meant to cover:

- web as the primary public interface
- public API on Netlify
- Android and iPhone as launch platforms if the 1.0 claim includes mobile
- core QR generation:
  - standard QR
  - animated QR
  - overlays
  - advanced customization
- QR analysis / validation / diagnostics
- gallery / showcase generation
- export / sharing
- observability
- analytics instrumentation
- AI harness automation and self-healing operational support

What must remain true at the product level:

- anonymous QR generation must remain possible
- enterprise authentication and rate limiting are later-phase concerns, not mandatory for anonymous consumer launch
- QR generation should remain possible entirely on-device for anonymous users where the product surface supports it
- launch quality is defined by parity, reliability, performance, and maintainability, not only by package-boundary cleanliness

---

## Remaining Work For Current Platform

These items still remain for the active web + Netlify/API platform, even though the package-architecture migration itself is complete.

### 1. Thin `apps/web` further

`apps/web` is boundary-compliant, but not yet minimal.

Still worth doing:

- move stable shell orchestration out of `apps/web` into package-owned APIs where genuinely reusable
- reduce app-local composition/state coordination in large shell/editor flows
- keep `apps/web` focused on delivery composition, routing, bootstrapping, and app-local concerns

Desired end-state:

- `apps/web` remains a thin shell not just by boundary rules, but also by actual code ownership

### 2. Thin `netlify/*` further

`netlify/*` is now off domain and package internals, but still owns some delivery/server composition.

Still worth doing:

- push more request/response orchestration into package-owned server/application APIs
- reduce localized delivery glue where it no longer buys stability
- keep Netlify handlers as thin delivery wrappers over package-owned logic

Desired end-state:

- `netlify/*` becomes mechanically thin, not only boundary-compliant

### 3. Reduce remaining localized compatibility/server shims

The remaining shims are not broad architectural leaks, but they still exist.

Still worth doing:

- remove compatibility shims where callers are now stable
- collapse server-entry shims where package-owned public surfaces are already sufficient
- preserve only the shims that still protect a meaningful boundary

### 4. Refine application runtime ports

The port/adaptor split is in place, but some ports are broader than necessary.

Still worth doing:

- narrow capability surfaces where current runtime ports are too coarse
- keep ports capability-oriented, not implementation-oriented
- keep browser/native/worker/download/canvas-specific details fully outside application

### 5. Tighten public package surfaces further

Architecture is already strict, but public-surface governance is not yet fully explicit everywhere.

Still worth doing:

- move more packages from regex-shaped entrypoint governance toward explicit `package.json` `exports`
- continue aligning tsconfig aliases with declared exports rather than implicit file shapes
- only do this for packages that truly expose stable public APIs

### 6. Extract more contracts only when justified

The contracts layer is real, but contract extraction should continue only when it improves true boundary clarity.

Still worth doing:

- extract additional contract packages or contract-owned nouns only where the vocabulary is:
  - portable
  - stable
  - noun-shaped
  - shared across delivery/runtime boundaries
- avoid extracting contracts just to mirror folders or package names
- keep workflow/use-case glue out of contracts
- keep store/state shapes out of contracts
- keep hooks/components/adapters out of contracts
- keep runtime coordination and delivery glue out of contracts

### 7. Delivery-owned helper type cleanup

Some helper types may still live in packages even if they are only meaningful to a delivery surface.

Still worth doing:

- review remaining delivery-oriented helper types in `apps/web` and `netlify/*`
- move them out of packages and into delivery-owned code where they are not truly portable
- preserve package ownership only for types that are genuinely reusable across boundaries

### 8. Simplify package surfaces rather than preserving migration-era indirection

The remaining cleanup should prefer clearer stable package surfaces over keeping obsolete migration-era indirection alive.

Still worth doing:

- simplify package entrypoints where compatibility layers are no longer useful
- remove stale alias-driven surface complexity where explicit package APIs now exist
- keep surface cleanup focused on real public ownership, not preserving legacy migration paths

### 9. Retire the mixed migration gate when it has no value left

Still worth doing:

- remove or archive the legacy mixed depcruise migration pass once it no longer helps with any residual cleanup

### 10. Make the launch-critical user journeys explicitly true in the shipped product

The current docs now define concrete launch-critical UX flows. Migration completion should preserve them as actual shipped behavior, not only as product intent.

Still required:

- keep the landing/first-visit flow optimized for same-session first QR generation
- keep the create-QR flow fast, clear, and successful on first attempt
- keep the customize flow safe and understandable without breaking scannability
- keep preview/validate trustworthy and aligned with exported output
- keep export/share reliable across current in-scope delivery targets
- keep gallery exploration fast, understandable, and connected back to generation

These flows also carry explicit requirements that still need a truthful final disposition:

- accessibility:
  - headings
  - keyboard navigation
  - readable contrast
  - alt text
  - labelled inputs
  - readable validation messaging
- mobile UX:
  - thumb-friendly controls
  - lightweight landing and gallery behavior
  - no UI blocking during generation/customization
  - mobile-compatible download/share behavior
- analytics:
  - the core event funnel must exist and stay coherent across landing, generation, customization, preview, export, and gallery flows

The current UX discovery docs also make two additional launch journeys explicit:

- premium prompt / monetization:
  - must not feel forced
  - must not block core functionality
  - ads must be clearly identifiable and dismissible
  - ads/premium prompts must not degrade generation performance or cause disruptive layout shift
- support / feedback:
  - contact/feedback path must remain easy to find
  - support forms must stay simple and fast
  - support/contact analytics should remain measurable

### 11. Make the explicit performance budgets and SLOs truthful

The current discovery docs contain real budgets, not just vague aspirations. Migration completion should preserve them as launch obligations.

Still required:

- measure and verify these current product budgets:
  - initial load target:
    - `<= 2s` on broadband
    - `<= 3s` on average mobile devices
    - max acceptable `4s`
  - interaction latency:
    - `<= 100ms` UI response
    - `<= 200ms` UI update after setting change
  - QR render time:
    - standard `<= 200ms`
    - styled `<= 500ms`
    - complex overlay/animation `<= 1s`
  - worker tasks:
    - typical `<= 2s`
    - max `<= 5s`
  - memory:
    - web typical `<= 150 MB`, max `<= 300 MB`
    - mobile target `<= 100 MB`, max `<= 200 MB`
- preserve or rebuild the explicit SLO posture:
  - `99.9%` uptime for web/API
  - `>= 99.9%` QR generation success
  - `<= 15 minutes` MTTR for recoverable incidents
  - crash rate `< 0.5%` target, `> 1%` alert threshold
- keep the alert thresholds truthful for:
  - generation failure rate
  - crash rate
  - performance regression
  - harness instability
  - queue backlog
  - provider instability

### 12. Make the release/distribution matrix explicit and current

The current discovery docs now define concrete release paths and rollback expectations. Migration completion should preserve or replace that operational truth.

Still required:

- ensure the release/distribution story is explicit for:
  - web:
    - GitHub push -> Netlify preview -> production approval -> Netlify production
  - API:
    - GitHub push -> Netlify Functions build -> production approval -> deploy
  - Android:
    - Capacitor/native build -> Gradle/APK/AAB -> Play internal -> promote
  - iOS:
    - Capacitor/native build -> Xcode/IPA -> TestFlight -> App Store
- ensure signing and rollback ownership are explicit for each track
- preserve or replace the documented promotion flow:
  - local -> dev
  - dev -> staging
  - staging -> prod
  - internal mobile -> public mobile
- keep parity checks, gallery checks, Sentry checks, and performance checks in the promotion truth where those remain launch requirements

Legacy canonical launch docs also mean there should be a clear current-main replacement or disposition for the old operational gate set:

- full clean-checkout production pipeline
- quality gate pipeline
- API parity verification
- deploy flow with source-map/release observability
- third-party service validation
- iOS build/archive/beta flow
- Android build/release flow

---

## Remaining MCP / API Work

This section is specific to MCP, the public HTTP API, and Netlify-hosted perimeter concerns.

### 1. Configure real Netlify perimeter controls in deployed environments

This is not a code-only task. It still needs to happen operationally.

Still required:

- real Netlify rate-limiting rules for:
  - `/api/contract/qr`
  - `/api/mcp`
- real traffic rules / WAF / perimeter hardening for those routes where available
- verification that deployed route behavior matches the route-policy declarations in code

Current in-repo status:

- route policy declarations exist
- rate-limit policy declarations exist
- `netlify.toml` scaffolding exists
- actual deployed Netlify perimeter rules are still pending

### 2. Decide and set the production MCP auth posture

This is partly operational, not just code.

Two supported launch paths now exist:

- public launch:
  - leave `MCP_AUTH_MODE` unset or disabled
  - rely on rate limiting, audit logging, HTTPS-only overlays, DNS/IP rejection, redirect re-validation, timeout limits, content-length limits, content-type validation, and magic-byte validation
  - this keeps MCP usable from ChatGPT or other remote clients without requiring account auth up front
- Firebase-authenticated launch:
  - set `MCP_AUTH_MODE=firebase`
  - set `MCP_FIREBASE_PROJECT_ID=anqr-link`
  - optionally set `MCP_JWT_SCOPE=...`

Still required:

- choose one production mode explicitly
- set the real Netlify environment variables for that mode
- test deployed auth behavior end-to-end

### 3. Keep MCP/API documentation in sync with the real deployed surface

This is mostly done, but remains an ongoing requirement.

Still required whenever the surface changes:

- regenerate OpenAPI
- ensure MCP docs mention the public routes, not internal Netlify function URLs
- keep schema `.describe(...)` coverage complete on new contract fields

### 4. Future MCP breadth

MCP now covers the practical guarded QR generation surface, but future expansion is still possible.

Optional further work:

- more prompts/resources around advanced generation patterns
- additional capability documents for enterprise/automation clients
- async/background tool envelopes if truly long-running MCP jobs are introduced later

This is not a blocker for current completion.

### 5. Async/background execution policy for long-running MCP/API work

This remains a real design and implementation backlog item, not just a vague future possibility.

Still required:

- define when MCP/API requests must remain synchronous
- define when work must move to Netlify background/asynchronous execution
- add explicit task/result envelopes where long-running MCP or HTTP jobs are introduced
- keep application unaware of Netlify/MCP transport/runtime concerns while doing so

Operational note:

- legacy branches already used foreground/background function patterns
- the current paid Netlify plan supports longer-running execution paths where needed
- async/background execution should be introduced deliberately, not by letting synchronous handlers grow without limits

---

## Deferred Whole-Repo Work

These items are intentionally deferred and should not be confused with unfinished current-platform architecture work.

### 1. Mobile import/convergence from legacy

Still required later:

- deliberately import or converge `android/` and `ios/` from:
  - `master`
  - or `refactor/anqr-architecture`
- decide the final relationship between:
  - `android/`
  - `ios/`
  - `apps/mobile`
  - Capacitor/native delivery

Current status:

- legacy mobile assets exist in old branches
- current repo is not yet claiming mobile delivery completion

### 2. Root `src/` final treatment

Imports from root `src/` are blocked in the authoritative architecture gate, but the root still exists as residue.

Still required:

- finish dissolving or isolating root `src/` as a repository surface
- decide whether any remaining root `src/` files are:
  - temporary residue to delete
  - transitional artifacts to archive
  - permanent non-authoritative support files

### 3. Testing architecture finalization

Testing is operationally present, but the final extracted architecture is intentionally deferred.

Still required later:

- decide the final architecture for:
  - root `tests/`
  - `playwright.config.ts`
  - Appium/WebdriverIO setup
- do not invent `packages/testing/*` just to mirror a future possibility
- only extract testing packages if there is a real reusable package surface to own

### 4. Gallery extraction decision

Legacy gallery was app-owned, not a real `packages/application/gallery` package.

Still required later:

- decide whether gallery should remain app-owned
- or only extract it if a true reusable application surface emerges

### 5. Premature scaffold cleanup

Still required:

- remove or fill empty/reserved scaffolds that do not yet correspond to active implementation
- re-check package/app metadata after scaffold cleanup
- avoid preserving fake package architecture for slices that are not actually implemented yet

Concrete current candidates still needing a final decision include:

- `packages/application/onboarding`
- `packages/application/monetization`
- `packages/application/gallery`
- `packages/analytics/ads`
- `packages/testing/*`
- `packages/config/*`
- `apps/api`
- `apps/mobile`
- any other current empty or reserved package/app roots that do not yet correspond to active implementation

### 6. Whole-repo purity claim

Before the entire repository can honestly be called strictly pure, all of the following still need to be true:

- current-platform purity remains green
- public package surfaces are explicit where they need to be
- deferred roots are either converged, isolated, or removed
- root `src/` is no longer an active architectural surface
- mobile/native delivery is either converged or explicitly outside the claim
- root testing/tooling surfaces have their final intentional architecture

---

## Legacy 1.0 Launch Convergence Backlog

These items are not hypothetical. They existed in `master` and/or `refactor/anqr-architecture` and still need an explicit decision to call the product migration complete for a 1.0 launch.

This section is broader than the current-platform purity claim. It captures the remaining product, delivery, asset, and operational surface that still has to be:

- imported
- converged
- deliberately rebuilt on `main`
- or explicitly dropped from the 1.0 scope

### 1. Native mobile delivery roots still need to come over

Legacy branches contain a real Capacitor mobile delivery surface, and `main` already contains partial Android/iOS/mobile roots that now need a truthful convergence decision rather than being treated as abstract future placeholders.

Still required:

- import or deliberately rebuild the Android project under `android/`
- import or deliberately rebuild the iOS project under `ios/`
- restore or replace `capacitor.config.ts`
- decide the final relationship between:
  - `android/`
  - `ios/`
  - `apps/mobile`
  - shared package/application/platform code

Current repo reality to account for:

- root `android/` already exists
- root `ios/` already exists
- `apps/android` already exists
- `apps/ios` already exists
- `apps/mobile` already exists

So the remaining work is not only "bring over mobile". It is also:

- decide which mobile roots are canonical
- remove duplicate or transitional mobile root layouts
- converge native/mobile ownership into one truthful release structure

Concrete legacy Android surface that still needs a final treatment:

- Gradle project and wrapper files
- `android/app/google-services.json`
- `android/app/src/main/AndroidManifest.xml`
- launcher icons and splash assets
- release/build signing configuration and `proguard-rules`
- file/provider path configuration
- custom native code such as `MediaStoreWriterPlugin`
- any mobile service SDK wiring currently implied by legacy native config, including Firebase-backed mobile integration and any ad/save/share-related native plugin setup that is still in scope

Concrete legacy iOS surface that still needs a final treatment:

- Xcode project and workspace-owned app files
- `AppDelegate.swift`
- `Info.plist`
- app icons and launch screen/storyboards
- `CapApp-SPM`
- Fastlane metadata
- Fastlane screenshots
- release/archive lane configuration
- any iOS-side service/plugin wiring that must match the Android/mobile product surface for launch

For 1.0 launch, the mobile track must end in one of two truthful states:

- mobile delivery is imported and working
- or mobile delivery is explicitly outside the 1.0 claim

### 2. Gallery product surface still needs to come over or be rebuilt

Legacy branches carried a real gallery surface, not just a placeholder package name.

Still required:

- restore or rebuild the gallery feature behavior expected for launch
- import or regenerate curated gallery assets under `public/gallery`
- preserve or replace gallery manifests such as:
  - `public/gallery/manifest.json`
  - any showcase/gallery index metadata needed by the app
- decide whether gallery remains app-owned or becomes a real extracted package only if a true reusable surface exists

Legacy Makefile evidence shows gallery was treated as a real product/release surface, including flows for:

- static gallery generation
- GIF gallery generation
- no-overlay gallery variants
- QR art / remote / API / local / browser gallery runs
- compare/parity/publish/merge flows

For 1.0 launch, gallery cannot remain an unspecified placeholder. It must be:

- present and supported
- rebuilt intentionally
- or explicitly excluded from the launch scope

### 3. I18n source + generation pipeline still needs a final treatment

Legacy branches carried a much larger i18n surface than the current ledger captures.

Still required:

- decide whether multilingual launch support is in scope for 1.0
- if yes, import or rebuild the source translation system from legacy
- converge the root `src/i18n` surface into the current architecture intentionally instead of leaving it as untracked legacy knowledge

Concrete legacy i18n surface that still needs a final treatment:

- locale JSON sources under `src/i18n/locales/*`
- text-source files under `src/i18n/locales/txt/*`
- static page translation sources under `src/i18n/static/*`
- static-page text templates under `src/i18n/static/txt/*`
- generated/static content families for:
  - `about`
  - `contact`
  - `examples`
  - `guide`
  - `index`
  - `learn`
  - `privacy`
  - `terms`
  - `translate`
- generation/fill/translation scripts such as:
  - `src/i18n/fill.py`
  - `src/i18n/xlate.py`
  - `src/i18n/make_template.py`
  - `src/i18n/static/fill.py`
  - `src/i18n/static/xlate.py`

Legacy release/config evidence also shows an operational i18n workflow that still needs a final decision:

- `i18n:pull`
- `i18n:push`
- `i18n:xlate`
- `i18n:xlate:static`
- `i18n:xlate:locales`
- `i18n:fill`
- `i18n:fill:static`
- `i18n:fill:locales`
- `i18n:check`

If multilingual launch support remains in scope, this is launch-critical work, not optional cleanup.

### 4. Public web assets and launch collateral still need a final treatment

Legacy branches carried public-facing launch assets and generated outputs that are only partially reflected in the current repo.

Still required:

- compare current `public/` assets against legacy and restore anything still required for launch
- decide which legacy generated/public assets remain canonical
- ensure app/store/SEO collateral is either imported or intentionally regenerated

Concrete legacy public/launch assets to review and converge:

- `public/apple-touch-icon.png`
- `public/favicon.ico`
- `public/manifest.json`
- `public/openapi.yaml`
- `public/_redirects`
- `public/robots.txt`
- `public/ads.txt`
- `public/.well-known/assetlinks.json`
- site-verification or ownership proof files such as:
  - `public/da39713d0cb0b7ec43d21f259b214605.txt`
- manifests/web app metadata
- sitemap outputs
- gallery images/manifests under `public/gallery/*`
- OG/share assets such as:
  - `public/og-banner.*`
  - `public/og-image.*`
  - `public/og-header.png`
- launch screenshots and store/web preview assets such as:
  - `public/screenshots/*`
  - `public/images/examples/*`
  - `public/images/learn/*`
- generated icon/image surfaces such as:
  - `public/icons/*`
  - PWA/app icon outputs
- built-in overlay/demo/media fixtures such as:
  - `public/tsunami.jpg`
  - `public/king.gif`
  - `public/logo.png`
  - `public/test.png`
  - `public/santa.png`
  - `public/dance.gif`
- any launch screenshots or share-preview assets still used by deploy/docs/store flows
- any app icon/icon-generation outputs that legacy treated as release artifacts

This should end in a truthful state where the launch asset set is:

- present
- current
- and intentionally owned

Legacy knowledge also indicates that some of these public assets are product behavior inputs, not just marketing collateral:

- built-in overlay fixtures used by gallery/examples/native same-origin flows
- generated showcase/gallery manifests consumed by app routes
- static-page images for `learn` and `examples`
- OG/app-icon HTML templates used by screenshot and share-image generation tooling

### 5. SEO and discoverability surface still needs a final treatment

Legacy branches carried a real SEO/discoverability surface, not just static files.

Still required:

- review legacy SEO behavior and determine what still needs to be restored under the new architecture
- ensure search/discovery/public-preview behavior is intentional for the current launch surface
- decide what remains dynamic versus static in the current Netlify deployment

Concrete legacy SEO/discovery surfaces to review and classify include:

- `netlify/edge-functions/seo.ts`
- `public/robots.txt`
- `public/sitemap.xml`
- `public/_redirects`
- `public/og-banner.*`
- `public/og-image.*`
- `public/og-header.png`
- `scripts/generate-sitemap.mjs`
- `scripts/submit-indexnow.mjs`
- `.well-known` verification/association files

Legacy documentation also shows launch-time SEO concerns that still need a final answer:

- SSR/meta-tag injection for static pages and shared QR URLs
- canonical public asset hosting under `https://anqr.link`
- live-route coverage for gallery/static/legal/info pages
- IndexNow / sitemap submission
- search-engine directives and crawl behavior

For 1.0 launch, SEO cannot remain accidental. It must be:

- intentionally implemented
- documented
- and verified against the deployed host

### 6. Root release/config parity still needs a final decision

Legacy branches used root configuration and scripts as part of the actual release surface.

Still required:

- compare current root config/scripts against legacy and decide what must come over for launch readiness
- import or rebuild the pieces that are still part of the product/release workflow
- explicitly drop anything that is obsolete rather than leaving it undocumented

Concrete legacy root configuration and release/ops surface to review:

- `netlify.toml`
- `capacitor.config.ts`
- `Makefile`
- `package.json` root scripts that were part of real release/signoff behavior
- `.env.example`
- iOS release helpers such as `ios/App/Gemfile` and Fastlane configuration
- OpenAPI/public-sync helpers such as `scripts/sync-openapi-public.mjs`
- bundle/performance/service validation scripts such as:
  - `scripts/check-bundle-budgets.mjs`
  - `scripts/check-performance-budgets.mjs`
  - `scripts/check-sentry-regression.mjs`
  - `scripts/validate-third-party.mjs`
  - `scripts/generate-payload-matrix.mjs`
  - `scripts/check-i18n-regressions.js`
  - `scripts/check-i18n-txt.js`
- release/bootstrap/asset-generation scripts such as:
  - `scripts/bootstrap.sh`
  - `scripts/generate-android-icons.mjs`
  - `scripts/generate-pwa-icons.mjs`
  - `scripts/generate-pwa-screenshots.mjs`
  - `scripts/generate-appstore-screenshots.mjs`
  - `scripts/generate-sitemap.mjs`
  - `scripts/submit-indexnow.mjs`
  - `scripts/upload-to-play-store.py`
- report inventories such as:
  - `reports/secrets-inventory.txt`
  - `reports/param-parity.json`
  - `reports/i18n-regression-baseline.json`
- generated report surfaces such as:
  - payload verification matrices
  - coverage-gap reports
  - bundle/performance reports
  - gallery artifact reports
  - nightly/guardian operator reports
- CI/quality config such as:
  - `.github/workflows/quality.yml`
  - `sonar-project.properties`

Legacy Makefile also treated several of these as launch/signoff concerns, including:

- `deploy`
- `indexnow`
- `signoff`
- `validate:services`
- `check:sentry`
- `sonar`
- `resources`
- `icons`
- `sitemap`
- gallery publish/merge flows

Current discovery docs also make the release/distribution matrix explicit, so root release/config parity now needs to remain aligned with:

- preview deploys and production approval for web/API
- Netlify-based rollout and rollback for web/API
- Play internal/testing/production promotion for Android
- TestFlight/App Store promotion for iOS
- signing ownership and rollback expectations for each platform

For 1.0 launch, these need to be classified as one of:

- required and restored
- replaced by current-main equivalents
- intentionally dropped

Current repo gap to resolve:

- `reports/` is currently near-empty on `main`, while legacy treated reports as a meaningful release/operator surface
- a final decision is still needed on which reports remain launch-relevant and where they should be generated, stored, and documented

### 7. Third-party integration inventory still needs a final treatment

Legacy branches carried a broader third-party integration surface than the current ledger names explicitly.

Still required:

- build a single explicit inventory of all third-party integrations needed for 1.0 launch
- decide which integrations are:
  - required at launch
  - optional but supported
  - intentionally deferred
  - obsolete and dropped
- ensure each retained integration has:
  - an owner
  - an environment-variable/config story
  - a privacy/compliance story
  - a verification step

Concrete legacy third-party/service categories that still need a final decision include:

- Firebase:
  - mobile project/config
  - Auth/JWKS use for optional MCP auth
- Sentry:
  - runtime error reporting
  - release/regression checks
- ads/monetization:
  - AdMob / native mobile ads
  - AdSense / web ads
  - any gallery/ad units or monetization surfaces
- analytics/telemetry:
  - Zaraz
  - any GA/GA4-style analytics posture still intended
  - event/telemetry ownership for launch
- privacy/compliance services:
  - Iubenda
  - privacy-policy / terms / consent integration
- Netlify platform services:
  - deploy/runtime configuration
  - blobs/cache/storage if still in active use
- mobile/store platform services:
  - Google Play upload/release tooling
  - Apple App Store Connect / Fastlane tooling
- product/discovery/feedback services named in current discovery docs:
  - Google Search Console
  - Bing Webmaster / Bing indexing
  - Apidog
  - Sleekplan
  - UptimeRobot
- any other validated external services covered by legacy `validate-third-party` workflows

For 1.0 launch, this must end in a truthful third-party matrix, not scattered implicit knowledge.

Current discovery docs also show ownership/criticality work still needed:

- some services are still marked `XX` or otherwise not fully classified in current inventory docs
- launch cannot be called complete while external services still lack clear:
  - owner
  - criticality
  - secret source
  - runtime owner
  - observability owner
  - cost owner

The final third-party/service inventory should preserve or replace explicit rows for the current runtime matrix, including:

- web app
- API
- email ingest
- symphony/Codex
- Ollama/local model router
- Linear guardian
- AI provider routing
- Sentry
- Sonar/Snyk
- GA / ads / AdSense / AdMob
- Firebase
- Apidog
- Sleekplan
- Iubenda
- UptimeRobot
- Netlify / Netlify Blobs
- Cloudflare / Zaraz
- Capacitor mobile shell
- Apple App Store Connect / TestFlight
- Android build toolchain
- PWA runtime
- Playwright / Appium / LHCI / OpenAPI tooling

Current discovery and runtime docs also show that launch readiness depends on keeping the service/runtime matrix truthful for:

- web app runtime
- Netlify API/runtime
- MCP/API public surface
- mobile runtime if mobile remains in scope
- harness/operator runtimes if those remain maintained

### 8. Environment secret and configuration inventory still needs to be formalized

Legacy branches included `.env.example` and multiple operational scripts that imply a broader secret/config surface than is currently centralized in the migration ledger.

Still required:

- produce a single launch-grade environment/config inventory for:
  - local development
  - CI
  - Netlify production
  - optional mobile builds
- classify every variable or credential as:
  - required
  - optional
  - launch-only
  - post-launch
- identify which values are public configuration vs secrets
- document rotation/ownership expectations for true secrets

This includes, at minimum:

- MCP/API auth variables
- Firebase project/config values
- Sentry DSN/environment/release values
- ads/analytics provider IDs and keys
- Cloudflare / Zaraz values if that remains the analytics edge path
- any privacy/compliance service identifiers
- Netlify/site/runtime config
- mobile release/signing-related configuration if mobile remains in scope
- App Store / Play Store publishing credentials if mobile remains in scope
- AI provider keys and service tokens if harness/operator tooling remains in scope
- operator/reporting tokens such as:
  - `LINEAR_API_KEY`
  - `NETLIFY_API_TOKEN`
  - `SONAR_TOKEN`
  - `SENTRY_TOKEN`

Legacy `.env.example` also shows a broader operator/tooling secret surface that still needs a classification, including:

- AI provider tokens:
  - `OPENAI_API_KEY`
  - `GOOGLE_GEMINI_API_KEY`
  - `GROQ_TOKEN`
  - `MISTRAL_TOKEN`
  - `OPENROUTER_TOKEN`
  - `GITHUB_MODELS_TOKEN`
  - `HUGGING_TOKEN`
  - `OLLAMA_API_KEY`
- release/distribution secrets:
  - Apple App Store Connect values
  - Android Studio / device-type / mobile-release related config
- email/notification/operations secrets:
  - `BREVO_SMTP_KEY`
  - `MSMTP_KEY`

The goal is to eliminate launch-blocking tribal knowledge around secrets and environment setup.

This inventory also needs to remain aligned with the service/runtime matrix so every critical system has a known:

- secret source
- owner
- deployment environment
- rotation expectation
- observability path

### 9. API/server launch surface still needs explicit 1.0 classification

The current platform uses Netlify delivery and public HTTP/MCP routes, but the legacy repository also carried additional root-level operational expectations around API-facing release readiness.

Still required:

- decide whether `apps/api` stays a reserved root or becomes a real launch surface
- classify which server/API capabilities are part of 1.0 launch versus post-launch expansion
- ensure public HTTP API, MCP, and server-render routes have a single truthful launch story
- ensure the MCP launch posture remains compatible with the intended ChatGPT/client consumption model, including whether launch stays public and free by default

For 1.0 launch, this means being explicit about:

- whether `netlify/*` is the only supported server surface
- whether `apps/api` remains deferred
- which public endpoints are launch-grade and documented
- whether MCP remains publicly consumable from ChatGPT without mandatory account auth at launch
- whether public schema artifacts are exposed and kept current at both:
  - `https://anqr.link/api/contract/qr`
  - public static schema locations such as `public/openapi.yaml`
- whether `dist/openapi.yaml` and any generated schema copy/sync path are part of the supported release surface or just build residue

This also now needs to stay consistent with the explicit 1.0 definition:

- API is part of the required launch platform set
- API currently remains intentionally public/unauthenticated for the anonymous-consumer launch posture
- any future enterprise-auth posture must not silently replace the anonymous launch story

### 10. Documentation and launch knowledge still need convergence

Legacy branches carried substantial operational and architectural documentation that should not be copied forward mechanically, but also should not be forgotten.

Still required:

- review legacy documentation and keep the knowledge that still matters under the new architecture
- rewrite retained knowledge into current-main terminology and ownership
- avoid copying stale module names, pre-hex architecture assumptions, or obsolete operational paths

Concrete legacy documentation/knowledge surfaces to review and converge include:

- architecture/overview documents
- launch checklist and signoff notes
- iOS/mac release handoff notes
- harness/agent/autonomous-framework docs
- module/reference docs for QR/render/payload/share/exporter/platform behavior
- reports around payload integrity, optimization roadmap, bundle budget, quality, and test-id coverage
- root operational bootstrap or contributor setup knowledge
- any public/legal/support knowledge that must survive in rewritten form under the new architecture
- feature knowledge captured in:
  - `docs/knowledge.md`
  - `docs/modules/*`
  - `docs/roadmap/gallery-generation.md`
  - `docs/reports/payload-integrity.md`
  - archived feature snapshots such as:
    - `docs/archive/knowledge-2026-02-18.md`
    - `docs/archive/payload-integrity-iteration-2.md`
    - `docs/archive/gallery-idea-2026-02-18.md`
    - `docs/archive/tbd-launch-checklist-2026-02-18.md`
- current discovery/program/runbook docs such as:
  - `docs/discovery/01-service-runtime-matrix.md`
  - `docs/discovery/08-external-services-inventory.md`
  - `docs/program/04-taxonomy.md`
  - `docs/program/05-scorecards-and-kpis.md`
  - `docs/workflows/symphony-execution.md`

Feature areas that need explicit migration knowledge capture include:

- current product-scope statements from legacy knowledge docs, including:
  - rich QR styling
  - gradients
  - overlays
  - dithering
  - animation
  - 25+ payload types
  - share-link round-tripping
  - 40+ language i18n
  - web monetization via AdSense
  - native monetization via AdMob
- gallery generation, hosting, and curation
- payload generation and payload verification
- share links and social/share surfaces
- overlay fixture assets and built-in examples
- static/legal/learn/examples page content and images
- QR art / artistic generation behavior where still part of launch scope
- SEO/static-page routing and public metadata behavior
- web/native monetization behavior and placement strategy
- i18n operational workflow and generated-content model
- launch signoff and smoke-test expectations for the current architecture
- service/runtime ownership, criticality, and secrets posture
- release KPI definitions such as:
  - parity pass rate
  - performance budget adherence
  - crash/error rate
  - release readiness
  - trust/privacy incidents

For 1.0 launch, the repo should have a current knowledge surface that explains:

- how to build and release the product in its current architecture
- how MCP/API are exposed and operated
- how mobile/gallery/i18n are converged or deferred
- how third-party integrations and launch constraints actually work now
- which product capabilities are actually part of the 1.0 promise

Current program/discovery docs also add launch-bar knowledge that should survive in the final rewritten docs:

- ANQR 1.0 success means stability across:
  - web
  - Android
  - iOS
- API backend is part of the product platform, not an optional sidecar
- gallery is both a marketing surface and a validation surface
- observability and analytics are launch-critical
- support/contact path must remain available via `email@anqr.link`
- the system is intended to remain observable, reversible, and human-supervised where financial, availability, or integrity risks exist
- launch success also depends on preserving or replacing explicit current-main docs for:
  - mission and non-negotiables
  - launch platforms and capabilities
  - critical user journeys and their success conditions
  - performance budgets and SLOs
  - release/distribution and rollback model
  - analytics, monetization, and attribution strategy
  - product KPIs and harness KPIs
  - cost/subscription approval policy and zero-cost preference

Current launch-scope and analytics docs also add specific product knowledge that should not be lost:

- advanced account systems are explicitly deferred because anonymous usage is the initial product posture
- AI-assisted QR generation is explicitly deferred as experimental
- complex marketing automation is deferred; early growth should rely mainly on SEO and organic discovery
- advanced analytics / ML insights are deferred until traffic scale justifies them
- attribution strategy includes:
  - Google Search Console
  - Bing Webmaster
  - backlink/social monitoring
  - Google Play / Apple App Store review monitoring
  - UTM campaign tagging and attribution

Legacy git history also shows additional launch-relevant themes that should be preserved in rewritten documentation or backlog decisions:

- SEO edge handling and dynamic meta-tag behavior
- gallery parity and hosted-gallery publication rules
- ad identifiers and app IDs moved into environment configuration
- startup diagnostics, deploy confirmation, and signoff guardrails
- accessibility and quality gate additions
- payload parity and share-parameter parity guardrails
- mobile release automation, App Store screenshots, and store metadata work
- operator/harness hardening and provider-failover behavior
- public asset refreshes such as icons, screenshots, and collateral

### 11. AI harness and operator tooling still need a final launch decision

Legacy branches carried meaningful harness/ops tooling under `scripts/ops` and `docs/harness`, not just developer experiments.

Still required:

- decide which AI-assisted operator/harness capabilities are part of the maintained launch toolchain
- classify which scripts are:
  - still required
  - superseded
  - archival only
- keep only the parts that genuinely support launch quality, reporting, or operational throughput

Concrete legacy harness/ops/tooling surfaces to review and classify include:

- nightly ops/reliability gates
- harness reporting
- provider operation docs
- Linear issue/workflow automation
- child-issue / feedback / robustness automation
- model-injector / LLM proxy tooling
- codex-credit / watchdog / guardian scripts
- free-audit provider experiments

Legacy env/config evidence also shows this tooling may depend on a non-trivial operator token surface:

- `LINEAR_API_KEY`
- multiple AI-provider API keys/tokens
- Netlify/Sonar/Sentry operator tokens

Those should be retained only if the harness/operator toolchain is intentionally still part of the maintained product ecosystem.

Current in-repo runtime docs also make this explicit:

- `scripts/ops/` is treated as the canonical harness runtime
- orchestration, governance, provider routing, reporting, notifications, runtime state, and issue/email/sonar integrations are first-class runtime concerns there

So migration completion still needs a final decision on whether that harness runtime is:

- part of the maintained 1.0 operating model
- archival internal tooling
- or split into launch-critical vs archival subsets

This is especially relevant if the product goal includes ChatGPT-facing QR generation and ongoing AI-assisted operational workflows.

### 11A. Fresh harness-engineering workspace bootstrap still needs a complete plan

The migration ledger is now expected to seed a fresh Linear workspace and the maintained harness runtime. That means it must preserve not only feature backlog, but also the operating model for governed autonomous execution.

Still required:

- define the fresh Linear workspace shape for the post-migration era
- recreate the project/epic structure needed for package-owned workstreams
- preserve the package architecture as work-routing structure, not just code structure
- preserve the harness execution/governance model so a fresh workspace can resume deterministic progress without relying on tribal memory

Recommended workspace structure to preserve or recreate:

- top-level program/epic tracks:
  - doctrine / governance
  - discovery / controls
  - product foundation
  - harness foundation
  - release readiness
  - growth / feedback
- package-oriented project tracks where sustained work is expected:
  - `packages/contracts/*`
  - `packages/domain/*`
  - `packages/application/*`
  - `packages/platform/*`
  - `apps/web`
  - `netlify/*`
  - later, mobile roots once canonical ownership is decided

Still required for that fresh workspace:

- decide whether there is:
  - one Linear project per package group
  - one Linear project per concrete package
  - or a hybrid model using package labels plus cross-cutting projects
- map package ownership to issue-routing rules
- map delivery surfaces, mobile, gallery, i18n, SEO, and harness work into explicit project streams
- decide what history is imported into the fresh workspace versus retained only as archive/reference

The fresh workspace also needs the harness-governance rules preserved explicitly:

- one bounded task per issue
- oversized work must decompose into child issues
- human-only work must be explicitly marked and routed out of the automation queue
- evidence is mandatory before an issue can be considered done
- verification commands and pass/fail outcomes belong in the issue trail
- package-boundary and quality gates must be part of issue acceptance, not optional afterthoughts

Current and legacy harness docs also show the fresh workspace must preserve:

- issue taxonomy:
  - `product`
  - `harness`
  - `governance`
  - `growth`
  - `release`
  - `incident`
  - `hygiene`
  - `research`
- authority levels:
  - observe
  - propose
  - implement
  - verify
  - promote
  - communicate-external
  - spend-money
- descriptor/queue semantics such as:
  - `[PARENT]`
  - `[CHILD]`
  - `[HUMAN]`
  - `[LOCAL-SLICE]`
  - `[HARNESS]`
  - `[Sonar]`

Harness execution model that still needs to be preserved or rebuilt explicitly:

- deterministic local validation before and after work
- harness-report -> guardian -> runner -> notify control flow
- queue depth control and stale/stuck handling
- bounded single-agent execution
- provider routing and fallback policy
- Sonar issue synchronization and priority gating
- evidence policy for Done state
- rollback and corrective-healing behavior

Runtime/platform details from current and legacy harness docs that still need an explicit disposition:

- whether user-level systemd timers remain the supported harness runtime
- whether the canonical timers/services remain:
  - Linear guardian
  - continuous ops
  - nightly ops
  - email ingest
  - CI monitor
- PATH/bootstrap requirements for systemd-managed Node tooling
- provider-credit gating and fallback chain
- Ollama/local-model role in the operating model
- whether Sonar findings remain blocking before non-Sonar work
- whether nightly quality, queue, and guardian reports remain launch-critical operational evidence
- whether `CHANGELOG.md`-style evidence/reporting expectations still survive in current-main form

If a fresh Linear is used, the migration is not complete until the new workspace has a truthful answer for:

- what projects exist
- what package or runtime each project owns
- what issue states exist
- what labels/taxonomy exist
- what evidence is required to close work
- what issues are launch-blocking
- what work is automation-eligible versus human-only
- what reports are generated on what cadence
- what quality gates are required before promotion or completion

The quality-gate families that need to be preserved explicitly in that workspace include:

- architecture/governance:
  - depcruise architecture gate
  - depcruise contracts gate
  - contracts structural check
  - AST-density audit
- code quality:
  - typecheck
  - lint
  - Sonar export/scan posture
- product/API:
  - OpenAPI generation
  - MCP/API contract/doc sync
  - route/public-surface verification
- release/product correctness:
  - unit tests
  - parity validation where applicable
  - gallery verification where applicable
  - performance budget checks where applicable
  - service/third-party validation where applicable
- operational harness:
  - queue health
  - guardian health
  - provider health/fallback status
  - report generation and archival

### 12. Linear issue history and operator state still need preservation

Legacy branches show that Linear was not incidental. It was part of the operating system for the project.

Still required:

- preserve the useful history of current and archived Linear work before any major tooling reset or process change
- decide what issue history needs to survive as:
  - exported snapshots
  - reports
  - archive docs
  - retained operator tooling
- ensure the new architecture/release process does not lose backlog, audit, or operator history that only exists in Linear-linked tooling today

Concrete Linear-related legacy surfaces to review and classify include:

- `scripts/ops/lib/linear-client.mjs`
- `scripts/ops/linear-*.mjs`
- `scripts/ops/create-*.mjs`
- `docs/harness/board-hygiene.md`
- `docs/operations/ops-autopilot.md`
- `docs/workflow/execution-workflow.md`
- `docs/harness/agent-first.md`
- `.codex/skills/linear/SKILL.md`
- reports and snapshots under `reports/linear-guardian/*` or equivalent current outputs

Historical preservation should cover both:

- current open/operator-relevant issue state
- archived or completed history that still explains why certain migration/release decisions were made

Current live Linear review confirms this is not a theoretical requirement.

At the time of this review:

- open workflow states (`Backlog`, `Todo`, `In Progress`, `In Review`, `Pending`, `Rework`) contained `201` issues
- closed workflow states (`Done`, `Canceled`, `Duplicate`) contained `74` issues
- recent completed history includes migration/cleanup slices such as:
  - strict-purity and dead-shim cleanup
  - Sonar cleanup waves
  - Netlify/server cleanup
- recent canceled history includes now-superseded migration approaches such as:
  - dissolving old `src/*` buckets by specific intermediate plans
  - earlier migration decomposition tracks that no longer describe the current architecture

This means migration completion should preserve not only active backlog, but also the canceled/completed history that explains why certain paths were abandoned.

Still required:

- export a launch-era Linear history snapshot before any major board cleanup or process reset
- preserve both open and closed issue context in a durable form outside live Linear
- capture the subset of issue history that explains:
  - architecture migration decisions
  - mobile/gallery/i18n/SEO launch decisions
  - operator/harness process evolution
  - quality/sonar/security cleanup history
- preserve the current backlog/reboot context already reflected in current docs such as `docs/03-linear-reboot-plan.md`

For migration completion, there should be a clear answer to:

- what Linear history is retained
- where it is retained
- how operators access it after migration
- which automation still depends on live Linear integration

### 13. Privacy/compliance surface still needs explicit launch ownership

Legacy branches show that privacy and legal content were part of the translated/static content surface, and third-party compliance integrations like Iubenda remain in scope.

Still required:

- decide the launch privacy/compliance posture explicitly
- ensure privacy policy and terms content are current in the new architecture
- decide whether cookie/consent/compliance tooling remains in scope and how it is integrated
- verify that ads/analytics/auth choices match the declared privacy/compliance posture

This should end in a launch-ready answer for:

- privacy policy
- terms
- consent/compliance tooling
- ads/analytics disclosure
- AI/MCP route disclosure where required
- mobile-store disclosure or review notes where required

Legacy launch and knowledge docs also surface additional compliance/ops checks that still need a final disposition:

- Iubenda banner/cookie-policy/legal-link behavior
- Google Consent Mode / TCF / ad-consent posture if ads remain in scope
- privacy/legal page availability across translated static-page families

Current program/discovery docs also make one non-negotiable privacy rule explicit:

- anonymous QR creation must remain possible

That means migration completion must preserve a truthful privacy/product posture where:

- core QR generation is not gated behind mandatory account auth
- tracking is not tied to QR content
- data collection stays minimal and understandable
- any MCP/API auth choice does not silently erase the anonymous launch posture

### 14. Testing is intentionally excluded from legacy import

This is an explicit non-goal for migration completion.

The project should not import legacy testing architecture wholesale just to claim completion.

Instead:

- Playwright/Appium/WebdriverIO/unit/integration testing should be rebuilt intentionally on `main`
- root testing config should be designed around the new architecture, not copied mechanically from legacy
- `packages/testing/*` should not be populated just to mirror old structure

Legacy evidence still matters for reference only:

- `playwright.config.ts`
- `wdio.conf.ts`
- old root `tests/`
- Appium/mobile test scripts and lanes

But these are reference inputs for a new test architecture, not required migration artifacts.

### 15. 1.0 launch completion checklist

Before the migration can honestly be called complete for a 1.0 launch, all of the following need a truthful disposition:

- current-platform architecture remains green
- current HTTP/MCP routes remain green and documented on `https://anqr.link`
- the intended ChatGPT-facing MCP launch posture is explicit, supported, and kept free if that remains the product goal
- mobile delivery is either imported or explicitly outside the 1.0 claim
- gallery is either restored or explicitly outside the 1.0 claim
- i18n generation and source-of-truth translation assets are either converged or explicitly outside the 1.0 claim
- public web assets and launch collateral are intentionally restored or regenerated
- SEO/discoverability behavior is intentionally restored or replaced
- root release/config scripts are classified as kept, replaced, or dropped
- third-party integrations are inventoried and intentionally owned
- environment secrets/config are centrally documented and deployable
- launch/operator documentation is current for the new architecture
- feature knowledge from legacy docs is either rewritten into current docs or explicitly archived as obsolete
- major launch-relevant themes from legacy git history are either rewritten into current knowledge or consciously dropped
- Linear/operator history is preserved in an intentional form
- privacy/compliance posture is explicit and matched to ads/analytics/auth behavior
- AI harness/operator tooling is classified as required, archival, or dropped
- tests are intentionally rebuilt on `main`, not silently omitted from the product quality story
- the explicit 1.0 launch platforms are truthful:
  - web
  - API
  - Android
  - iPhone
- the explicit 1.0 launch capabilities are truthful:
  - QR generation
  - QR analysis
  - gallery/showcase
  - export/sharing
  - observability
  - analytics
- the critical user journeys from the UX discovery docs are actually working and measured
- the published performance budgets and SLOs are either met or consciously revised in current docs before launch
- the current service/runtime matrix is truthful for every critical runtime and external service
- product KPIs are measurable and owned:
  - test pass rate
  - parity pass rate
  - performance budget adherence
  - crash/error rate
  - key user journey completion
  - retention / conversion proxies
  - release readiness
  - trust / privacy incidents
- harness KPIs are measurable and owned wherever the harness remains part of the maintained operating model
- the zero-cost / minimal-cost posture remains truthful and documented
- no automated system can silently create paid spend, subscription changes, or store-cost changes without explicit approval
- the documented launch blockers all have clear evidence to clear them:
  - cross-platform QR parity verified
  - scan reliability validated across devices/apps
  - mobile performance within budget
  - critical runtime errors stable/near-zero
  - CI pipeline stable
  - app store submission readiness proven
  - monitoring gaps closed
  - codebase maintainability at launch bar

Legacy launch-checklist evidence also means the following concrete production checks need an intentional owner or replacement in the new architecture:

- Netlify/CDN/header verification
- Cloudflare cache/Zaraz/edge behavior verification
- Sentry release/source-map/alert posture
- AdSense approval and live-slot behavior if web ads remain in scope
- AdMob approval and physical-device validation if mobile ads remain in scope
- GA/Zaraz analytics verification
- Iubenda/legal/consent verification
- gallery visual spot checks and hosted artifact verification
- multilingual smoke checks if i18n remains in scope

Current program/KPI docs also imply that launch completion should preserve or replace explicit scorecard ownership for:

- parity pass rate across web/API/Android/iOS
- performance budget adherence
- crash/error rate
- key user journey completion
- release readiness
- trust/privacy incidents

---

## Operational / External Work

These items are identified and important, but cannot be fully completed through local code edits alone.

### Netlify

Still required:

- configure deployed route-level rate limiting
- configure deployed traffic rules / WAF where available
- verify public route behavior for:
  - `https://anqr.link/api/contract/qr`
  - `https://anqr.link/api/mcp`

### Identity / JWT / JWKS

Still required:

- choose production auth posture
- set real Netlify env vars accordingly
- test deployed JWKS resolution and token verification if Firebase auth is enabled

### API / MCP operational policy

Still required:

- classify deployed routes explicitly as:
  - public
  - authenticated
  - admin/operator
  - AI tool
- define capability-level controls for MCP tools
- define cost controls for AI routes and MCP tool usage
- define bounded synchronous execution budgets
- define async fallback policy for long-running requests

This should remain aligned with the current cost/subscription policy:

- prefer free-tier and low-cost paths where possible
- keep paid model usage minimal unless explicitly approved
- keep ad spend off by default unless explicitly approved
- ensure AI/MCP launch posture remains compatible with a free public launch if that remains the product goal

### End-user / app-level identity posture

Still required if broader authenticated product surfaces remain in scope:

- decide the external identity-provider posture for end-user or app-level auth
- keep this separate from MCP-specific auth mode
- map verified identity and claims into application-facing authorization input
- preserve the rule that business authorization decisions stay in application, not in delivery or platform perimeter code

### Organizational / Team Security

Still required where relevant:

- Netlify SSO / RBAC / SCIM / org access hardening
- any launch/operator security posture outside the app runtime itself

### Launch governance / scorecards

Still required:

- decide which scorecards and KPIs are launch-blocking versus informational
- ensure weekly or release-time reporting still covers:
  - engineering status
  - product KPIs
  - harness KPIs
  - cost metrics
  - growth signals
- keep launch-readiness decisions tied to explicit evidence rather than tribal knowledge

---

## Recommended Next Order

### If continuing current-platform refinement

1. Thin `apps/web`
2. Thin `netlify/*`
3. Remove localized shims that no longer buy stability
4. Narrow runtime ports where they are broader than necessary
5. Move more public package surfaces to explicit `exports` where justified

### If continuing MCP/API rollout

1. Choose launch auth posture:
   - public MCP for launch
   - or Firebase-authenticated MCP
2. Configure Netlify perimeter rules for `/api/contract/qr` and `/api/mcp`
3. Set production Netlify env vars
4. Verify deployed API/MCP end-to-end from the real `https://anqr.link` host

### If continuing deferred repository convergence later

1. Remove premature scaffolds
2. Decide final root `src/` treatment
3. Converge mobile from legacy
4. Converge gallery, public assets, and i18n generation from legacy where still in scope for launch
5. Decide final testing architecture
6. Decide whether gallery remains app-owned or becomes a real package

### If initializing the fresh harness-engineering workspace

1. Freeze and export the current Linear/history context needed for migration traceability
2. Define the fresh workspace information architecture:
   - projects
   - epics/program tracks
   - states
   - labels/taxonomy
   - evidence policy
3. Map package/runtime ownership into explicit project streams, including cross-cutting streams for:
   - release readiness
   - mobile
   - gallery
   - i18n
   - SEO/discoverability
   - harness reliability
   - growth/monetization/compliance
4. Encode the quality gates as issue acceptance and promotion rules:
   - architecture gates
   - typecheck/lint/contracts/audit
   - parity/performance/release checks where applicable
5. Recreate or intentionally replace the harness runtime:
   - report
   - guardian
   - queue control
   - runner
   - notify
   - Sonar sync
6. Seed the fresh workspace from this document as the source of truth for:
   - current-platform completion work
   - 1.0 launch convergence work
   - deferred whole-repo work
   - external/operational work

### If restarting the documentation/context surface

1. Define the canonical root read order for:
   - humans
   - Codex
   - Codebuff
   - third-party AI review
2. Replace the migration-bundle-style root `README.md` with a stable post-migration operating handbook
3. Create the minimal maintained root bootstrap/context files needed for agent tooling
4. Re-home durable knowledge into clear buckets:
   - architecture
   - launch/product
   - harness/runtime
   - workflows/runbooks
   - archive/history
5. Mark generated artifacts and transitional residue clearly so they are not mistaken for canonical knowledge
6. Ensure the new documentation surface points back to this migration ledger for remaining work until migration is fully closed

---

## Validation Baseline

Use this set as the baseline local verification pass while continuing the work:

```bash
npm run typecheck
npm run lint
npm run depcruise:all
npm run contracts:check
npm run audit:ast
npm run openapi:generate
npm run test:unit
```

---

## Deletion Readiness

If the old migration documents are removed, the following will still be captured here:

- what is complete in architecture
- what remains for current-platform delivery refinement
- what remains for MCP/API operational rollout
- what is deferred for whole-repo convergence
- what is external and deploy-time only

That is the intended purpose of this file.
