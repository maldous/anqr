# Xcode Cloud — App Store Connect web setup (3 steps)

You've already built the project locally. These three things happen entirely in
[App Store Connect](https://appstoreconnect.apple.com) (web). One-time only.

---

## Step 1 — Open Xcode Cloud for the ANQR app

1. Go to **https://appstoreconnect.apple.com** and sign in as `matthew.aldous@gmail.com`.
2. Click **Apps** → **ANQR**.
3. In the left sidebar, click **Xcode Cloud**.
4. If you see a "Get Started" screen, click **Get Started**.
   - If you see existing workflows from your earlier MacBook session, skip to Step 3.

> Sidebar tip: if "Xcode Cloud" isn't in the sidebar yet, scroll past General/Distribution/TestFlight. It's a separate section. If it's still missing, return to Xcode on the Mac and pick **Product → Xcode Cloud → Create Workflow** once — that surfaces it.

---

## Step 2 — Connect the GitHub repo `maldous/anqr`

When the wizard prompts for source code:

1. Choose **GitHub** as the source.
2. Click **Grant Access**. A new tab opens to `github.com/apps/app-store-connect`.
3. On GitHub:
   - **Install** the App Store Connect GitHub App on the **`maldous`** account.
   - Choose **Only select repositories** → pick **`maldous/anqr`** only (safer than "all repos").
   - Click **Install**.
4. Return to the App Store Connect tab. The wizard should now show `maldous/anqr` as connectable.
5. Select branch **`main`** and click **Next**.

> If the wizard says "no Xcode project found", make sure `ios/App/App.xcodeproj` is in `main` (it is — confirmed). Apple's discovery looks one directory deep from the repo root and one deep from `ios/`. Our layout matches.

---

## Step 3 — Create the `TestFlight Internal` workflow

Fill in the workflow wizard:

| Field | Value |
|---|---|
| **Name** | `TestFlight Internal` |
| **Description** | *(optional)* `Build, archive, deliver to internal TestFlight` |
| **Start Conditions** | **Manual** (recommended for first time). Or "Branch Changes → `main`" once you trust it. |
| **Environment → macOS** | Latest Release |
| **Environment → Xcode** | Latest Release |
| **Actions → Action 1** | **Archive** |
| Archive: Scheme | `App` |
| Archive: Platform | **iOS** |
| Archive: Deployment Preparation | **TestFlight (Internal Testing Only)** |
| **Post-Actions** | **TestFlight Internal Testing** → select your internal test group |
| **Notifications** | Email yourself on failure (the default) |

Click **Save**. Apple's wizard sometimes asks "Start a build now?" — say **Yes**.

---

## What to expect on the first build

- ~30–40 sec: workflow validates, allocates a runner.
- ~1–3 min: `ci_post_clone.sh` runs (Node install, `npm install`, `build:web`, `cap sync ios`, strip `.gz`).
- ~5–10 min: Xcode archive + sign.
- ~1 min: upload to TestFlight + Apple processing.

Total ~10–15 min. You can watch the live log in App Store Connect → Xcode Cloud → the run, **Logs** tab.

---

## After the first successful run

- **Start a build anytime** (web only, no Mac needed):
  App Store Connect → ANQR → Xcode Cloud → workflow `TestFlight Internal` → **Start Build**.
- **Trigger on push** later:
  Edit the workflow → Start Conditions → add **Branch Changes** → `main`.
- **Build artefacts:** App Store Connect → TestFlight → Builds. Internal testers get a push notification.

---

## Troubleshooting one-liners

| Symptom | Likely fix |
|---|---|
| Build fails in `ci_post_clone.sh` at `npm install` | Re-run the workflow (transient npm registry issue). |
| "No matching provisioning profile" | In Xcode on the Mac: target App → Signing → Automatically manage signing ON → commit/push. |
| "App not found in App Store Connect" | App record exists (it does — Bundle ID `link.anqr.app`); just re-pick the app in the wizard. |
| Build succeeds but doesn't appear in TestFlight | Wait ~5 more min; Apple's processing isn't instant. Check email for "Build processed" or "ITMS-9xxxx" rejection. |
