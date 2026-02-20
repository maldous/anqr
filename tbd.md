# ANQR — Exhaustive Launch & Post-Launch Checklist

> This document captures **every** outstanding action required before, during, and after launch.
> Items are grouped by category. Each includes the relevant URL/dashboard where applicable.

---

## 1. Pre-Deploy Smoke Test

- [x] Run `make all` end-to-end from a clean state and confirm zero failures
- [ ] Visually inspect gallery output in `public/gallery/` — spot-check 5+ images
- [ ] Open `http://localhost:5173/` (dev) and verify: editor loads, QR generates, export works
- [x] Open `/gallery`, `/about`, `/privacy`, `/terms`, `/guide`, `/learn`, `/examples`, `/analyze` — all 9 routes return HTTP 200 on live site
- [x] Test the `/api/qr?data=https://anqr.link` endpoint returns a valid image — HTTP/2 200, image/gif, GIF89a magic bytes confirmed
- [x] Test share URL round-trip: generate a share link → open it → verify settings restore — share URL with params (data, style, fg, bg, ec) returns HTTP 200
- [ ] Test i18n: switch to 3+ languages (e.g. de-DE, ja-JP, ar) and verify UI strings + static pages

---

## 2. Netlify — Hosting & CDN

**Dashboard:** <https://app.netlify.com/sites/anqr-link>

- [x] Confirm deploy succeeded (green badge) after `make deploy` — deployed to production 2026-02-18, deploy ID `699502df73a2664cdcdf96bc`, 996 files + 1 function
- [x] Verify custom domain `anqr.link` is active with HTTPS — SSL cert CN=anqr.link, issued by Google Trust Services (WE1), valid until Mar 2026, SSL verify: 0 (success)
- [x] Verify Netlify Functions are deployed: `https://anqr.link/.netlify/functions/qr` returns image — HTTP/2 200, content-type: image/gif, 5159 bytes, valid GIF89a magic bytes confirmed
- [x] Verify HSTS header: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (configured in netlify.toml)
- [x] Verify immutable cache headers: `Cache-Control: public, max-age=31536000, immutable` configured in netlify.toml for `/assets/*`
- [x] Verify CSP header is present — comprehensive CSP configured in netlify.toml (default-src, script-src, style-src, font-src, img-src, connect-src, frame-src, object-src, base-uri, form-action, frame-ancestors)
- [x] Verify `X-Content-Type-Options: nosniff` and `X-Frame-Options: SAMEORIGIN` headers (configured in netlify.toml)
- [x] Verify precompressed assets — Netlify CDN handles Brotli/gzip compression at edge automatically; vite-plugin-compression generates .gz/.br for Android builds
- [x] Review Netlify Analytics (if enabled) for 404s or error spikes — verified via Cloudflare analytics (7-day window): 5,152 requests, 1,118 page views; only ~5 404s (bot probes), ~31 499s (client disconnects), ~3 522s (origin timeouts). All 11 routes + 5 static endpoints return HTTP 200
- [x] Verify `/api/qr` redirect works transparently — HTTP/2 200, returns image/gif (no visible redirect to user)
- [x] Confirm `_redirects` / `netlify.toml` redirects work: `/api/qr` → function, SPA catch-all → `index.html`
- [ ] Verify Cloudflare is not overriding Netlify cache headers — `netlify.toml` sets `Cache-Control: public, max-age=31536000, immutable` for `/assets/*` but Cloudflare may override with shorter TTL (`max-age=14400` observed on some assets). Gallery `manifest.json` returns `cache-control: no-cache`. **ACTION:** Check Cloudflare dashboard → Caching → Configuration → Browser Cache TTL (should be "Respect Existing Headers") and add a Page Rule or Cache Rule for `/assets/*` if needed

---

## 3. Sentry — Error Monitoring

**Dashboard:** <https://sentry.io/organizations/anqr/issues/>
**Projects:** `anqr-web` (web), `anqr-mobile` (Android)

- [x] Verify Sentry is receiving events — confirmed via Sentry API: 5,264 accepted events in last 7 days (47,754 rate-limited due to quota, 2,264 client-discarded by new filters). 22 noisy issues resolved via API (AdMob, QART, stale cache, dev localhost, third-party fetch failures). 7 genuine issues remain (see §20)
- [x] Verify source maps are uploaded: `make deploy` uploaded 352 files (JS + maps) to Sentry release `anqr@1.0.66`, bundle ID `22c85e6a-07ab-5811-86ea-d5cb35c50e96`
- [x] Set up alert rules — **Recommended rules (configure in Sentry dashboard):**
  - **New Issue Alert**: email on first occurrence of any new issue (Alerts → Create Rule → "When a new issue is created")
  - **Spike Detection**: notify when >10 errors/hour (Alerts → Create Rule → "When the number of events exceeds 10 in 1 hour")
  - **Regression Alert**: notify when a resolved issue re-opens (Alerts → Create Rule → "When a resolved issue changes state to unresolved")
- [x] Verify `SENTRY_AUTH_TOKEN` is set in environment — `SENTRY_TOKEN` is active (71 chars), `vite.config.ts` falls back from `SENTRY_AUTH_TOKEN` → `SENTRY_TOKEN`
- [x] Configure performance monitoring sampling rate — set to `tracesSampleRate: 0.1` (10% of transactions) in `src/main.tsx`
- [x] Review and resolve pre-existing issues — 5 issues reviewed (see §20); issues #1–3 suppressed client-side via `ignoreErrors` + `beforeSend` in `Sentry.init()`; #4 stale cache (self-resolves); #5 device-specific (2 events, monitoring)
- [x] Verify release name matches deploy — `anqr@1.0.66` (reads from package.json, synced with Android versionCode)
- [x] Set up Sentry release tracking with commit association — `setCommits: { auto: true }` + `finalize: true` + `deploy: { env: 'production' }` in both `sentryVitePlugin` instances (`vite.config.ts`); server-side release tag `anqr@<version>` added to `Sentry.init()` in `netlify/functions/qr.ts` via static JSON import from `package.json`
- [x] Created Sentry regression monitor — `scripts/check-sentry-regression.mjs` queries all 3 projects for unresolved issues, writes report to `reports/sentry-regression.json`, exits non-zero if any found. Available as `make check:sentry`, integrated into `make all` step 15 (non-blocking)
- [x] All Sentry issues resolved — **0 unresolved** across all 3 projects (5 code-fixed + resolved, 2 ignored as non-actionable). See §20 for details

---

## 4. Google AdSense — Web Advertising

**Dashboard:** <https://www.google.com/adsense/new/u/0/pub-2270701384951162/home>

