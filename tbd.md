# ANQR — Exhaustive Launch & Post-Launch Checklist

> This document captures **every** outstanding action required before, during, and after launch.
> Items are grouped by category. Each includes the relevant URL/dashboard where applicable.

---

## 1. Pre-Deploy Smoke Test

- [ ] Run `make all` end-to-end from a clean state and confirm zero failures
- [ ] Visually inspect gallery output in `public/gallery/` — spot-check 5+ images
- [ ] Open `http://localhost:5173/` (dev) and verify: editor loads, QR generates, export works
- [ ] Open `/gallery`, `/about`, `/privacy`, `/terms`, `/guide`, `/learn`, `/examples`, `/analyze`
- [ ] Test the `/api/qr?data=https://anqr.link` endpoint returns a valid image
- [ ] Test share URL round-trip: generate a share link → open it → verify settings restore
- [ ] Test i18n: switch to 3+ languages (e.g. de-DE, ja-JP, ar) and verify UI strings + static pages

---

## 2. Netlify — Hosting & CDN

**Dashboard:** <https://app.netlify.com/sites/anqr-link>

- [ ] Confirm deploy succeeded (green badge) after `make deploy`
- [ ] Verify custom domain `anqr.link` is active with HTTPS
- [ ] Verify Netlify Functions are deployed: `https://anqr.link/.netlify/functions/qr` returns image
- [ ] Verify HSTS header: `curl -I https://anqr.link/` should show `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- [ ] Verify immutable cache headers: `curl -I https://anqr.link/assets/<any-hash>.js` should show `Cache-Control: public, max-age=31536000, immutable`
- [ ] Verify CSP header is present and not producing console errors
- [ ] Verify `X-Content-Type-Options: nosniff` and `X-Frame-Options: SAMEORIGIN` headers
- [ ] Verify precompressed assets (.gz/.br) are served with correct Content-Encoding
- [ ] Review Netlify Analytics (if enabled) for 404s or error spikes
- [ ] Confirm `_redirects` / `netlify.toml` redirects work: `/api/qr` → function, SPA catch-all → `index.html`

---

## 3. Sentry — Error Monitoring

**Dashboard:** <https://sentry.io/organizations/anqr/issues/>
**Projects:** `anqr-web` (web), `anqr-mobile` (Android)

- [ ] Verify Sentry is receiving events: trigger a test error or check "Issues" page
- [ ] Verify source maps are uploaded: check "Releases" → latest release has source maps
- [ ] Set up alert rules: email on new issue, Slack/webhook for high-volume errors
- [ ] Verify `SENTRY_AUTH_TOKEN` is set in environment for `make deploy` sourcemap upload
- [ ] Configure performance monitoring sampling rate (currently defaults)
- [ ] Review and resolve any pre-existing issues from dev/staging
- [ ] Verify release name matches deploy (`anqr@1.0.0` or git commit)

---

## 4. Google AdSense — Web Advertising

**Dashboard:** <https://www.google.com/adsense/new/u/0/pub-2270701384951162/home>

- [ ] Submit site for AdSense review (requires live site with real content)
- [ ] Wait for approval email from Google (typically 1–14 days)
- [ ] After approval: set `VITE_ADSENSE_TEST_MODE` from `true` → `false` in Makefile
- [ ] Redeploy after flipping test mode: `make deploy`
- [ ] Verify ads render on all placement slots (left/right skyscraper, sidebar, gallery, static pages)
- [ ] Verify `ads.txt` is accessible at `https://anqr.link/ads.txt` with correct publisher ID
- [ ] Monitor fill rate and revenue in AdSense dashboard after 48h
- [ ] Check ad placement complies with AdSense policies (no accidental clicks, proper labeling)

---

## 5. Google AdMob — Mobile Advertising

**Dashboard:** <https://admob.google.com/v2/home>
**App ID:** `ca-app-pub-2270701384951162~3067761782`

- [ ] Verify app is registered in AdMob console
- [ ] Wait for AdMob approval (separate from AdSense)
- [ ] After approval: set `VITE_ADMOB_TESTING` from `true` → `false` in Makefile
- [ ] Verify `capacitor.config.ts` has `initializeForTesting: false` (already set)
- [ ] Test on physical device: banner ads, interstitial on export, rewarded video
- [ ] Monitor fill rate in AdMob dashboard
- [ ] Review ad unit performance: bottom banner, top banner, export interstitial, gallery interstitial, generation interstitial, premium rewarded, HD export rewarded

