# ANQR — Outstanding Items for Production Launch

> **Note:** These are post-launch follow-up items, not blockers. All production-blocking work is complete. Items below require either a live deploy, third-party approval, or are intentionally deferred.

---

## Post-Deploy Verification (requires `make deploy` first)

- [ ] Re-run PageSpeed Insights (desktop + mobile) and compare vs pre-remediation baseline
- [ ] Verify HSTS header with `curl -I https://anqr.link/`
- [ ] Submit anqr.link to <https://hstspreload.org/>
- [ ] Verify asset cache headers match netlify.toml (`max-age=31536000, immutable`) via `curl -I https://anqr.link/assets/<hash>.js`
- [ ] Verify preconnect count ≤ 4 in PSI report
- [ ] Verify no CSP console errors in PSI report
- [ ] Production smoke: routes (`/`, `/gallery`, `/analyze`, static pages), API (`/api/qr`), ads render

## AdSense / AdMob Approval

- [ ] Switch `VITE_ADSENSE_TEST_MODE` from `true` → `false` after Google AdSense approval
- [ ] Switch `VITE_ADMOB_TESTING` from `true` → `false` after Google AdMob approval
- [ ] Verify ad fill rates and revenue reporting in production

## Android (Deferred)

- [ ] Complete 6 emulator-runtime AdMob verification items deferred from plan3.md Phase 2
- [ ] Play Store upload (`make android:upload`) after next version bump

## Quality Follow-ups (Non-blocking)

- [ ] Coverage depth improvement for critical low-coverage files (qr-generator, qr-decoder, scaled-render)
- [ ] Gallery scan matrix: re-run with new preprocessing + dithering scenarios after deploy
- [ ] Community translation contributions via anqr-i18n public repo