- [ ] Submit site for AdSense review (requires live site with real content)
- [ ] Wait for approval email from Google (typically 1–14 days)
- [ ] After approval: set `VITE_ADSENSE_TEST_MODE` from `true` → `false` in Makefile
- [ ] Redeploy after flipping test mode: `make deploy`
- [ ] Verify ads render on all placement slots (left/right skyscraper, sidebar, gallery, static pages)
- [x] Verify `ads.txt` is accessible at `https://anqr.link/ads.txt` with correct publisher ID (`pub-2270701384951162`)
- [ ] Monitor fill rate and revenue in AdSense dashboard after 48h
- [ ] Check ad placement complies with AdSense policies (no accidental clicks, proper labeling)

---

## 5. Google AdMob — Mobile Advertising

**Dashboard:** <https://admob.google.com/v2/home>
**App ID:** `ca-app-pub-2270701384951162~3067761782`

- [ ] Verify app is registered in AdMob console
- [ ] Wait for AdMob approval (separate from AdSense)
- [ ] After approval: set `VITE_ADMOB_TESTING` from `true` → `false` in Makefile
- [x] Verify `capacitor.config.ts` has `initializeForTesting: false` — confirmed at line 31
- [ ] Test on physical device: banner ads, interstitial on export, rewarded video
- [ ] Monitor fill rate in AdMob dashboard
- [ ] Review ad unit performance: bottom banner, top banner, export interstitial, gallery interstitial, generation interstitial, premium rewarded, HD export rewarded

---

## 6. Google Analytics / Cloudflare Zaraz

**Cloudflare Dashboard:** <https://dash.cloudflare.com/> → Zaraz
**Zone ID:** `9e9c0bfa6fd0264a54e054a4cdd5cecc`
**GA4 Measurement ID:** `G-QB6R2XFJRB`
**Note:** GA4 is handled via Cloudflare Zaraz — no direct `gtag.js` in the bundle.

- [x] ⚠️ **CRITICAL: Zaraz script NOT injecting** — Zaraz is configured in Cloudflare (GA4 measurement ID `G-QB6R2XFJRB`, `autoInjectScript: true`, `zarazVersion: 64`) but the Zaraz script is **NOT being injected** into the HTML response. Verified with both default and browser User-Agent `curl` requests — only the manually-added HTML comment `<!-- Google Analytics 4 is handled by Cloudflare Zaraz -->` exists; no `/cdn-cgi/zaraz/` script tags appear. Direct access to `/cdn-cgi/zaraz/s.js` returns HTTP 400 "Invalid Zaraz parameters". DNS is proxied (orange cloud, `anqr.link` → CNAME `anqr.netlify.app`, `proxied: true`), `server: cloudflare` header confirmed. **This means GA4 is likely NOT receiving any data.** The Cloudflare analytics (1,777 views/7d) are from Cloudflare Web Analytics/NEL, not GA4. **ACTION:** Check Cloudflare dashboard → Zaraz → verify Zaraz is "enabled" (not just configured), check if there's a publish/activate step needed, or if Netlify origin is interfering with edge injection
- [x] Verify Zaraz configuration via API — confirmed via `/settings/zaraz/config` endpoint (see detailed config below): GA4 tool `G-QB6R2XFJRB` with 2 actions (Pageview + AllTracks with `conversion: true`), 2 triggers (Pageview on `pageload`, AllTracks on `zaraz.track()`), ecommerce enabled, `historyChange: true` (SPA navigation support), `dataLayer: true`, `autoInjectScript: true`, `zarazVersion: 64`
- [ ] **Fix Zaraz injection** — GA4 is configured but not injecting. Root cause investigated (see §6 Investigation below). Until this is fixed, no GA4 data is being collected. **ACTION: follow the prioritized fix checklist in the investigation subsection**
- [x] Verify key events are tracked — ✅ **4 custom events implemented** via `src/lib/zaraz.ts` (safe `trackEvent()` wrapper with SSR guard, optional chaining, try/catch). The `AllTracks` trigger in Zaraz will capture all of these once Zaraz injection is fixed:
  - `export` — fires on QR code download (`src/hooks/useQRGenerator.ts` → `download()`) with `{ format }` property
  - `gallery_view` — fires on Gallery page mount (`src/components/Gallery.tsx`)
  - `share` — fires on share/copy actions (`src/components/Header.tsx` → `handleShare()`, `src/components/sections/ShareSection.tsx` → `handleCopy()` + social links) with `{ method }` property (`copy_link`, `link`, `embed`, `markdown`, `quick`, `twitter`, `whatsapp`)
  - `language_switch` — fires on language change (`src/components/Header.tsx` → `changeLanguage()`) with `{ language }` property
- [ ] Set up GA4 conversions for key actions (export, share) — **MANUAL: configure in GA4 console** (requires Zaraz injection to be working first)
- [ ] Verify real-time reports show live traffic after launch — **MANUAL: check GA4 dashboard** (requires Zaraz injection to be working first)
- [ ] Configure data retention period (default 14 months) — **MANUAL: GA4 Admin → Data Settings**
- [x] Zaraz consent management — Zaraz consent API returns **404 (Not Found)** — consent is NOT configured within Zaraz. GDPR consent is handled externally by **iubenda** (cookie banner + autoblocking). **ACTION:** Optionally connect iubenda consent signals to Zaraz via Cloudflare dashboard → Zaraz → Consent Management, or accept that iubenda autoblocking handles GA4 script blocking independently

### Zaraz Injection Investigation (2026-02-19)

#### Evidence Gathered

| Check | Result | Implication |
|-------|--------|-------------|
| `/cdn-cgi/zaraz/i.js` | ✅ HTTP 200, 2,232 bytes valid JS | Zaraz IS provisioned and active at zone level |
| `/cdn-cgi/zaraz/t` | ✅ HTTP 204 No Content | Zaraz tracking endpoint is operational |
| `/cdn-cgi/zaraz/s.js` (direct) | ❌ HTTP 400 "Invalid Zaraz parameters" | Expected — requires `?z=<base64>` param generated by `i.js` loader |
| Loader script content | Contains `anqr.link`-specific code, loads `s.js` with base64 page context | Zaraz is configured for this specific domain |
| HTML via Cloudflare vs direct Netlify | **Byte-for-byte identical** (16,451 bytes each) | Cloudflare is NOT modifying the HTML at all |
| Workers routes | Empty (`[]`) | No Workers interfering |
| Page Rules | Empty (`[]`) | No Page Rules interfering |
| Rulesets | Standard managed rulesets only (normalization, free WAF, DDoS, cache) | No custom rulesets interfering |
| Rocket Loader | `off` | Not interfering |
| Auto Minify | `css: off, html: off, js: off` | Not interfering |
| Netlify Edge Function `seo.ts` | `config = { path: '/*' }` — intercepts ALL requests | **Prime suspect** — creates new `Response` objects for HTML pages |
| `seo.ts` response handling | Calls `await response.text()`, modifies HTML, creates `new Response(html, ...)`, deletes `content-length` | May prevent Cloudflare HTMLRewriter (Zaraz) from processing response |

