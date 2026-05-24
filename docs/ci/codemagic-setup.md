# CodeMagic — one-time setup for ANQR iOS

You've already logged in and authorised CodeMagic against the `maldous/anqr`
GitHub repo. Two more things in the CodeMagic web UI, then every push to
`main` auto-deploys to the ANQR TestFlight internal track.

Total time: ~10 minutes.

---

## Step 1 — Add the App Store Connect integration

This is how CodeMagic talks to Apple to sign + upload your builds. It uses
the same `.p8` API key we extracted earlier for the Android/Play upload tooling.

1. CodeMagic → **Teams** (top-right menu) → pick your personal team
2. Sidebar → **Integrations** → **App Store Connect** → **Add new integration**
3. Fill in:
   - **Name:** `AppStoreConnect_anqr` (must match `integrations.app_store_connect` in `codemagic.yaml`)
   - **Issuer ID:** `a17cd1f7-2964-4ec2-81db-b817139d8930`
   - **Key ID:** `8YFT9FMAHW`
   - **Private Key (.p8):** paste the content of the `.p8` file. You can dump it on this Linux box with:
     ```sh
     unzip -P anqr -p /home/user/src/anqr/bootstrap.zip signing/AuthKey_8YFT9FMAHW.p8
     ```
     Paste the full output (including the `-----BEGIN PRIVATE KEY-----` / `-----END PRIVATE KEY-----` lines) into the form.
4. **Save**.

Optional but cleaner: assign the integration to the ANQR app so it's visible
in the app's settings page.

---

## Step 2 — Confirm the TestFlight beta group exists

The `codemagic.yaml` distributes to a beta group called `ANQR`.

1. Go to https://appstoreconnect.apple.com → **Apps** → **ANQR** → **TestFlight** tab
2. Confirm there's an **Internal Testing** group named **ANQR** with at least
   one tester. (You confirmed earlier it has 3 members — should be there.)
3. If the group is named differently, edit `beta_groups` in `codemagic.yaml`
   to match.

---

## Step 3 — Trigger the first build

CodeMagic auto-triggers on push to `main`, but to confirm the workflow is
healthy you can also kick it manually:

1. CodeMagic → **Applications** → **anqr** → **Start new build**
2. Pick workflow **`ANQR iOS → TestFlight`**
3. Pick branch `main` → **Start build**

First build cold-starts in ~30s, then runs in 12–18 minutes. You'll see:
- npm install (1–2 min)
- Vite web build + cap sync (1 min)
- pod install (1–2 min)
- Signing assets (~30s — CodeMagic auto-creates the cert + provisioning profile)
- xcodebuild archive (5–10 min)
- TestFlight upload + Apple processing (~3 min)

When done, the build appears on **App Store Connect → TestFlight → Builds**
under the ANQR group within ~5 min of CodeMagic finishing.

---

## What CodeMagic does that Xcode Cloud couldn't

The Xcode Cloud blocker was the `Package.resolved` originHash gate — Apple's
CI rejects any hand-written lock file because it validates the hash of the
full SPM dependency graph. CodeMagic runs `xcodebuild` itself, which
generates `Package.resolved` from scratch on each build inside the macOS
runner. No hand-written lock file required.

The trade-off: ~12–18 min per build vs Xcode Cloud's ~10 min, but CodeMagic's
free tier is generous (500 min/month — covers ~30 builds/month) and there's
no upfront billing setup.

---

## Free-tier limits

- **500 build minutes/month** (resets monthly)
- **mac_mini_m2** instance (fast for iOS builds — counts ~14× a Linux build minute, so 500 min ≈ ~35 builds)
- **Unlimited concurrent users**
- Builds older than 30 days deleted
- One concurrent build at a time

If you outgrow it, the next tier is $30/month for 1000 min on the same hardware.

---

## Troubleshooting

| If you see | What it means | Fix |
|---|---|---|
| `Code signing 'App' failed` | Cert/profile not in place | Re-run after the integration is wired. CodeMagic generates them on first build. |
| `pod install` hangs | First-time pod cache | Just wait — subsequent builds are much faster. |
| `agvtool: error: There is no value` | Build number bump failed | Comment out the "Bump iOS build number" step temporarily; CodeMagic also auto-bumps for new TestFlight uploads. |
| `Build expired` | Older builds auto-expire in 90 days on TestFlight | Just trigger a new build. |