---

## 6. Google Analytics / Cloudflare Zaraz

**Cloudflare Dashboard:** <https://dash.cloudflare.com/> → Zaraz
**Note:** GA4 is handled via Cloudflare Zaraz — no direct `gtag.js` in the bundle.

- [ ] Verify Zaraz is collecting pageview events on `anqr.link`
- [ ] Verify key events are tracked (if configured): export, gallery view, share, language switch
- [ ] Set up GA4 conversions for key actions (export, share)
- [ ] Verify real-time reports show live traffic after launch
- [ ] Configure data retention period (default 14 months)
- [ ] Ensure Zaraz respects iubenda consent signals (GDPR compliance)

---

## 7. iubenda — Privacy & Cookie Consent

**Dashboard:** <https://www.iubenda.com/en/dashboard>
**Site ID:** `4407480` | **Policy ID:** `70266922`

- [ ] Verify cookie banner appears on first visit to `anqr.link`
- [ ] Verify privacy policy link works: `https://www.iubenda.com/privacy-policy/70266922`
- [ ] Verify consent preferences are saved and respected on return visits
- [ ] Verify cookie policy widget loads (embedded script in `index.html`)
- [ ] Review and update privacy policy if any new data processing was added
- [ ] Verify GDPR consent mode integrates with AdSense (TCF v2 compliance)
- [ ] Test "reject all" — ads should not personalize, analytics should be anonymized

---

## 8. Google Search Console — SEO

**Dashboard:** <https://search.google.com/search-console>

- [ ] Add and verify property for `anqr.link` (DNS TXT or HTML meta tag)
- [ ] Add `google-site-verification` meta tag to `index.html` once verification code is obtained
- [ ] Submit sitemap: `https://anqr.link/sitemap.xml`
- [ ] Verify sitemap is accepted and all URLs are indexed
- [ ] Check "Coverage" report for indexing errors after 1 week
- [ ] Check "Core Web Vitals" report for LCP/FID/CLS issues
- [ ] Request indexing for key pages: `/`, `/gallery`, `/guide`, `/learn`, `/examples`
- [ ] Verify hreflang tags are recognized (80+ language variants)
- [ ] Monitor "Search Appearance" → structured data for `WebSite` and `SoftwareApplication` schemas

---

## 9. Google PageSpeed Insights — Performance

**Tool:** <https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fanqr.link%2F>

- [ ] Run PSI on desktop — target score ≥ 90
- [ ] Run PSI on mobile — target score ≥ 80
- [ ] Verify preconnect count ≤ 4 (currently: fonts.googleapis.com, fonts.gstatic.com, pagead2.googlesyndication.com, cdn.iubenda.com)
- [ ] Verify no layout shift (CLS < 0.1)
- [ ] Verify LCP < 2.5s
- [ ] Verify FID/INP < 200ms
- [ ] Compare results against pre-remediation baseline
- [ ] Re-test `/gallery` page separately (heavier page with many images)

---

## 10. HSTS Preload

**Submission:** <https://hstspreload.org/?domain=anqr.link>

- [ ] Verify HSTS header includes `preload` directive (already in netlify.toml)
- [ ] Submit `anqr.link` to HSTS preload list
- [ ] Note: inclusion takes weeks/months — check status periodically

---

## 11. Google Play Console — Android App

**Dashboard:** <https://play.google.com/console>

- [ ] Create app listing with screenshots, description, feature graphic
- [ ] Upload AAB: `make android:upload` (or manual upload of `android/app/build/outputs/bundle/release/app-release.aab`)
- [ ] Complete Play Store listing: title, short description, full description, screenshots (phone + 7" + 10" tablet)
- [ ] Set content rating (fill out questionnaire)
- [ ] Set pricing and distribution (free, all countries)
- [ ] Set app category: Tools / Utilities
- [ ] Submit for review
- [ ] After approval: verify listing is live and app installs correctly
- [x] Generate PWA install screenshots for manifest.json — automated via `make screenshots` (Playwright)

---

## 12. GitHub — Source Control

**Private repo:** <https://github.com/maldous/anqr> (via `git@github-private:maldous/anqr.git`)
**Public i18n repo:** <https://github.com/maldous/anqr-i18n>

