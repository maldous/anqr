# One-time Xcode Cloud bootstrap — MacBook checklist

Estimated time: **15–30 min** (most of it waiting on `pod install` and Xcode's first index).

Everything you commit during this process should already be in `main` (commit `d79ce5a5` onwards). You're just opening Xcode and running the workflow-creation wizard.

---

## Prerequisites

- Xcode 15.0+ (App Store)
- Signed in to the Apple Developer account `matthew.aldous@gmail.com` in **Xcode → Settings → Accounts**
- Membership in the Apple Developer Program (already paid)
- ~5 GB free disk space (Xcode derived data, SDKs)

---

## 1 — Get the code

```sh
mkdir -p ~/src && cd ~/src
git clone git@github.com:maldous/anqr.git    # or: gh repo clone maldous/anqr
cd anqr
git pull
```

Make sure the latest is `main` and contains `ios/App/ci_scripts/ci_post_clone.sh`.

---

## 2 — Install Node + build the web bundle (sanity check)

You want this to succeed locally before letting Xcode Cloud run it.

```sh
# If you don't have Node 22:
brew install node@22 && brew link --overwrite --force node@22
node --version          # should print v22.x

# Repo deps + web build:
npm install --legacy-peer-deps
npm run build:web
npx cap sync ios
```

After `cap sync` succeeds you should have `ios/App/App/public/index.html`.

---

## 3 — Install CocoaPods + open Xcode

```sh
sudo gem install cocoapods
cd ios/App
pod install --repo-update
open App.xcworkspace        # IMPORTANT: open the .xcworkspace, NOT App.xcodeproj
```

Wait for Xcode's initial indexing (status in the toolbar). First time can be slow.

---

## 4 — Confirm signing works locally

In Xcode:

1. Select the `App` scheme (top centre).
2. Set destination to **Any iOS Device (arm64)**.
3. Click the project navigator → `App` target → **Signing & Capabilities** tab.
4. Confirm:
   - Team: **ANQR / Matthew Aldous (5NXZ72D7LF)**
   - Bundle Identifier: **link.anqr.app**
   - Automatically manage signing: ✅
5. Product → Build (⌘B). Should compile clean.

If signing fails, Xcode usually offers a one-click "Try Again" or "Fix" — accept it.

---

## 5 — Create the Xcode Cloud workflow

1. **Product → Xcode Cloud → Create Workflow** (or the cloud icon in the toolbar).
2. App Store Connect prompts you to grant Xcode Cloud access. Accept.
3. Choose the product: **ANQR (link.anqr.app)**.
4. Workflow wizard — set:
   - **Name:** `TestFlight Internal`
   - **Start Conditions → Branch Changes:** disable for now (we'll trigger manually). Or enable for `main` if you want every push to ship.
   - **Environment:**
     - macOS: Latest Release
     - Xcode: Latest Release
   - **Actions:**
     - Action 1: **Archive**
       - Scheme: `App`
       - Platform: iOS
       - Deployment Preparation: **TestFlight (Internal Testing Only)**
   - **Post-Actions:**
     - **TestFlight Internal Testing**: deliver to all internal testers
5. **Save**. The first build kicks off automatically.

---

## 6 — Watch the first run

Stay in Xcode → Report Navigator (`⌘9`) → Cloud tab. Or open App Store Connect → Xcode Cloud → ANQR.

The `ci_post_clone.sh` log will show:

```
[ci_post_clone] REPO_ROOT=…
[ci_post_clone] installing Node 22…
[ci_post_clone] npm install --legacy-peer-deps…
[ci_post_clone] building web bundle…
[ci_post_clone] cap sync ios…
[ci_post_clone] stripping .gz assets that duplicate Xcode resources…
[ci_post_clone] done.
```

If it fails at this stage, the most common cause is `npm install` timing out — Apple's CI runners sometimes get slow npm registry routes. Re-running usually works.

If it gets past `ci_post_clone` and fails inside Xcode's archive step, the most likely cause is missing capability/provisioning profile — in that case, in Xcode locally, go to Signing & Capabilities, click "+ Capability" if needed, then commit and push.

---

## 7 — After it succeeds

- The build appears in App Store Connect → TestFlight → Builds within a few minutes (after Apple's automated processing).
- Internal testers (your TestFlight test group) get a push notification.
- Future builds: **App Store Connect → Xcode Cloud → "Start Build"** — no MacBook needed from here on.

---

## What's already on `main` for you

- `ios/App/ci_scripts/ci_post_clone.sh` — the pre-build hook (Node + npm + cap sync)
- `ios/App/ci_scripts/README.md` — context
- `capacitor.config.json` — `webDir: dist`, `appId: link.anqr.app`
- `ios/App/fastlane/Appfile` — `app_identifier`, `team_id`

You don't need to edit any of these on the MacBook unless something fails. Just push any new commits afterwards.
