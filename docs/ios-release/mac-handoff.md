# iOS Release — Mac Handoff Runbook

> **Issue:** ANQ-37
> **Parent:** ANQ-36 — iOS local-first execution
> **Last verified:** 2026-03-08 (Alex MacBook — Apple M-series, macOS Sequoia)

## Prerequisites

| Requirement              | Minimum                       | Verified                                        |
| ------------------------ | ----------------------------- | ----------------------------------------------- |
| macOS                    | Sequoia (15.x)                | ✅                                              |
| Xcode                    | 26.x (full IDE, not just CLT) | ✅ 26.3 (Build 17C529)                          |
| Xcode CLT                | Installed                     | ✅ `/Applications/Xcode.app/Contents/Developer` |
| Node.js                  | 25.8.0 (via nvm)              | ✅                                              |
| Ruby                     | 3.x+ (Homebrew, not system)   | ✅ 4.0.1                                        |
| CocoaPods                | 1.16+                         | ✅ 1.16.2                                       |
| Bundler                  | 2.x+                          | ✅ 4.0.3                                        |
| Fastlane                 | 2.220+                        | ✅ 2.232.2                                      |
| Apple Developer account  | Active membership             | ✅ matthew.aldous@gmail.com                     |
| App Store Connect access | Admin role                    | ⏳ Pending verification                         |

## Step 1 — Verify Toolchain

### 1.1 Xcode (full IDE)

```bash
# Verify Xcode is installed
xcodebuild -version
# Expected: Xcode 26.3, Build version 17C529

# Ensure Xcode is the active developer directory (not CLT)
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer

# Accept license
sudo xcodebuild -license accept

# Verify path
xcode-select -p
# Expected: /Applications/Xcode.app/Contents/Developer
```

### 1.2 Ruby (Homebrew — not system Ruby)

```bash
ruby --version
# Expected: ruby 4.0.1 (Homebrew)

# Ensure Homebrew Ruby is in PATH (~/.zprofile):
export PATH="/opt/homebrew/opt/ruby/bin:/opt/homebrew/lib/ruby/gems/4.0.0/bin:$PATH"
```

### 1.3 Bundler

```bash
bundler --version
# Expected: Bundler version 4.0.3
```

### 1.4 CocoaPods

```bash
pod --version
# Expected: 1.16.2
```

### 1.5 Fastlane

```bash
fastlane --version
# Expected: fastlane 2.232.2
```

## Step 2 — Apple Developer and App Store Connect

> ⚠️ **Human-only step** — requires Apple ID credentials and 2FA.

### 2.1 Apple Developer Portal Login

1. Open https://developer.apple.com and sign in with the team Apple ID (matthew.aldous@gmail.com).
2. Verify active Apple Developer Program membership (requires annual renewal).
3. Navigate to Certificates, Identifiers & Profiles.

### 2.2 App Store Connect Login

1. Open https://appstoreconnect.apple.com and sign in.
2. Verify admin-level access to the ANQR app listing.
3. Confirm the app's Bundle Identifier: `link.anqr.app` (must match `capacitor.config.ts`).

### 2.3 Xcode Account Setup

> ⚠️ **GUI-only step** — cannot be done from CLI.

1. Open Xcode → Settings → Accounts
2. Click **+** → **Apple ID** → sign in as matthew.aldous@gmail.com
3. Xcode will download signing certificates and provisioning profiles automatically
4. Verify the team appears under "Teams" in the account panel

**Validation evidence required:**

- Screenshot of Xcode Accounts showing team membership
- `security find-identity -v -p codesigning` shows ≥1 valid identity

## Step 3 — Capacitor iOS Platform Setup

> **Note:** This project uses Capacitor with Swift Package Manager (SPM), not CocoaPods.
> The Xcode project is `ios/App/App.xcodeproj` (not `.xcworkspace`).

### 3.1 Install Capacitor iOS

```bash
npm install @capacitor/ios
npx cap add ios
# Expected: [success] ios platform added!

# Verify ios/ directory
ls ios/App/App.xcodeproj
```

### 3.2 Sync Web Assets

```bash
npm run build

# Sync to iOS project
npx cap sync ios
# Expected: ✔ copy ios ... ✔ update ios ... Sync finished
```

### 3.3 Open in Xcode

```bash
npx cap open ios
# This opens ios/App/App.xcodeproj in Xcode
```

## Step 4 — iOS Simulator Runtime Setup

> **Known issue (Xcode 26.3):** The iOS SDK (26.2, build 23C57) does not have a
> matching simulator runtime available for download. The closest available runtime
> is iOS 26.3.1 (build 23D8133). A manual runtime match override is required.

### 4.1 Download Simulator Runtime

```bash
xcodebuild -downloadPlatform iOS
# Downloads iOS 26.3.1 Simulator (~8.4 GB)
```

### 4.2 Fix Runtime Match (version mismatch workaround)

```bash
# Check current state — iOS runtime may show as "Ready" but not registered
xcrun simctl list runtimes
xcrun simctl runtime list

# Get the UUID of the downloaded iOS runtime
# Look for: iOS 26.3.1 (23D8133) - <UUID> (Ready)
RUNTIME_UUID=$(xcrun simctl runtime list 2>&1 | grep 'iOS.*Ready' | grep -oE '[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}')

# Override the SDK → runtime match
xcrun simctl runtime match set iphoneos26.2 "$RUNTIME_UUID"

# Restart CoreSimulator to pick up the change
killall -9 com.apple.CoreSimulator.CoreSimulatorService 2>/dev/null || true
sleep 5

# Verify the runtime is now registered
xcrun simctl list runtimes
# Expected: iOS 26.3 (26.3.1 - 23D8133) - com.apple.CoreSimulator.SimRuntime.iOS-26-3
```

