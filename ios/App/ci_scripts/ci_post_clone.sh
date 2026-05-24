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

# Xcode Cloud disables automatic Swift Package Manager resolution by default
# and the entire project.xcworkspace/ directory (where Package.resolved lives)
# is gitignored, so the lock file is never checked in. Resolve packages here
# so the subsequent archive step finds the file at the expected path.
echo "[ci_post_clone] resolving Swift Package Manager dependencies…"
xcodebuild -resolvePackageDependencies \
  -project "$REPO_ROOT/ios/App/App.xcodeproj" \
  -scheme App \
  -clonedSourcePackagesDirPath "$REPO_ROOT/ios/App/SourcePackages" \
  -disableAutomaticPackageResolution=NO

# Sanity check the lock file landed where Xcode Cloud's archive step expects it.
RESOLVED="$REPO_ROOT/ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved"
if [ -f "$RESOLVED" ]; then
  echo "[ci_post_clone] Package.resolved present ($(wc -c < "$RESOLVED") bytes)"
else
  echo "[ci_post_clone] WARN: Package.resolved not produced; archive step may fail"
fi

echo "[ci_post_clone] done."
