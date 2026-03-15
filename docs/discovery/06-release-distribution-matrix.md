# Release and Distribution Matrix

## Objective
Define how changes move from local to users.

| Target | Build path | Approval | Signing | Distribution | Rollback | Notes |
|---|---|---|---|---|---|---|
| Web | Local dev → GitHub push → Netlify build | Automatic for preview; Operator approval for prod | Netlify-managed deploy identity | Netlify CDN + Cloudflare edge | Redeploy previous Netlify build | PWA build via Vite; preview deploys on PRs |
| API | Local dev → GitHub push → Netlify Functions build | Operator approval for prod | Netlify deploy identity | Netlify serverless endpoints behind Cloudflare | Redeploy previous Netlify build | Public API currently unauthenticated |
| Android | Local dev → Capacitor build → Gradle build → APK/AAB | Operator approval before store upload | Android signing key (local keystore) | Google Play (internal → testing → production tracks) | Rollback via previous Play Store release | AdMob integration; mobile parity required |
| iOS | Local dev → Capacitor build → Xcode build → IPA | Operator approval before TestFlight/App Store | Apple certificates + App Store Connect keys | TestFlight → App Store | Rollback via App Store previous version | TestFlight used for internal testers |

---

# Promotion flow

### local -> dev

- Developer machine builds and tests
- Local harness runs:
  - tests
  - lint
  - static analysis
- Feature branch pushed to GitHub
- Netlify preview deploy created
- PR opened

Evidence required:

- CI pass
- test results
- lint results

---

### dev -> staging

Triggered when PR merges to main branch.

Process:

1. Netlify build
2. preview/staging environment deploy
3. automated tests run

Verification:

- parity tests
- gallery generation checks
- Sentry error monitoring
- Lighthouse performance checks

---

### staging -> prod

Manual approval required.

Operator approves deployment after verifying:

- CI status green
- parity checks pass
- performance within budget
- no critical Sentry errors

Deployment:

- Netlify production deploy
- Cloudflare cache update

Rollback:

- redeploy previous build

---

### internal -> public mobile

Android:

1. build signed APK/AAB
2. upload to Google Play internal testing
3. validate functionality
4. promote to production

iOS:

1. build IPA via Xcode
2. upload to TestFlight
3. internal tester validation
4. promote to App Store

Approval:

- Operator required

Rollback:

- store version rollback
- previous build resubmitted if necessary