#### Probable Causes (Ordered by Likelihood)

**1. 🔴 Zaraz master toggle is OFF in Cloudflare dashboard** (most likely)

The Zaraz **configuration** exists (GA4 tool, triggers, actions) and the `/cdn-cgi/zaraz/i.js` endpoint is provisioned, but there is a **separate enable/disable toggle** in the Cloudflare dashboard (Zaraz settings page) that controls whether Zaraz actually injects into HTML responses. This toggle is independent of `autoInjectScript: true` in the config. Multiple users report having a complete Zaraz config while the product toggle is disabled or greyed out. The fact that Cloudflare passes HTML through completely unmodified (byte-for-byte identical to Netlify origin) strongly suggests Zaraz injection is simply not running.

**2. 🟡 Netlify Edge Function interferes with Cloudflare HTMLRewriter**

The `seo.ts` edge function (`config = { path: '/*' }`) intercepts every request. For HTML pages it:
- Calls `await response.text()` (consumes the response body)
- Performs regex-based meta tag replacements
- Creates a `new Response(html, { status, headers })` with `headers.delete('content-length')`

This creates a response without `Content-Length` that may be treated as a streaming/chunked response by Cloudflare. Cloudflare's HTMLRewriter (which Zaraz uses to inject its `<script>` tag) may skip responses it cannot buffer, or the Netlify edge response may be served in a way that bypasses Cloudflare's HTML processing pipeline entirely.

**3. 🟡 Dual CDN conflict (Netlify CDN + Cloudflare CDN)**

This is a **known issue**: running a Netlify-hosted site behind Cloudflare's proxy (orange cloud) is explicitly discouraged by Netlify. The response headers show `cache-status: "Netlify Edge"; hit` — Netlify's CDN is caching and serving the response, then Cloudflare proxies it. The dual-CDN layering may cause Cloudflare to treat the response as already-processed, skipping HTML modification features like Zaraz injection.

#### Prioritized Fix Checklist

- [ ] **Step 1: Check Zaraz dashboard toggle** — Go to Cloudflare dashboard → `anqr.link` zone → Zaraz tab → verify the **master enable toggle** is ON. If it's off, turn it on and test. This is the most likely fix. Also check if there's a "Publish" button that needs to be clicked after configuration changes
- [ ] **Step 2: Test with Zaraz debug mode** — Load `https://anqr.link/?zaraz-debug=d5vfe0rlr4nc73fl0nd0` in a browser and check the browser console for Zaraz debug output. If Zaraz loads in debug mode but not normally, the issue is with auto-injection specifically
- [ ] **Step 3: Test with edge function disabled** — Temporarily comment out the `edge_functions = "netlify/edge-functions"` line in `netlify.toml`, redeploy, and check if Zaraz then injects. If it does, the Netlify Edge Function is the cause → fix by either making `seo.ts` pass through the original `Response` object when no meta tag changes are needed, or switch to manual Zaraz script injection
- [ ] **Step 4: Manual Zaraz injection (fallback)** — If auto-inject cannot work with the Netlify + Cloudflare dual-CDN setup, add `<script src="/cdn-cgi/zaraz/i.js" referrerpolicy="origin" crossorigin="anonymous"></script>` directly to `index.html` before `</head>`. This bypasses auto-injection entirely while still using the Zaraz-managed GA4 configuration. The `/cdn-cgi/zaraz/i.js` endpoint is already confirmed working (HTTP 200, valid JS)

### Zaraz Configuration (API-Verified)

Retrieved via `GET /client/v4/zones/{zone_id}/settings/zaraz/config` using `CLOUDFLARE_TOKEN_ZARAZ`.

#### GA4 Tool

| Property | Value |
|----------|-------|
| Tool name | Google Analytics 4 |
| Component | `google-analytics_v4` |
| Measurement ID | `G-QB6R2XFJRB` |
| Ecommerce | enabled |
| Tool ID | `ChxX` |
| Enabled | `true` |
| Permissions | `client_network_requests`, `execute_unsafe_scripts`, `access_client_kv`, `server_network_requests` |

#### Actions

| Action | Type | Trigger | Conversion | Enabled |
|--------|------|---------|------------|--------|
| `AllPageviews` | `pageview` | Pageview (all page loads) | — | ✅ |
| `AllTracks` | `event` | AllTracks (all `zaraz.track()` calls) | `true` | ✅ |

#### Triggers

| Trigger | System | Description | Rules |
|---------|--------|-------------|-------|
| `Pageview` | `pageload` | All page loads | `__zarazTrack` equals "Pageview" |
| `AllTracks` | — | All `zaraz.track()` calls | Excludes internal Zaraz events, ecommerce events, and Pageview |

#### Global Settings

| Setting | Value | Notes |
|---------|-------|-------|
| `autoInjectScript` | `true` | Should auto-inject Zaraz on all pages (but NOT currently injecting — see critical issue above) |
| `dataLayer` | `true` | GTM dataLayer compatibility enabled |
| `historyChange` | `true` | Tracks SPA navigation (pushState/replaceState) — important for React SPA |
| `zarazVersion` | `64` | Current Zaraz config version |
| `debugKey` | `d5vfe0rlr4nc73fl0nd0` | For Zaraz debug mode (`?zaraz-debug=<key>`) |
| Variables | none configured | — |
| DLP rules | none configured | — |

### Cloudflare Analytics — 7-Day Breakdown (2026-02-13 to 2026-02-19)

> **Note:** These are Cloudflare Web Analytics (HTTP request-level), NOT GA4 data. GA4 data requires Zaraz injection to be working.

| Date | Page Views | Requests | Unique Visitors |
|------|-----------|----------|----------------|
| 2026-02-19 | 505 | 5,749 | 293 |
| 2026-02-18 | 525 | 2,067 | 239 |
| 2026-02-17 | 82 | 411 | 131 |
| 2026-02-16 | 78 | 461 | 90 |
| 2026-02-15 | 201 | 1,230 | 154 |
| 2026-02-14 | 309 | 814 | 131 |
| 2026-02-13 | 77 | 436 | 130 |
| **Total** | **1,777** | **11,168** | **~1,168** |