### 4.3 Verify Simulator Devices

```bash
xcrun simctl list devices available | grep iPhone
# Expected: iPhone 17 Pro, iPhone 16e, etc. listed under iOS 26.3
```

## Step 5 — Signing, Profiles, and Capabilities

> ⚠️ **Human-only step** — requires Xcode GUI and Apple Developer account.

### 5.1 Signing Configuration

1. In Xcode, select the **App** target → **Signing & Capabilities** tab.
2. Enable **Automatically manage signing**.
3. Select the correct **Team** from the dropdown.
4. Verify the **Bundle Identifier** matches `link.anqr.app`.
5. Xcode should automatically create/download a provisioning profile.

### 5.2 Build Settings Verification

| Setting              | Expected Value                                |
| -------------------- | --------------------------------------------- |
| Bundle Identifier    | `link.anqr.app`                               |
| Deployment Target    | iOS 15.0 (or as set in `capacitor.config.ts`) |
| Signing Team         | ANQR team                                     |
| Signing Certificate  | Apple Distribution                            |
| Provisioning Profile | Automatic                                     |

## Step 6 — Simulator Smoke Tests

### 6.1 Build for Simulator

```bash
xcodebuild -project ios/App/App.xcodeproj \
  -scheme App \
  -destination 'platform=iOS Simulator,name=iPhone 16e' \
  -configuration Debug \
  build CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO \
  2>&1 | tail -5
# Expected: ** BUILD SUCCEEDED **
# Verified 2026-03-08: BUILD SUCCEEDED (iPhone 16e)
```

### 6.2 Run on Simulator

```bash
# Boot a simulator
xcrun simctl boot 'iPhone 16e'

# Install the built app
xcrun simctl install booted \
  ~/Library/Developer/Xcode/DerivedData/App-*/Build/Products/Debug-iphonesimulator/App.app

# Launch the app
xcrun simctl launch booted link.anqr.app

# Take a screenshot for evidence
xcrun simctl io booted screenshot /tmp/anqr-simulator-smoke.png
```

## Step 7 — Release Archive and Export

### 7.1 Build Release Archive

```bash
xcodebuild -project ios/App/App.xcodeproj \
  -scheme App \
  -destination 'generic/platform=iOS' \
  -configuration Release \
  archive -archivePath /tmp/ANQR.xcarchive \
  -allowProvisioningUpdates \
  DEVELOPMENT_TEAM=5NXZ72D7LF \
  2>&1 | tail -5
# Expected: ** ARCHIVE SUCCEEDED **
# Verified 2026-03-08: ARCHIVE SUCCEEDED
```

### 7.2 Export to IPA

```bash
# Create ExportOptions.plist
cat > /tmp/ExportOptions.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store-connect</string>
    <key>teamID</key>
    <string>5NXZ72D7LF</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
EOF

xcodebuild -exportArchive \
  -archivePath /tmp/ANQR.xcarchive \
  -exportPath /tmp/ANQR-IPA \
  -exportOptionsPlist /tmp/ExportOptions.plist \
  -allowProvisioningUpdates \
  2>&1 | tail -5
# Expected: ** EXPORT SUCCEEDED **
# Verified 2026-03-08: EXPORT SUCCEEDED — App.ipa (167 MB)
```

### 7.3 Upload to App Store Connect

```bash
# Option A: Xcode Organizer → "Distribute App" → App Store Connect
# Option B: Fastlane
fastlane deliver --ipa /tmp/ANQR-IPA/App.ipa --skip_screenshots --skip_metadata
```

## Troubleshooting

### Simulator runtime not registering (version mismatch)

```bash
# Delete all iOS runtimes and re-download
xcrun simctl runtime delete all
xcodebuild -downloadPlatform iOS

# Then apply the runtime match workaround (see Step 4.2)
```

### Signing identity not found

Xcode → Settings → Accounts → Select team → Manage Certificates. Delete expired certs, then re-download.

### Capacitor sync fails

```bash
npm run build
npx cap sync ios --deployment
```

### Xcode build fails with module errors

```bash
xcodebuild clean -project ios/App/App.xcodeproj -scheme App
```

### Ruby/gem permission errors

```bash
# Never use sudo with gem install. Use Homebrew Ruby:
export PATH="/opt/homebrew/opt/ruby/bin:/opt/homebrew/lib/ruby/gems/4.0.0/bin:$PATH"
```

## Version Reference (as of 2026-03-08)

| Tool           | Version                | Install Method                     |
| -------------- | ---------------------- | ---------------------------------- |
| macOS          | Sequoia                | —                                  |
| Xcode          | 26.3 (Build 17C529)    | Mac App Store                      |
| Node.js        | 25.8.0                 | nvm (Homebrew)                     |
| Ruby           | 4.0.1                  | `brew install ruby`                |
| CocoaPods      | 1.16.2                 | `brew install cocoapods`           |
| Bundler        | 4.0.3                  | Ships with Ruby                    |
| Fastlane       | 2.232.2                | `brew install fastlane`            |
| @capacitor/ios | 8.2.0                  | `npm install @capacitor/ios`       |
| iOS SDK        | 26.2 (Build 23C57)     | Bundled with Xcode                 |
| iOS Simulator  | 26.3.1 (Build 23D8133) | `xcodebuild -downloadPlatform iOS` |