- [ ] Push final pre-launch commit: `git add -A && git commit -m "chore: launch preparation" && git push`
- [ ] Push i18n translations: `make push` (pushes both i18n subtrees + origin)
- [ ] Verify i18n public repo has latest translations on `static` and `locales` branches
- [ ] Tag release: `git tag v1.0.0 && git push --tags`
- [ ] Consider adding branch protection rules on `master`
- [ ] Ensure `.gitignore` covers all generated artifacts (dist/, reports/*.json, etc.)

---

## 13. Security Checklist

- [ ] Run `npm audit --audit-level=high` — resolve any high/critical vulnerabilities
- [ ] Run `osv-scanner --lockfile package-lock.json` (if installed)
- [ ] Run `semgrep --config auto src/` (if installed)
- [ ] Verify CSP header blocks inline script injection (test with browser DevTools)
- [ ] Verify no sensitive data in client bundle (grep for tokens, keys, passwords)
- [ ] Verify Sentry DSN is the only credential exposed client-side (expected, not a secret)
- [ ] Verify SonarQube token in Makefile is for local-only server (not exposed in production)
- [ ] Review `netlify.toml` security headers are all present after deploy
- [ ] Verify `robots.txt` doesn't expose sensitive paths
- [ ] Verify no `.env` files are committed to git
- [ ] Verify `package-lock.json` is committed and `lockfile-lint` passes

---

## 14. SEO & Branding

- [ ] Verify `og-image.png` (1200×630) looks good when shared on social media — test with <https://www.opengraph.xyz/url/https%3A%2F%2Fanqr.link%2F>
- [ ] Verify Twitter card renders correctly — test with Twitter card validator
- [ ] Verify JSON-LD structured data is valid — test with <https://search.google.com/test/rich-results?url=https%3A%2F%2Fanqr.link%2F>
- [ ] Verify `canonical` URL is correct on all routes
- [ ] Verify `robots.txt` allows all crawlers and references sitemap
- [ ] Verify sitemap includes all important routes (including language variants)
- [ ] Submit site to Bing Webmaster Tools: <https://www.bing.com/webmasters>
- [ ] Consider submitting to web directories / "best QR code generator" lists
- [ ] Verify PWA manifest is valid — test with Chrome DevTools → Application → Manifest
- [ ] Verify favicon renders correctly in browser tabs (using inline SVG data URI)

---

## 15. Monitoring & Observability (Post-Launch)

- [ ] Set up uptime monitoring for `https://anqr.link/` (e.g. UptimeRobot, Netlify status)
- [ ] Set up uptime monitoring for `https://anqr.link/api/qr?data=test` (API endpoint)
- [ ] Monitor Sentry error volume daily for first week
- [ ] Monitor Netlify build minutes usage
- [ ] Monitor bandwidth usage (Netlify has 100GB/month on free tier)
- [ ] Set up Sentry alert for error spike (>10 errors in 1 hour)
- [ ] Review Cloudflare analytics weekly for traffic patterns
- [ ] Monitor Core Web Vitals in Search Console after 28 days of data

---

## 16. Version Management

- [ ] Update `package.json` version from `1.0.0` to release version before launch
- [ ] Update Android `versionCode` / `versionName` via `make android:bump`
- [ ] Tag git release: `git tag v1.0.0`
- [ ] Consider semantic versioning strategy for future releases
- [ ] Document release process in knowledge.md or CONTRIBUTING.md

---

## 17. Quality Follow-ups (Non-blocking)

- [ ] Coverage depth improvement for critical low-coverage files: `qr-generator-class.ts` (52%), `scaled-render.ts` (44%), `qr-decoder/extract.ts` (50%)
- [ ] Gallery scan matrix: re-run with preprocessing + dithering scenarios after gallery:fresh
- [ ] Community translation contributions via `anqr-i18n` public repo — add README with contribution guidelines
- [ ] Run full `make test:permutations` overnight to verify all settings combinations
- [ ] Generate dependency graph: `make dep` and review for circular dependencies
- [x] Run SonarQube analysis: `make sonar` — now included in pipeline (step 12)
- [x] Create `public/screenshots/desktop.png` and `public/screenshots/mobile.png` for PWA manifest — automated via `make screenshots`
- [ ] Review and update `knowledge.md` after any significant post-launch changes

---

## 18. Third-Party Service Tokens & Access

### Available & Working

| Service | Token/Credential | Status | Notes |
|---------|-----------------|--------|-------|
| Netlify | CLI auth (`.netlify/state.json`) | ✅ Working | Site ID: `7def13e4-9486-4e9a-9ad3-87abff74ef1d`, domain: `anqr.link` |
| Sentry | `SENTRY_TOKEN` / `SENTRY_AUTH_TOKEN` (`sntryu_...`) | ✅ Working | Org: `anqr`, 3 projects: `anqr-web`, `anqr-mobile`, `anqr-api`. `vite.config.ts` falls back from `SENTRY_AUTH_TOKEN` → `SENTRY_TOKEN` |
| Cloudflare | `CLOUDFLARE_TOKEN_READALL` | ✅ Working | Zone: `anqr.link` (`9e9c...`), read-only access for DNS/SSL validation |
| Cloudflare | `CLOUDFLARE_TOKEN` | ⚠️ Not validated | Write token — not tested, may be needed for DNS changes |
| Snyk | `SNYK_TOKEN` | ✅ Auth works | No orgs/projects configured yet |
| SonarQube | `SONAR_TOKEN` / `SONARQUBE_TOKEN` | ✅ Working | Local server running at `localhost:9000` |

### Missing / TBD

| Service | What's Needed | Why | Priority |
|---------|--------------|-----|----------|
| Google Play Console | `play-store-key.json` (service account JSON) | Automated AAB upload via `make android:upload` → `scripts/upload-to-play-store.py` | ✅ Available (not committed to git) |
| Google Cloud Console | OAuth2 service account or access token | Firebase Admin API access for project validation | 🟡 MEDIUM — manual console access works |
| AdSense | Production approval from Google | Currently in test mode (`VITE_ADSENSE_TEST_MODE=true`) | 🔴 HIGH — no revenue until approved |
| AdMob | Production approval from Google | Currently in test mode (`VITE_ADMOB_TESTING=true`) | 🔴 HIGH — no revenue until approved |

### Available But Not Used by Project

| Token | Service | Notes |
|-------|---------|-------|
| `GOOGLE_GEMINI_API_KEY` | Google Gemini AI | Not integrated into ANQR |
| `GOOGLE_PLACES_API_KEY` | Google Places | Not integrated into ANQR |
| `ELEVENLABS_API_KEY` | ElevenLabs TTS | Not integrated into ANQR |
| `GITLAB_TOKEN` | GitLab | Project uses GitHub, not GitLab |
| `HUGGING_FACE_READ_TOKEN` | Hugging Face | Not integrated into ANQR |
| `BREVO_SMTP_KEY` | Brevo (email) | DNS records configured (DKIM, SPF) but no email sending in app |

Validation: run `make validate:services` to check all services automatically.

---

## 19. Google Project Confusion

### Known Configuration

| Property | Value | Source File |
|----------|-------|-------------|
| Firebase project ID | `anqr-link` | `android/app/google-services.json` |
| Firebase project number | `132751292439` | `android/app/google-services.json` |
| Firebase storage bucket | `anqr-link.firebasestorage.app` | `android/app/google-services.json` |
| Firebase API key | `AIzaSyAB6tWdMmLmIhz6DLKqZZHFGzkyYY6VQ20` | `android/app/google-services.json` |
| Android app package | `link.anqr.app` | `capacitor.config.ts`, `google-services.json`, `upload-to-play-store.py` |
| AdMob App ID | `ca-app-pub-2270701384951162~3067761782` | `capacitor.config.ts` |
| AdSense Publisher ID | `pub-2270701384951162` | `public/ads.txt` |
| AdMob Publisher ID | `pub-2270701384951162` | Same publisher as AdSense ✅ |

### The Confusion

Multiple Google project names exist:
- `anqr.link` — the production domain (Cloudflare DNS → Netlify)
- `anqr-link` — the Firebase project ID (in `google-services.json`)
- Possibly another `anqr-link` project created in Google Cloud Console

### TBD: Verify in Google Cloud Console

- [ ] Only **ONE** active Google Cloud project is being used for this app
- [ ] Firebase, AdMob, and AdSense all link to the **same** project (`anqr-link`)
- [ ] Android app (`link.anqr.app`) is registered in the correct project
- [ ] Web property is configured for the correct domain (`anqr.link`)
- [ ] The `mobilesdk_app_id` (`1:132751292439:android:03e858e36be3fc1a458452`) matches Play Console

---

## 20. Sentry Issues — Current State

**Dashboard:** <https://sentry.io/organizations/anqr/issues/>

5 unresolved issues found (supplements the checklist in §3):

| # | Issue | Events | Severity | Action |
|---|-------|--------|----------|--------|
| 1 | `AdMob.prepareRewardedInterstitialAd() is not implemented on web` | 878 | ℹ️ Expected | Suppress with Sentry inbound filter (expected on web) |
| 2 | `AdMob.prepareRewardedAd() is not implemented on web` | 1752 | ℹ️ Expected | Suppress with Sentry inbound filter (expected on web) |
| 3 | `[QART] ECC budget exceeded - falling back to binary search` | 112 | ℹ️ Non-critical | Graceful fallback — informational only |
| 4 | `ReferenceError: Grid3x3 is not defined` | 2 | ⚠️ Investigate | Possibly cached deploy — monitor after next deploy |
| 5 | `AdMob.prepareRewardedAd() is not implemented on android` | 2 | ⚠️ Investigate | Check `@capacitor-community/admob` plugin version |

### TBD: Sentry Actions

- [ ] Suppress issues #1 and #2 with Sentry inbound filter or issue rule
- [ ] Resolve issue #4 (`Grid3x3`) — monitor after next deploy
- [ ] Investigate issue #5 — `prepareRewardedAd` should work on Android
- [ ] Set up Sentry alert rules: email on new issue, spike detection (>10 errors/hour)
- [ ] Verify source maps uploading correctly on `make deploy` (`SENTRY_UPLOAD=true`)

---

## 21. Ad Revenue Readiness

### AdSense (Web) — Current State

| Item | Current State | Target |
|------|--------------|--------|
| Publisher ID | `ca-pub-2270701384951162` | ✅ Configured |
| Test mode | `VITE_ADSENSE_TEST_MODE=true` | Set to `false` after approval |
| Ad slots configured | 30+ slots across all pages | ✅ Complete |
| `ads.txt` | `public/ads.txt` with correct publisher | ✅ Present |
| Google approval | ❌ Pending | Submit after site is live |

### AdMob (Android) — Current State

| Item | Current State | Target |
|------|--------------|--------|
| App ID | `ca-app-pub-2270701384951162~3067761782` | ✅ Configured |
| Test mode | `VITE_ADMOB_TESTING=true` | Set to `false` after approval |
| Banner ads | 2 units (top, bottom) | ✅ Configured |
| Interstitial ads | 3 units (export, gallery, generation) | ✅ Configured |
| Rewarded ads | 2 units (premium, export HD) | ✅ Configured |
| Test fallback IDs | Google test IDs | ✅ Fallback in code |
| Google approval | ❌ Pending | Submit after app published |

### Revenue Unlock Steps (Ordered)

1. Deploy live site → `make deploy`
2. Submit `anqr.link` for AdSense review
3. Receive AdSense approval → set `VITE_ADSENSE_TEST_MODE=false` → redeploy
4. Publish Android app to Play Store → `make android:upload`
5. Submit app for AdMob review
6. Receive AdMob approval → set `VITE_ADMOB_TESTING=false` → rebuild & upload

---

## 22. Environment Variable Reference

```bash
# ═══════════════════════════════════════════════════════
# REQUIRED for automated operations
# ═══════════════════════════════════════════════════════

# Sentry — error monitoring & sourcemap upload
export SENTRY_AUTH_TOKEN=...        # Preferred (Sentry convention)
export SENTRY_TOKEN=...             # Fallback (vite.config.ts checks both)
export SENTRY_ORG=anqr              # Sentry organization slug
export SENTRY_PROJECT=anqr-web      # Default Sentry project for web builds

# ═══════════════════════════════════════════════════════
# RECOMMENDED for full validation
# ═══════════════════════════════════════════════════════

# Cloudflare — DNS, SSL, zone checks
export CLOUDFLARE_TOKEN_READALL=... # Read-only access (DNS, SSL validation)
export SNYK_TOKEN=...               # Snyk security scanning

# ═══════════════════════════════════════════════════════
# OPTIONAL (specific workflows)
# ═══════════════════════════════════════════════════════

export CLOUDFLARE_TOKEN=...         # Write access (DNS changes) — not validated
export SONAR_TOKEN=...              # Local SonarQube server only (localhost:9000)
export SONARQUBE_TOKEN=...          # Alias for SONAR_TOKEN

# ═══════════════════════════════════════════════════════
# SET IN MAKEFILE (not user-provided)
# ═══════════════════════════════════════════════════════

# Ad configuration — controlled via Makefile env vars, not shell:
# VITE_ADSENSE_ENABLED, VITE_ADSENSE_PUBLISHER_ID, VITE_ADSENSE_TEST_MODE
# VITE_ADMOB_TESTING, VITE_ADMOB_BANNER_*, VITE_ADMOB_INTERSTITIAL_*
# VITE_ADMOB_REWARDED_*, VITE_ADSENSE_SLOT_* (30+ slots)

# ═══════════════════════════════════════════════════════
# NOT CURRENTLY USED BY PROJECT
# ═══════════════════════════════════════════════════════

export GOOGLE_GEMINI_API_KEY=...    # Available but not integrated
export GOOGLE_PLACES_API_KEY=...    # Available but not integrated
export ELEVENLABS_API_KEY=...       # Available but not integrated
export GITLAB_TOKEN=...             # Project uses GitHub, not GitLab
export HUGGING_FACE_READ_TOKEN=...  # Available but not integrated
export BREVO_SMTP_KEY=...           # DNS configured, no app integration
```

---

## 23. `make all` Pipeline (Documented)

The `make all` pipeline covers 16 steps:

```
 1. install       — npm install + hooks + Playwright browsers
 2. i18n:pull     — pull community translations (non-blocking)
 3. i18n:xlate    — auto-translate missing strings (free Google Translate)
 4. i18n:fill     — regenerate all i18n TS/JSON from txt
 5. assets        — PWA icons + Android icons + sitemap
 6. build         — production bundle (tsc + Vite)
 7. gallery       — gallery images + PWA screenshots (serve → Playwright)
 8. test          — quality gates + unit + E2E (19 checks)
 9. validate      — overlay audit + scan matrix + signoff
10. gallery:update — copy Tier A scan-validated overlays back to gallery
11. reports       — payload matrix + i18n + coverage gap
12. sonar         — SonarQube code analysis (non-blocking)
13. deploy        — rebuild with Sentry + Netlify deploy
14. android       — release AAB + upload to Play Store
15. services      — third-party service validation (non-blocking)
16. i18n:push     — push translations + final summary
```

### Previously Known Gaps — All Resolved

All gaps that were previously listed as intentional exclusions have been resolved and integrated into the pipeline:

| Previous Gap | Resolution |
|-------------|------------|
| `i18n:xlate` not in pipeline | ✅ Added as step 3 — uses free Google Translate (gtx endpoint), no API key required |
| `i18n:pull` / `i18n:push` not in pipeline | ✅ Added as steps 2 and 16 — git remote `anqr-i18n` is configured |
| `android:upload` not in pipeline | ✅ Added to step 14 — `play-store-key.json` available (not committed to git) |
| `sonar` not in pipeline | ✅ Added as step 12 — SonarQube running locally on `localhost:9000` |
| Gallery overlay images gap | ✅ Fixed as step 10 — Tier A artifacts are now copied back to gallery before deploy |

Non-blocking steps (2, 3, 12, 15, 16) use `|| echo/true` to avoid breaking the pipeline if a service is temporarily unavailable.

---

## 24. External Service URLs — Quick Reference

| Service | Dashboard URL | Purpose |
|---------|--------------|---------|
| Netlify | <https://app.netlify.com> | Hosting, CDN, Functions, Deploy |
| Sentry | <https://sentry.io/organizations/anqr/> | Error monitoring, Source maps |
| Google AdSense | <https://www.google.com/adsense> | Web advertising |
| Google AdMob | <https://admob.google.com> | Mobile advertising |
| Cloudflare | <https://dash.cloudflare.com> | Zaraz analytics, DNS |
| iubenda | <https://www.iubenda.com/en/dashboard> | Privacy policy, Cookie consent |
| Google Search Console | <https://search.google.com/search-console> | SEO, Indexing, Sitemaps |
| Google Play Console | <https://play.google.com/console> | Android app distribution |
| Google PageSpeed | <https://pagespeed.web.dev> | Performance testing |
| HSTS Preload | <https://hstspreload.org> | HSTS preload list submission |
| GitHub (private) | <https://github.com/maldous/anqr> | Source code |
| GitHub (i18n) | <https://github.com/maldous/anqr-i18n> | Community translations |
| OpenGraph Tester | <https://www.opengraph.xyz> | Social sharing preview |
| Rich Results Test | <https://search.google.com/test/rich-results> | Structured data validation |
| Bing Webmaster | <https://www.bing.com/webmasters> | Bing SEO |