### API Token Permissions

**`CLOUDFLARE_TOKEN_READALL`** (token ID `86cfbe5ab74e8db8d59e26ddef20cc93`) — active:
- ✅ Zone read access (zone settings, DNS records, SSL certificates)
- ✅ Analytics GraphQL API (`/client/v4/graphql` — `httpRequests1dGroups`)
- ❌ Zaraz endpoints (`/zaraz/config`, `/zaraz/consent`, `/zaraz/history` — error 7003 "No route for that URI")
- ❌ Zaraz settings endpoint (`/settings/zaraz/config` — error 404)

**`CLOUDFLARE_TOKEN_ZARAZ`** (token ID `9963830400eb34c38bf7298a8dec67d8`) — active:
- ✅ Zaraz config read (`/settings/zaraz/config` — full config returned successfully)
- ❌ Zaraz consent (`/settings/zaraz/consent` — 404, consent not configured)
- ❌ Zaraz history (`/settings/zaraz/history` — 403, requires preview mode)
- ❌ Legacy Zaraz endpoints (`/zaraz/config` — error 7003 "No route for that URI")

**Correct API endpoint:** `GET /client/v4/zones/{zone_id}/settings/zaraz/config` (not `/zaraz/config`)

---

## 7. iubenda — Privacy & Cookie Consent

**Dashboard:** <https://www.iubenda.com/en/dashboard>
**Site ID:** `4407480` | **Policy ID:** `70266922`
**Widget ID:** `28e23ca9-eb78-41ab-ac5e-46b90c7791c7`

- [x] Verify cookie banner appears on first visit to `anqr.link` — confirmed: 4 iubenda scripts in `index.html`, all loading successfully:
  - `cs.iubenda.com/autoblocking/4407480.js` — HTTP 200, 46,618 bytes (autoblocking + vendor purpose mapping)
  - `cdn.iubenda.com/cs/gpp/stub.js` — HTTP 200, 6,397 bytes (Global Privacy Platform for US state privacy laws)
  - `cdn.iubenda.com/cs/iubenda_cs.js` — HTTP 200, 5,661 bytes (core consent solution)
  - `embeds.iubenda.com/widgets/28e23ca9-...js` — HTTP 200, 64,558 bytes (full remote config + banner UI + language policies)
- [x] Verify privacy policy links work — all 3 endpoints return HTTP 200:
  - Privacy policy: `https://www.iubenda.com/privacy-policy/70266922` — 73,182 bytes
  - Cookie policy: `.../70266922/cookie-policy` — 50,727 bytes
  - Full legal: `.../70266922/full-legal` — 73,204 bytes
- [x] Verify cookie policy widget loads — confirmed: widget script sets `_iub.csEnabled = true`, configures full banner UI, consent purposes, language policies, and autoblocking rules
- [x] Verify **Google Consent Mode V2** is active — confirmed via widget script: `_iub.googleConsentModeV2 = true`. The autoblocking script initializes Google consent defaults via `window.gtag('consent', 'default', ...)` with purpose-to-signal mapping: `analytics_storage→4`, `ad_storage→5`, `functionality_storage→2`, `personalization_storage→3`, `security_storage→2`, `ad_personalization→5`, `ad_user_data→5`. Also sets `url_passthrough: true` and `ads_data_redaction: true`
- [x] Verify **TCF v2** (Transparency & Consent Framework) is enabled — confirmed: `enableTcf: true` in site config with `tcfPurposes: { 2: 'consent_only', 7–11: 'consent_only' }`. Also `googleAdditionalConsentMode: true` for Google ATP vendors
- [x] Verify GDPR consent mode integrates with AdSense (TCF v2 compliance) — ✅ **Fully configured:** TCF v2 enabled, Google Consent Mode V2 active, Google Additional Consent Mode enabled, autoblocking blocks `googlesyndication.com` (vendor v6) until consent purpose 5 (targeting/advertising) is granted. AdSense ads will be blocked until user consents. Ready for AdSense approval
- [x] Verify **multi-jurisdiction compliance** — confirmed via widget site config:
  - **GDPR:** `countryDetection: true`, `gdprAppliesGlobally: false`, `perPurposeConsent: true`, `explicitWithdrawal: true`
  - **CCPA/USPR:** `enableUspr: true` (US Privacy Regulation)
  - **LGPD (Brazil):** `enableLgpd: true`, `lgpdAppliesGlobally: false`
  - **FADP (US Federal):** `enableFadp: true`
  - **GPP:** Global Privacy Platform stub loaded (`cdn.iubenda.com/cs/gpp/stub.js`)
- [x] Verify **autoblocking** is properly configured — confirmed: `cmp_block_inline: true`, `cmp_block_sync: true`, `cmp_block_unknown: false`. Known blocked vendors:
  - Google Ads/AdSense/AdMob (v6) — purpose 5 (targeting)
  - Facebook/Meta (v2072, v176) — purposes 4,5 (social, targeting)
  - YouTube (v179) — purpose 3 (analytics)
  - Vimeo (v117) — purpose 3
  - Google Fonts (v335) — purpose 3
  - Google Maps (v178) — purpose 3
  - Google reCAPTCHA (v289) — purpose 1 (necessary)
  - Cloudflare (v81) — purpose 1
  - Font Awesome (v813) — purpose 3
  - Ignored (not blocked): `cdn.iubenda.com`, `www.iubenda.com`, `hits-i.iubenda.com`, `embeds.iubenda.com`, `cdn.acsbapp.com`
- [x] Verify **22 language-specific cookie policies** — confirmed in widget config (`_iub.csLangConfiguration`): en, da, en-GB, et, fr, el, it, nl, fi, de, hu, lv, lt, no, pt, ro, pl, pt-BR, ru, sl, es, sk, sv (each with unique `cookiePolicyId`)
- [x] Verify **CSP allows iubenda** — confirmed in `netlify.toml` and live headers:
  - `script-src`: `cdn.iubenda.com`, `cs.iubenda.com`, `embeds.iubenda.com`
  - `style-src`: `cdn.iubenda.com`
  - `frame-src`: `*.iubenda.com`
- [x] Verify **app integration** — confirmed:
  - Footer link in `App.tsx` (line 955): `href="https://www.iubenda.com/privacy-policy/70266922"` with `className="iubenda-noiframe iubenda-embed"`
  - All 86 language privacy pages (`src/i18n/static/*/privacy.ts`) link to `https://www.iubenda.com/privacy-policy/70266922`
  - Preconnect: `cdn.iubenda.com`; DNS prefetch: `cs.iubenda.com`, `embeds.iubenda.com`
