# Xcode Cloud setup (one-time)

These shell scripts hook into Apple's **Xcode Cloud** — the CI built into the Apple Developer Program. They handle pre-build steps that aren't part of the Xcode toolchain (Node, npm, Capacitor sync).

## Activating Xcode Cloud for this project

Xcode Cloud is configured through **App Store Connect**, not through files in this repo. Do this once:

1. Sign in at [App Store Connect](https://appstoreconnect.apple.com).
2. Apps → **ANQR** → **Xcode Cloud** tab → **Get Started**.
3. Link the GitHub repository: `maldous/anqr`. You'll be prompted to install the **App Store Connect** GitHub App and grant access to the repo.
4. Create a workflow:
   - **Name:** `iOS TestFlight`
   - **Start condition:** Manual (or "On push to `main`" if you prefer auto-builds)
   - **Environment:** Latest stable macOS + Xcode
   - **Actions:**
     - **Build** the `App` scheme (in `ios/App/App.xcodeproj`)
     - **Archive** with destination `iOS`
   - **Post-actions:**
     - **TestFlight Internal Testing** → distribute to your internal group
5. Save. The first run will pick up `ios/App/ci_scripts/ci_post_clone.sh` automatically.

## What the post-clone script does

`ci_post_clone.sh` runs immediately after Xcode Cloud clones the repo, before any `xcodebuild` step:

1. Installs Node 22 via Homebrew (preinstalled on the Xcode Cloud image)
2. `npm install --legacy-peer-deps`
3. `npm run build:web` (produces `dist/`)
4. `npx cap sync ios` (copies `dist/` into `ios/App/App/public`)
5. Strips `.gz` files that Xcode treats as duplicate resources

## Triggering builds

After the workflow is created in App Store Connect:

- **Manual:** App Store Connect → Xcode Cloud → "Start Build" button on the workflow
- **Automatic:** if you chose "On push to main", every commit triggers
- **From Xcode (Mac):** Product → Xcode Cloud → Build Now

## Why not GitHub Actions?

We tried `.github/workflows/ios-release.yml` but GitHub Actions' macOS runners require billing setup on private repos. Xcode Cloud is bundled with the Apple Developer Program subscription (already paid), so no separate billing is needed.
