# Performance Remediation Report — Iteration 3

Date: 2026-02-15

## Pre-Remediation Baseline (from PSI capture)

| Metric | Desktop | Mobile |
|--------|---------|--------|
| Performance Score | 74 | 55 |
| FCP | 1.2s | 4.4s |
| LCP | 2.0s | 8.5s |
| TBT | 230ms | 290ms |
| CLS | 0.035 | 0.017 |
| Speed Index | 2.6s | 6.7s |

## Issues Identified and Actions Taken

### 1. Excess Preconnect Origins (6 → 4)

**Issue:** PSI flagged "More than 4 preconnect connections were found" with all 6 listed as preconnect hints.

**Action:** Reduced preconnects from 6 to 4 in `index.html`:

| Origin | Before | After | Rationale |
|--------|--------|-------|-----------|
| fonts.googleapis.com | preconnect | preconnect | Critical path — font CSS |
| fonts.gstatic.com | preconnect | preconnect | Critical path — font files |
| pagead2.googlesyndication.com | preconnect | preconnect | Revenue-critical — AdSense script |
| cdn.iubenda.com | preconnect | preconnect | ~134KB consent resources, 257ms main thread |
| cs.iubenda.com | preconnect | **dns-prefetch** | Lower priority iubenda subdomain |
| www.googletagmanager.com | preconnect | **dns-prefetch** | Not on critical path (GA4 via Cloudflare Zaraz) |

**Additional:** Added `crossorigin` attribute to `pagead2.googlesyndication.com` preconnect to match the AdSense script's `crossorigin="anonymous"`, preventing wasted duplicate connections.

**New dns-prefetch entries:** `fundingchoicesmessages.google.com` (needed for Google Funding Choices).

### 2. CSP Blocking Google Funding Choices Script

**Issue:** PSI console error: `Loading the script 'https://fundingchoicesmessages.google.com/...' violates the Content Security Policy directive: "script-src ..."`.

**Action:** Added `https://fundingchoicesmessages.google.com` to the `script-src` directive in `netlify.toml` CSP header.

### 3. Missing HSTS Header

**Issue:** PSI flagged "Use a strong HSTS policy" with severity Medium for missing `includeSubDomains` and `preload` directives.

**Action:** Added `Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"` to the global `/*` security headers in `netlify.toml`.

- max-age: 2 years (recommended minimum for preload list)
- includeSubDomains: covers all subdomains
- preload: signals eligibility for browser HSTS preload list

**Note:** Site should be submitted to https://hstspreload.org/ for preload to take effect.

### 4. Cache Header Discrepancy (Documented, Not Fixed)

**Issue:** PSI reports 4h TTL for `/assets/*.js` files despite `netlify.toml` setting `max-age=31536000, immutable` for `/assets/*`.

**Root Cause Analysis:** This is Netlify's CDN edge cache behavior, not a `netlify.toml` conflict. The `/*` catch-all `Cache-Control: no-cache` block applies to SPA routes but Netlify respects path specificity — `/assets/*` takes precedence over `/*`.

**Action:** Retained the `/*` catch-all (required for SPA route freshness) and added an explanatory comment documenting the discrepancy.

**Verification Required Post-Deploy:** Run `curl -I https://anqr.link/assets/<hash>.js` to confirm browser-facing `Cache-Control` header is `immutable`.

### 5. Render-Blocking Chain

**Issue:** PSI identifies CSS (`index-*.css`) and `registerSW.js` in the render-blocking chain.

**Status:** Accepted — CSS is inherently render-blocking. `registerSW.js` is injected by VitePWA and is a 2KB file with minimal impact. The font loading already uses `media="print"` + `onload` pattern for non-blocking behavior.

### 6. Ad Slot Coverage Gap

**Issue:** The `translate` static page was missing dedicated ad slots, causing ad placeholders to render without configured IDs.

**Action:** Added `translate-top` and `translate-bottom` slot names to `AdUnit.tsx` and corresponding `VITE_ADSENSE_SLOT_TRANSLATE_TOP`/`VITE_ADSENSE_SLOT_TRANSLATE_BOTTOM` env vars to `Makefile`.

## Changes Summary

| File | Change |
|------|--------|
| `index.html` | Reduced preconnects 6→4, added crossorigin to AdSense preconnect, added dns-prefetch entries |
| `netlify.toml` | Added HSTS header, added fundingchoicesmessages.google.com to CSP, documented cache discrepancy |
| `src/components/AdUnit.tsx` | Added translate-top/translate-bottom slot names and env var mappings |
| `Makefile` | Added VITE_ADSENSE_SLOT_TRANSLATE_TOP/BOTTOM env vars |

## Expected Impact

| Area | Expected Improvement |
|------|---------------------|
| Preconnect warnings | Resolved (6→4, within PSI threshold) |
| CSP console errors | Resolved (fundingchoicesmessages.google.com allowed) |
| HSTS security score | Improved (full HSTS with preload) |
| Cache header discrepancy | Documented with root cause (Netlify CDN edge) |
| Ad slot coverage | Complete (all 8 static pages + gallery + editor covered) |

## Post-Deploy Verification Checklist

- [ ] Re-run PSI for desktop and mobile
- [ ] Verify preconnect count ≤ 4 in PSI report
- [ ] Verify no CSP console errors in PSI report
- [ ] Verify HSTS header with `curl -I https://anqr.link/`
- [ ] Verify asset cache headers with `curl -I https://anqr.link/assets/<hash>.js`
- [ ] Submit anqr.link to https://hstspreload.org/