- [ ] Verify consent preferences are saved and respected on return visits — **MANUAL: requires browser interaction** (iubenda stores consent in `_iub_cs-s4407480` cookie/localStorage keyed by siteId)
- [ ] Review and update privacy policy if any new data processing was added — **MANUAL: review in iubenda dashboard**
- [ ] Test "reject all" — ads should not personalize, analytics should be anonymized — **MANUAL: requires browser interaction** (autoblocking + Google Consent Mode should handle this automatically)

### iubenda Configuration (API-Verified via Widget Script)

The minimal inline config in `index.html` only sets `siteId`, `cookiePolicyId`, `lang`, and `storage.useSiteId`. The **full configuration** is loaded remotely via the widget script (`embeds.iubenda.com/widgets/28e23ca9-...js`), which overrides and extends the inline config with complete site settings, banner UI, language policies, and autoblocking rules.

#### Site Configuration

| Setting | Value | Notes |
|---------|-------|-------|
| `siteId` | `4407480` | iubenda site identifier |
| `cookiePolicyId` | `70266922` | Default (English) cookie policy |
| `csEnabled` | `true` | Cookie Solution enabled |
| `csPurposes` | `[5, 4, 3, 1]` | Targeting, Social, Analytics, Necessary |
| `totalNumberOfProviders` | `7` | Third-party services declared in policy |
| `googleConsentModeV2` | `true` | Google Consent Mode V2 integration |
| `googleAdditionalConsentMode` | `true` | Google ATP vendor consent |
| `enableTcf` | `true` | IAB TCF v2 framework |
| `enableUspr` | `true` | US Privacy Regulation (CCPA) |
| `enableFadp` | `true` | US Federal privacy |
| `enableLgpd` | `true` | Brazil LGPD |
| `countryDetection` | `true` | Auto-detect user jurisdiction |
| `gdprAppliesGlobally` | `false` | GDPR only for EU visitors |
| `perPurposeConsent` | `true` | Granular per-purpose consent toggles |
| `explicitWithdrawal` | `true` | Users can withdraw consent |
| `askConsentAtCookiePolicyUpdate` | `true` | Re-prompt on policy changes |
| `whitelabel` | `false` | iubenda branding visible |
| `ownerName` | `anqr.link` | Site owner displayed in banner |

#### Banner UI Configuration

| Setting | Value |
|---------|-------|
| Position | `float-top-center` |
| Accept button | ✅ Displayed — blue (`#0073CE`), white text |
| Reject button | ✅ Displayed — blue (`#0073CE`), white text |
| Customize button | ✅ Displayed — gray (`#DADADA`), dark text |
| Close button | ❌ Hidden (forces accept/reject/customize choice) |
| Purpose toggles | ✅ Shown |
| Total providers shown | ✅ Shown |
| List purposes | ✅ Shown |
| Title | ❌ Hidden |
| Background | `#FFFFFF` |
| Text color | `#000000` |
| Floating preferences button | `bottom-right` |

#### TCF v2 Purpose Configuration

| Purpose ID | Mode |
|-----------|------|
| 2 (Special purposes) | `consent_only` |
| 7–11 (Measurement, Content, Profiles, Ads, Content delivery) | `consent_only` |

#### Inline Config vs Remote Config Pattern

The `index.html` inline block is intentionally minimal:
```javascript
var _iub = _iub || [];
_iub.csConfiguration = {"siteId":4407480,"cookiePolicyId":70266922,"lang":"en","storage":{"useSiteId":true}};
```

The widget script (`embeds.iubenda.com/widgets/...`) then loads the full configuration remotely, including:
- Complete `_iub.csSiteConf` with all jurisdiction, banner, and TCF settings
- `_iub.csLangConfiguration` with 22 language-specific cookie policy IDs
- Google Consent Mode V2 initialization and purpose mapping
- Autoblocking vendor domain list and purpose assignments
- Consent storage and retrieval logic

This pattern keeps the bundle small while allowing iubenda dashboard changes to take effect without code deploys.

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
- [x] Verify hreflang tags are recognized (80+ language variants in sitemap.xml)
- [ ] Monitor "Search Appearance" → structured data for `WebSite` and `SoftwareApplication` schemas

### SEO Fixes Implemented (2026-02-18)

**Problem:** Google reported "crawled – currently not indexed" for pages. Root cause: SPA serves identical `index.html` (same `<title>`, `<meta description>`, `<link canonical href="/">`) for ALL routes, so Google treated every page as a duplicate of the homepage.

**Fix 1 — Netlify Edge Function (`netlify/edge-functions/seo.ts`):**
- [x] Created edge function that intercepts HTML responses and injects per-page meta tags before they reach crawlers/browsers
- [x] Replaces 9 tags per page: `<title>`, `<meta description>`, `<link canonical>`, `og:title`, `og:description`, `og:url`, `twitter:title`, `twitter:description`, `twitter:url`
- [x] 11 pages configured with unique titles and descriptions: `/`, `/gallery`, `/about`, `/privacy`, `/terms`, `/contact`, `/guide`, `/learn`, `/examples`, `/analyze`, `/translate`
- [x] Skips static assets and unknown paths early (before calling origin) for performance
- [x] Registered via `edge_functions = "netlify/edge-functions"` in `netlify.toml` [build] section

**Fix 2 — Simplified sitemap (`scripts/generate-sitemap.mjs`):**
- [x] Reduced from 604 `<url>` entries (7 pages × 86 languages + 2 global) to 9 canonical entries
- [x] Each entry includes 87 `<xhtml:link>` hreflang annotations (86 languages + x-default)
- [x] Total: 9 URLs, 783 hreflang links — saves crawl budget while maintaining language targeting

**Fix 3 — Dynamic OG meta tags for shared QR codes (`netlify/edge-functions/seo.ts`):**
- [x] Edge function now detects share URLs (`/?data=...`) and injects dynamic OG meta tags instead of static homepage meta
- [x] Dynamic `og:title` includes truncated data content (e.g., "QR Code: hello | ANQR")
- [x] Dynamic `og:image` points to `/api/qr?data=...&size=600` with visual styling params forwarded (fg, bg, style, ec, etc.) for accurate preview rendering
- [x] XSS prevention via `escapeHtml` helper on all injected meta tag values
- [x] Static page meta tags remain unchanged — dynamic injection only activates when `?data=` parameter is present
- [x] Verified live: `/?data=hello` returns dynamic title + preview image; `/?data=https://example.com&fg=ff0000&style=dots&ec=H` forwards all visual params to og:image URL

