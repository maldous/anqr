#!/bin/sh
# Xcode Cloud "post-clone" hook.
#
# Runs after the repo is checked out and before xcodebuild. We use it to:
#   1. Install Node.js + npm dependencies
#   2. Build the Vite web bundle (apps/web/dist + workspace packages)
#   3. Sync the web bundle into ios/App/App/public via Capacitor
#   4. Strip pre-compressed .gz assets that Xcode's resource packager rejects
#
# Xcode Cloud runs each ci_*.sh script from a working directory adjacent to
# the script (i.e. ios/App/ci_scripts). Resolve REPO_ROOT relative to that.

set -e
set -u

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
echo "[ci_post_clone] REPO_ROOT=$REPO_ROOT"

cd "$REPO_ROOT"

# Install Node 22 via Homebrew (preinstalled on Xcode Cloud macOS images).
# Node 25 is currently used locally but 22 LTS is widely available.
echo "[ci_post_clone] installing Node 22…"
brew install node@22
brew link --overwrite --force node@22
node --version
npm --version

echo "[ci_post_clone] npm install --legacy-peer-deps…"
npm install --legacy-peer-deps --no-audit --no-fund

echo "[ci_post_clone] building web bundle…"
# VITE_SENTRY_RELEASE picks up CI_BUILD_NUMBER set by Xcode Cloud.
export VITE_SENTRY_RELEASE="anqr@${CI_BUILD_NUMBER:-local}"
npm run build:web

echo "[ci_post_clone] cap sync ios…"
npx cap sync ios

echo "[ci_post_clone] stripping .gz assets that duplicate Xcode resources…"
find "$REPO_ROOT/ios/App/App/public" -name '*.gz' -delete || true

# Write a Package.resolved that pins the only remote SPM dependency this
# project actually has (capacitor-swift-pm at the version declared in
# ios/App/CapApp-SPM/Package.swift). The full Capacitor package graph also
# includes several path-based local packages under node_modules/ — those
# do not need pins.
#
# Xcode Cloud has automatic dependency resolution OFF by default, so a
# valid lock file MUST exist before the archive step runs.
RESOLVED="$REPO_ROOT/ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved"
mkdir -p "$(dirname "$RESOLVED")"
echo "[ci_post_clone] writing Package.resolved for capacitor-swift-pm@8.2.0"
cat > "$RESOLVED" <<'EOF'
{
  "originHash" : "anqr-capacitor-8.2.0",
  "pins" : [
    {
      "identity" : "capacitor-swift-pm",
      "kind" : "remoteSourceControl",
      "location" : "https://github.com/ionic-team/capacitor-swift-pm.git",
      "state" : {
        "revision" : "0e862e6ff13852a710c8a484180ca4d6a2cc9761",
        "version" : "8.2.0"
      }
    }
  ],
  "version" : 3
}
EOF
echo "[ci_post_clone] Package.resolved present ($(wc -c < "$RESOLVED") bytes)"

echo "[ci_post_clone] done."