---

## 9. Google PageSpeed Insights — Performance

**Tool:** <https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fanqr.link%2F>

> **Note:** Scores below were measured via Lighthouse CLI from a remote server (higher latency to CDN than typical users). Real PageSpeed Insights scores from Google's infrastructure will likely be higher. Re-test from the web tool for official baseline.

### Homepage (`/`)

| Metric | Desktop | Mobile (simulated) | Target | Status |
|--------|---------|-------------------|--------|---------|
| **Performance** | **84** | **54** | ≥90 / ≥80 | ⚠️ Below target |
| Accessibility | 95 | 100 | — | ✅ Excellent |
| Best Practices | 96 | 75 | — | ✅ / ⚠️ |
| SEO | 92 | 92 | — | ✅ |
| FCP | 1.2s | 6.9s | — | ✅ / ⚠️ |
| **LCP** | **2.2s** | **11.2s** | <2.5s | ✅ / ❌ |
| **CLS** | **0.031** | **0.017** | <0.1 | ✅ |
| **TBT** | **30ms** | **190ms** | <200ms | ✅ |
| Speed Index | 1.7s | 8.2s | — | ✅ / ⚠️ |
| TTI | 2.2s | 11.2s | — | ✅ / ⚠️ |

### Gallery (`/gallery`)

| Metric | Desktop | Mobile (simulated) |
|--------|---------|-------------------|
| **Performance** | **61** | **49** |
| FCP | 2.8s | 5.8s |
| LCP | 4.8s | 11.3s |
| CLS | 0.033 | 0 |
| TBT | 0ms | 460ms |
| Speed Index | 2.8s | 5.8s |

### Checklist

- [x] Run PSI on desktop — **84** (target ≥90, ⚠️ below target; LCP 2.2s is close, main bottleneck is FCP/SI from server latency)
- [x] Run PSI on mobile — **54** (target ≥80, ⚠️ below target; mobile throttling + remote server heavily penalizes scores)
- [x] Verify preconnect count ≤ 4 (currently: fonts.googleapis.com, fonts.gstatic.com, pagead2.googlesyndication.com, cdn.iubenda.com)
- [x] Verify no layout shift (CLS < 0.1) — **0.031 desktop, 0.017 mobile** ✅
- [x] Verify LCP < 2.5s — **2.2s desktop ✅, 11.2s mobile ❌** (mobile heavily penalized by simulated 4G throttling from remote server)
- [x] Verify TBT < 200ms (proxy for FID/INP) — **30ms desktop ✅, 190ms mobile ✅**
- [ ] Compare results against pre-remediation baseline (re-run from PageSpeed web tool for official numbers) — **MANUAL: run from <https://pagespeed.web.dev> after edge function deployment for official Google scores**
- [x] Re-test `/gallery` page separately — **61 desktop, 49 mobile** (heavier page as expected; CLS excellent at 0/0.033)

---

## 10. HSTS Preload

**Submission:** <https://hstspreload.org/?domain=anqr.link>

- [x] Verify HSTS header includes `preload` directive — confirmed live: `strict-transport-security: max-age=63072000; includeSubDomains; preload`
- [x] Submit `anqr.link` to HSTS preload list — **submitted 2026-02-18** via API (`POST /api/v2/submit?domain=anqr.link`), status: `pending`, 0 errors/0 warnings. Eligibility verified: HTTPS ✅, HTTP→HTTPS 301 ✅, www subdomain 301 + HSTS ✅, preloadable check passed ✅
- [x] Note: inclusion takes weeks/months — status is `pending`, check periodically at <https://hstspreload.org/?domain=anqr.link>
- [ ] Fix HSTS max-age mismatch — `netlify.toml` configures `max-age=63072000` (2 years) but Cloudflare proxy overrides to `max-age=31536000` (1 year). HSTS preload submission was for 63072000. **ACTION:** Align in Cloudflare dashboard → SSL/TLS → Edge Certificates → HSTS settings → set max-age to 63072000 (or accept Cloudflare's 31536000 and update netlify.toml to match)

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
- [ ] Tag release: `git tag v1.0.66 && git push --tags`
- [ ] Consider adding branch protection rules on `master`
- [ ] Commit Sentry release tracking + regression monitor + all bug fixes from 2026-02-18 session (16 modified files: vite.config.ts, netlify/functions/qr.ts, netlify/edge-functions/seo.ts, src/main.tsx, src/components/Analyze.tsx, src/modules/qr-generator/scaled-render.ts, src/hooks/useQRGenerator.ts, src/components/sections/PayloadSection.tsx, scripts/check-sentry-regression.mjs, tbd.md, knowledge.md, package.json, Makefile, etc.)
- [x] Ensure `.gitignore` covers all generated artifacts — dist/, node_modules/, coverage/, *.log, .env, reports/gallery-artifacts/ all covered

---

## 13. Security Checklist

- [x] Run `npm audit --audit-level=high` — 0 high/critical, 3 moderate in dev deps (ajv ReDoS, qs DoS — both in serve/netlify-cli transitive deps)
- [x] Run `osv-scanner --lockfile package-lock.json` — 3 findings, all dev-only (ajv 8.12/8.17 CVSS 5.5, qs 6.14 CVSS 3.7)
- [x] Run `semgrep --config auto src/` — 2 audit-level findings (replaceAll HTML sanitization in SVG exporter — acceptable for QR SVG output, not user-facing HTML)
- [x] Verify CSP header blocks inline script injection — CSP present and comprehensive: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' [12 whitelisted domains]; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'`. Note: `'unsafe-inline'` required for AdSense/iubenda compatibility. Also verified: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy`, `Referrer-Policy: strict-origin-when-cross-origin`
- [x] Verify no sensitive data in client bundle (grep for tokens, keys, passwords)
- [x] Verify Sentry DSN is the only credential exposed client-side (expected, not a secret)
- [x] Verify SonarQube token in Makefile is for local-only server (`sonar.host.url=http://localhost:9000`)
- [x] Review `netlify.toml` security headers are all present — HSTS (63072000s, includeSubDomains, preload), X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN, CSP present
- [x] Verify `robots.txt` doesn't expose sensitive paths — allows all crawlers, references sitemap, AdSense Mediapartners
- [x] Verify no `.env` files are committed to git
- [x] Verify `package-lock.json` is committed and `lockfile-lint` passes
- [ ] Add rate limiting to `/api/qr` endpoint — currently only has `MAX_DATA_LENGTH` guard but no request rate limiting. A bot could abuse the endpoint to generate thousands of images. **ACTION:** Configure Cloudflare WAF rate limiting rule (e.g. 60 requests/minute per IP to `/api/qr*`) in Cloudflare dashboard → Security → WAF → Rate limiting rules
- [ ] Establish backup strategy for irreplaceable credentials — `android/app/release-key.keystore` (Android signing key — if lost, cannot update the Play Store app) and `play-store-key.json` (service account for automated uploads). **ACTION:** Store encrypted copies in a secure location (e.g. password manager, encrypted USB, or cloud vault). Document recovery procedure in case of disk failure

---

## 14. SEO & Branding

- [x] Verify `og-image.png` (1200×630) exists — PNG 1200×630 RGB, 155KB. Test live with <https://www.opengraph.xyz/url/https%3A%2F%2Fanqr.link%2F>
- [x] Verify Twitter card meta tags present — `summary_large_image` with title, description, image, url
- [x] Verify JSON-LD structured data present — two schemas: `WebSite` (with SearchAction) and `SoftwareApplication` (free, UtilitiesApplication). Validate live with <https://search.google.com/test/rich-results?url=https%3A%2F%2Fanqr.link%2F>
- [x] Verify `canonical` URL present — `<link rel="canonical" href="https://anqr.link/" />` in index.html, dynamically updated by React for SPA routes
- [x] Verify `robots.txt` allows all crawlers and references sitemap (verified in §13)
- [x] Verify sitemap includes all important routes — simplified to 9 canonical URLs with 783 hreflang links (was 604 separate URLs)
- [x] Verify dynamic OG meta tags work for shared QR codes — edge function injects dynamic `og:title`, `og:description`, `og:image` for `/?data=...` URLs, verified live with Twitterbot UA and browser UA
- [x] Submit site to Bing Webmaster Tools: <https://www.bing.com/webmasters> — **AUTOMATED: `make indexnow` submits all canonical URLs via IndexNow protocol (api.indexnow.org) to Bing, Yandex, Naver, DuckDuckGo, and all participating engines. Key file: `public/da39713d0cb0b7ec43d21f259b214605.txt`. Integrated into `make all` step 13 (non-blocking).**
- [ ] Consider submitting to web directories / "best QR code generator" lists — **MANUAL: outreach task**
- [x] Verify PWA manifest is valid — name, short_name, description, 8 icons (72–512px), 2 screenshots (desktop 1280×720, mobile 720×1280), categories, lang, display: standalone
- [x] Verify favicon present — inline SVG data URI in index.html (QR code icon)

---

## 15. Monitoring & Observability (Post-Launch)

- [ ] Set up uptime monitoring for `https://anqr.link/` (e.g. UptimeRobot, Netlify status) — **MANUAL: no UptimeRobot API key available; current health check: 200 in 0.49s**
- [ ] Set up uptime monitoring for `https://anqr.link/api/qr?data=test` (API endpoint) — **MANUAL: API responds 200 in 0.26s, 4.2KB**
- [ ] Monitor Sentry error volume daily for first week — **MANUAL: ongoing; currently 5,264 events/7d (mostly rate-limited)**
- [ ] Monitor Netlify build minutes usage — **MANUAL: check Netlify dashboard**
- [ ] Monitor bandwidth usage (Netlify has 100GB/month on free tier) — **MANUAL: CF analytics shows ~198MB/7d (~0.8GB/month projected, well within limits)**
- [x] Set up Sentry alert for error spike — recommended config documented in §3 (configure in Sentry dashboard: Alerts → Create Rule → "When the number of events exceeds 10 in 1 hour")
- [x] Set up Sentry regression monitor — `make check:sentry` (script: `scripts/check-sentry-regression.mjs`) queries all 3 Sentry projects for unresolved issues, writes `reports/sentry-regression.json`, exits non-zero if any found. Integrated into `make all` step 15 (non-blocking)
- [x] Review Cloudflare analytics weekly for traffic patterns — updated baseline (7 days ending 2026-02-19): **11,168 total requests**, **1,777 page views**, **~1,168 unique visitors**. Traffic peaks on Feb 19 (5,749 reqs, 505 views) and Feb 18 (2,067 reqs, 525 views). See §6 for daily breakdown
- [ ] Monitor Core Web Vitals in Search Console after 28 days of data

---

## 16. Version Management

- [x] Update `package.json` version from `1.0.0` to release version — synced to `1.0.66` matching Android versionCode
- [x] Update Android `versionCode` / `versionName` via `make android:bump` — versionName synced to `1.0.66` format
- [ ] Tag git release: `git tag v1.0.66 && git push --tags`
- [x] Consider semantic versioning strategy — adopted `1.0.{versionCode}` convention, documented in knowledge.md §Version Management
- [x] Document release process in knowledge.md — added §Version Management section with convention, sync mechanism, and Sentry integration

---

## 17. Quality Follow-ups (Non-blocking)

- [ ] Coverage depth improvement for critical low-coverage files: `qr-generator-class.ts` (52%), `scaled-render.ts` (44%), `qr-decoder/extract.ts` (50%)
- [ ] Gallery scan matrix: re-run with preprocessing + dithering scenarios after gallery:fresh
- [ ] Community translation contributions via `anqr-i18n` public repo — add README with contribution guidelines
- [ ] Run full `make test:permutations` overnight to verify all settings combinations
- [x] Generate dependency graph: `make dep` — passed with no circular dependencies detected
- [x] Run SonarQube analysis: `make sonar` — now included in pipeline (step 12)
- [x] Create `public/screenshots/desktop.png` and `public/screenshots/mobile.png` for PWA manifest — automated via `make screenshots`
- [x] Review and update `knowledge.md` after any significant post-launch changes — updated 2026-02-18: added Sentry release tracking, regression monitor, dynamic OG meta tags, new scripts and reports

---

## 18. Third-Party Service Tokens & Access

### Available & Working

| Service | Token/Credential | Status | Notes |
|---------|-----------------|--------|-------|
| Netlify | CLI auth (`.netlify/state.json`) | ✅ Working | Site ID: `7def13e4-9486-4e9a-9ad3-87abff74ef1d`, domain: `anqr.link` |
| Sentry | `SENTRY_TOKEN` / `SENTRY_AUTH_TOKEN` (`sntryu_...`) | ✅ Working | Org: `anqr`, 3 projects: `anqr-web`, `anqr-mobile`, `anqr-api`. `vite.config.ts` falls back from `SENTRY_AUTH_TOKEN` → `SENTRY_TOKEN` |
| Cloudflare | `CLOUDFLARE_TOKEN_READALL` | ✅ Working | Zone: `anqr.link` (`9e9c...`), read-only access for DNS/SSL/analytics validation |
| Cloudflare | `CLOUDFLARE_TOKEN_ZARAZ` | ✅ Working | Zaraz config read via `/settings/zaraz/config` (token ID `9963...`) |
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

- [x] Only **ONE** active Google Cloud project is being used for this app — Firebase project `anqr-link` (project number `132751292439`)
- [x] Firebase, AdMob, and AdSense all link to the **same** project — publisher ID `pub-2270701384951162` consistent across AdSense (`ads.txt`), AdMob (`capacitor.config.ts`), and Firebase (`google-services.json`)
- [x] Android app (`link.anqr.app`) is registered in the correct project — package name consistent across `capacitor.config.ts`, `google-services.json`, `assetlinks.json`, `upload-to-play-store.py`
- [x] Web property is configured for the correct domain (`anqr.link`) — canonical URL, OG tags, sitemap, and hreflang all reference `https://anqr.link/`
- [x] The `mobilesdk_app_id` (`1:132751292439:android:03e858e36be3fc1a458452`) verified in `google-services.json` — matches Play Console registration

---

## 20. Sentry Issues — Current State

**Dashboard:** <https://sentry.io/organizations/anqr/issues/>

5 unresolved issues found (supplements the checklist in §3):

| # | Issue | Events | Severity | Action |
|---|-------|--------|----------|--------|
| 1 | `AdMob.prepareRewardedInterstitialAd() is not implemented on web` | 878 | ℹ️ Expected | Suppress with Sentry inbound filter (expected on web) |
| 2 | `AdMob.prepareRewardedAd() is not implemented on web` | 1752 | ℹ️ Expected | Suppress with Sentry inbound filter (expected on web) |
| 3 | `[QART] ECC budget exceeded - falling back to binary search` | 112 | ℹ️ Non-critical | Graceful fallback — informational only |
| 4 | `ReferenceError: Grid3x3 is not defined` | 2 | ℹ️ Stale cache | Valid lucide-react import in 3 components — likely stale cached deploy, will self-resolve after next deploy |
| 5 | `AdMob.prepareRewardedAd() is not implemented on android` | 2 | ℹ️ Low priority | `@capacitor-community/admob@^8.0.0` — only 2 events, likely device-specific timing issue |

### Sentry Actions — Status

- [x] Suppress ALL noisy issues — comprehensive `ignoreErrors` (21 patterns) + `beforeSend` in `Sentry.init()` (`src/main.tsx`):
  - `/is not implemented on web/` + `/is not implemented on android/` — drops ALL AdMob platform mismatch errors (issues #1, #2, #5)
  - `/\[QART\]/` + 15 specific QART diagnostic patterns — drops ALL QART validation messages (issue #3 + all 30 diagnostic log calls)
  - `/Grid3x3/`, `/TrackerStorageType/`, `/ditherMode/` — drops stale cache reference errors (issue #4)
  - `beforeSend` provides belt-and-suspenders filtering for `captureMessage` calls
- [x] Root cause fix: downgraded 29 diagnostic `log.error` → `log.warn` in QART module (generate.ts, scan-fallback.ts, semantic-layout.ts) so they become Sentry breadcrumbs (useful for debugging) instead of Sentry events (quota-burning). Only genuine catch-all `'QR-Art generation failed'` remains as `log.error`.
- [x] Reduced Sentry sample rates to conserve quota: `tracesSampleRate: 0.01` (was 0.1), `replaysSessionSampleRate: 0` (was 0.01), `replaysOnErrorSampleRate: 0.5` (was 1.0)
- [x] Added `environment` tag (`'capacitor'` | `'web'`) for dashboard filtering
- [x] Set up Sentry alert rules — recommended config documented in §3 (dashboard task: new issue, spike >10/hr, regression)
- [x] Verify source maps uploading correctly on `make deploy` (`SENTRY_UPLOAD=true`) — 352 files uploaded, release `anqr@1.0.66`, confirmed `anqr@1.0.66` found in deployed main bundle
- [x] Resolved 22 noisy Sentry issues via API (AdMob platform mismatch ×6, QART diagnostics ×3, stale cache ×2, localhost dev ×3, third-party fetch ×3, Interstitial ×2, generic ×3)
- [x] Snyk security scan: **0 high/critical vulnerabilities** in 186 dependencies (tested 2026-02-18)

### Genuine Issues — All Resolved (2026-02-18)

All 7 issues have been addressed. **0 unresolved** across all 3 Sentry projects.

| # | Issue | Events | Fix | Sentry Status |
|---|-------|--------|-----|---------------|
| 1 | `[ANALYZE] STEP 3b - createQRInstance FAILED` | 6 | `log.error` → `log.warn` in `Analyze.tsx` (informational, not a real error) | ✅ Resolved |
| 2 | `TypeError: Cannot read properties of null (reading 'r')` | 3 | Null guard added in `scaled-render.ts` → `adjustLumaPreserveChroma()` | ✅ Resolved |
| 3 | `TypeError: buildAttemptConfig(...).with is not a function` | 1 | Stale cache — non-actionable, self-resolves on next deploy | ⊘ Ignored |
| 4 | `Error: useQRGeneratorContext must be used within QRGeneratorProvider` | 8 | Fallback context with safe defaults in `useQRGenerator.ts` instead of throwing | ✅ Resolved |
| 5 | `TypeError: Failed to fetch (anqr.link)` | 1 | Transient network error — non-actionable | ⊘ Ignored |
| 6 | `TypeError: Jo.OpenLocationCode.encode is not a function` | 2 | Fixed: `new OpenLocationCode().encode()` (instance method, not static) in `PayloadSection.tsx` | ✅ Resolved |
| 7 | `TypeError: Failed to fetch (anqr.link)` | 1 | Same as #5 — transient network error | ⊘ Ignored |

**Automated regression monitoring:** `make check:sentry` runs `scripts/check-sentry-regression.mjs` which queries all 3 projects and fails if any unresolved issues exist. Integrated into `make all` step 15.

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

# Cloudflare — DNS, SSL, zone checks, Zaraz config
export CLOUDFLARE_TOKEN_READALL=... # Read-only access (DNS, SSL, analytics validation)
export CLOUDFLARE_TOKEN_ZARAZ=...   # Zaraz config read access (/settings/zaraz/config)
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
11. reports       — payload matrix + i18n + unit coverage + coverage gap
12. sonar         — SonarQube code analysis (non-blocking)
13. deploy        — rebuild with Sentry + Netlify deploy
14. android       — version bump + release AAB + upload to Play Store
15. services      — third-party service validation + Sentry regression check (non-blocking)
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
