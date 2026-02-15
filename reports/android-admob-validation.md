# Android AdMob Validation Report

**Project:** ANQR  
**Phase:** 2 of plan3.md — Android AdMob Validation  
**Method:** Code-path analysis (no active emulator)  
**Date:** 2025-01-XX  
**Auditor:** Automated code review  

---

## Executive Summary

All AdMob ad types (banner, interstitial, rewarded, rewardedInterstitial) are correctly wired through the codebase. Production ad unit IDs are configured in the Makefile with proper test-mode fallback. Self-heal patterns ensure ads show even when `prepare` was not called first. Error handling is graceful throughout — failures return `false` or `{ rewarded: false }` rather than throwing. Unit test coverage is comprehensive.

**Overall Status: PASS (code-path) · DEFERRED (emulator runtime)**

---

## 1. Initialization Flow

| Check | Status | Evidence |
|-------|--------|----------|
| Dynamic import of `@capacitor-community/admob` | **PASS** | `admob.ts:139` — `await import('@capacitor-community/admob')` |
| `AdMob.initialize()` called with correct options | **PASS** | `admob.ts:146-151` — `requestTrackingAuthorization: true`, `initializeForTesting: false` |
| Banner height listener registered | **PASS** | `admob.ts:154-159` — `AdMob.addListener(BannerAdPluginEvents.SizeChanged, ...)` |
| Graceful fallback when plugin unavailable | **PASS** | `admob.ts:163-166` — catch sets `adMobAvailable = false`, logs debug |
| Startup sequence in `main.tsx` | **PASS** | `main.tsx:53-65` — `initializeAdMob()` → `prepareAllAds()` → `showBannerAd('bottom')` |
| Startup delay for Capacitor bridge | **PASS** | `main.tsx:55` — 100ms `setTimeout` before init |

---

## 2. Ad Unit ID Resolution

| Check | Status | Evidence |
|-------|--------|----------|
| Test mode detection | **PASS** | `admob.ts:58` — `isTestMode = import.meta.env.VITE_ADMOB_TESTING === 'true'` |
| Test mode uses Google test IDs | **PASS** | `admob.ts:80` — returns `TEST_AD_UNIT_IDS[type]` when `isTestMode` |
| Production mode uses env vars | **PASS** | `admob.ts:84-102` — switches on type/context to select correct `PROD_AD_UNIT_IDS.*` |
| Fallback from empty prod ID to test ID | **PASS** | `admob.ts:62-67` — `pickProdAdUnitId()` warns and returns test ID if trimmed candidate is empty |
| All 7 production IDs in Makefile | **PASS** | Makefile lines 278-288 — all `ca-app-pub-2270701384951162/*` IDs present |

**Production Ad Unit ID Inventory:**

| Env Var | Makefile Value | Maps To |
|---------|---------------|---------|
| `VITE_ADMOB_BANNER_BOTTOM` | `ca-app-pub-2270701384951162/3063892358` | `getAdUnitId('banner', 'bottom')` |
| `VITE_ADMOB_BANNER_TOP` | `ca-app-pub-2270701384951162/6312694619` | `getAdUnitId('banner', 'top')` |
| `VITE_ADMOB_INTERSTITIAL_EXPORT` | `ca-app-pub-2270701384951162/4365188125` | `getAdUnitId('interstitial', 'export')` |
| `VITE_ADMOB_INTERSTITIAL_GALLERY` | `ca-app-pub-2270701384951162/5434727214` | `getAdUnitId('interstitial', 'gallery')` |
| `VITE_ADMOB_INTERSTITIAL_GENERATION` | `ca-app-pub-2270701384951162/7051061212` | `getAdUnitId('interstitial')` (default) |
| `VITE_ADMOB_REWARDED_PREMIUM` | `ca-app-pub-2270701384951162/8325432672` | `getAdUnitId('rewarded', 'premium')` |
| `VITE_ADMOB_REWARDED_EXPORT_HD` | `ca-app-pub-2270701384951162/4911983037` | `getAdUnitId('rewarded', 'export_hd')` |

**Makefile test flag:** `VITE_ADMOB_TESTING := true` (line 291) — currently in test mode.

---

## 3. Banner Ads

| Check | Status | Evidence |
|-------|--------|----------|
| `showBannerAd(position)` uses ADAPTIVE_BANNER | **PASS** | `admob.ts:218` — `adSize: BannerAdSize.ADAPTIVE_BANNER` |
| Top/bottom position mapping | **PASS** | `admob.ts:219` — `BannerAdPosition.TOP_CENTER` / `BOTTOM_CENTER` |
| `showTopBanner()` convenience wrapper | **PASS** | `admob.ts:234-235` — delegates to `showBannerAd('top')` |
| `showBottomBanner()` convenience wrapper | **PASS** | `admob.ts:241-242` — delegates to `showBannerAd('bottom')` |
| Banner shown at startup | **PASS** | `main.tsx:60` — `await showBannerAd('bottom')` |
| `hideBannerAd()` resets height to 0 | **PASS** | `admob.ts:253` — sets `currentBannerHeight = 0`, notifies callbacks |
| `removeBannerAd()` resets height to 0 | **PASS** | `admob.ts:269` — same reset pattern |
| Banner height tracked via callbacks | **PASS** | `admob.ts:154-159` — `SizeChanged` listener updates `currentBannerHeight` |
| `onBannerHeightChange()` subscription API | **PASS** | `admob.ts:194-207` — push/filter pattern with unsubscribe return |
| `useBannerHeight` hook for layout | **PASS** | `useBannerHeight.ts:11-20` — subscribes on native, returns 0 on web |
| Layout adapts to banner height | **PASS** | `Header.tsx:631` — mobile footer uses `bottom: ${bannerHeight + 40}px` |

---

## 4. Interstitial Ads

| Check | Status | Evidence |
|-------|--------|----------|
| `prepareInterstitial(type)` resolves ad ID by context | **PASS** | `admob.ts:290-301` — maps type to `getAdUnitId('interstitial', type)` |
| `rewardedInterstitial` type uses `prepareRewardedInterstitialAd` | **PASS** | `admob.ts:298-299` — separate SDK call for rewarded interstitial |
| `showInterstitial(type)` self-heal pattern | **PASS** | `admob.ts:320-326` — if key not in `preparedInterstitialKeys`, calls `prepareInterstitial()` first |
| Show calls `AdMob.showInterstitial()` | **PASS** | `admob.ts:334` |
| `rewardedInterstitial` show calls `showRewardedInterstitialAd()` | **PASS** | `admob.ts:330` |
| Auto-prepare next ad after show | **PASS** | `admob.ts:338` — `void prepareInterstitial(type)` fire-and-forget |
| Error handling returns `false` | **PASS** | `admob.ts:341-343` — catch deletes key, logs error, returns `false` |

### 4a. Gallery Interstitial Path

| Check | Status | Evidence |
|-------|--------|----------|
| Gallery prepares on mount | **PASS** | `Gallery.tsx:285-292` — `useEffect` calls `prepareInterstitial('gallery')` then `showInterstitial('gallery')` |
| Cleanup prevents stale show | **PASS** | `Gallery.tsx:291` — `cancelled` flag checked before `showInterstitial` |
| Ad type is `'gallery'` | **PASS** | Maps to `VITE_ADMOB_INTERSTITIAL_GALLERY` via `getAdUnitId('interstitial', 'gallery')` |

### 4b. Export Interstitial Path

| Check | Status | Evidence |
|-------|--------|----------|
| Export ad prepared on hook mount | **PASS** | `useQRGenerator.ts:1982` — `prepareInterstitial('export')` in `useEffect([], [])` |
| Export ad shown before download | **PASS** | `useQRGenerator.ts:1996` — `await showInterstitial('export')` at top of `download()` |
| Ad type is `'export'` | **PASS** | Maps to `VITE_ADMOB_INTERSTITIAL_EXPORT` |

### 4c. Generation Tracking

| Check | Status | Evidence |
|-------|--------|----------|
| `trackGenerationAndShowAd(interval, type)` increments counter | **PASS** | `admob.ts:462` — `generationCount++` |
| Shows ad every N generations | **PASS** | `admob.ts:464` — `generationCount % interval === 0` triggers `showInterstitial` |
| Auto-prepares next after show | **PASS** | `admob.ts:467-468` — `prepareInterstitial(type)` after successful show |

---

## 5. Rewarded Ads

| Check | Status | Evidence |
|-------|--------|----------|
| `prepareRewardedAd(type)` resolves ad ID by context | **PASS** | `admob.ts:354-365` — maps `'premium'` → `'premium'` context, `'rewarded'` → `'export_hd'` context |
| `rewardedInterstitial` uses `prepareRewardedInterstitialAd` | **PASS** | `admob.ts:363-364` |
| `showRewardedAd(type)` self-heal pattern | **PASS** | `admob.ts:394-399` — if key not in `preparedRewardedKeys`, calls `prepareRewardedAd()` first |
| Returns `{ rewarded: true, amount, type }` on success | **PASS** | `admob.ts:412-415` |
| Returns `{ rewarded: false }` on failure | **PASS** | `admob.ts:419` — catch returns `{ rewarded: false }` |
| Auto-prepare next ad after show | **PASS** | `admob.ts:410` — `void prepareRewardedAd(type)` |
| `isRewardedAdReady()` check | **PASS** | `admob.ts:382` — `preparedRewardedKeys.size > 0` |

### 5a. Professional Tier Gate (Header.tsx)

| Check | Status | Evidence |
|-------|--------|----------|
| Rewarded ad prepared on mount | **PASS** | `Header.tsx:279` — `prepareRewardedAd('premium')` in `useEffect` with `Capacitor.isNativePlatform()` guard |
| Tier change to professional triggers ad | **PASS** | `Header.tsx:285-310` — `handleTierChange('professional')` checks `isNativePlatform()`, calls `showRewardedAd('premium')` |
| Premium access check before ad | **PASS** | `Header.tsx:289-290` — `checkPremiumAccess()` skips ad if already granted |
| `activatePremiumAccess()` on reward | **PASS** | `Header.tsx:300` — called when `reward.rewarded` is true |
| Re-prepare ad after show | **PASS** | `Header.tsx:309` — `prepareRewardedAd('premium')` in `finally` block |
| Loading state during ad | **PASS** | `Header.tsx:295,307` — `setLoadingAd(true/false)` gates UI |

### 5b. Help Link Rewarded Gate (help-link.tsx)

| Check | Status | Evidence |
|-------|--------|----------|
| Professional tier requires ad on native | **PASS** | `help-link.tsx:64-68` — checks `effectiveTier === 'professional'` and `Capacitor.isNativePlatform()` |
| `showRewardedAd('premium')` called | **PASS** | `help-link.tsx:75` |
| Blocks navigation if ad not completed | **PASS** | `help-link.tsx:76-79` — returns early if `!reward` |
| `activatePremiumAccess()` on reward | **PASS** | `help-link.tsx:81` |
| Re-prepare ad after show | **PASS** | `help-link.tsx:90` — `prepareRewardedAd('premium')` |

---

## 6. `prepareAllAds()` Preloading

| Check | Status | Evidence |
|-------|--------|----------|
| Called at startup | **PASS** | `main.tsx:58` — `await prepareAllAds()` after `initializeAdMob()` |
| Prepares all interstitial variants | **PASS** | `admob.ts:431-434` — `export`, `gallery`, `interstitial`, `rewardedInterstitial` |
| Prepares all rewarded variants | **PASS** | `admob.ts:435-436` — `premium`, `rewarded` |
| Uses `Promise.all` for parallel prep | **PASS** | `admob.ts:430` |

---

## 7. Error Handling & Graceful Degradation

| Check | Status | Evidence |
|-------|--------|----------|
| All public functions guard `adMobAvailable` | **PASS** | Every function starts with `if (!(adMobAvailable && AdMob)) return false/void/{rewarded:false}` |
| Plugin import failure handled | **PASS** | `admob.ts:163-166` — catch sets `adMobAvailable = false` |
| Banner show failure returns false | **PASS** | `admob.ts:226-228` |
| Interstitial show failure returns false | **PASS** | `admob.ts:341-343` |
| Rewarded show failure returns `{rewarded: false}` | **PASS** | `admob.ts:417-419` |
| Prepare failure clears prepared key | **PASS** | `admob.ts:309,375` — `preparedInterstitialKeys.delete()` / `preparedRewardedKeys.delete()` |
| No-fill / network failures handled gracefully | **PASS** | SDK errors are caught by the try/catch; callers receive `false` / `{rewarded: false}` |

---

## 8. Unit Test Coverage

**File:** `tests/unit/platform-admob.spec.ts`

| Test Area | Status | Evidence |
|-----------|--------|----------|
| Initialization success | **PASS** | Line 54 — `expect(await mod.initializeAdMob()).toBe(true)` |
| Banner show top/bottom | **PASS** | Lines 64, 75 — `showTopBanner()`, `showBottomBanner()` |
| Banner height tracking | **PASS** | Lines 60-62 — `SizeChanged` event → `getBannerHeight()` |
| Banner hide resets state | **PASS** | Lines 68-70 — `hideBannerAd()` → height=0, position=null |
| Interstitial self-heal | **PASS** | Lines 87-91 — `showInterstitial('gallery')` without prior prepare |
| Interstitial prepare/show | **PASS** | Lines 94-100 — `prepareInterstitial` + `showInterstitial` for `interstitial`, `rewardedInterstitial` |
| Rewarded prepare/show | **PASS** | Lines 102-125 — all 3 types: `rewarded`, `rewardedInterstitial`, `premium` |
| Rewarded self-heal | **PASS** | Lines 108-115 — `showRewardedAd('premium')` without prior prepare |
| Reward payload verified | **PASS** | Lines 110-114, 119-125 — `{ rewarded: true, amount: 5, type: 'gem' }` |
| Show failure returns false | **PASS** | Lines 130-131 — `mockRejectedValueOnce` → `resolves.toBe(false)` |
| Prepare failure returns false | **PASS** | Lines 133-134 — `mockRejectedValueOnce` → `resolves.toBe(false)` |
| Rewarded failure returns `{rewarded: false}` | **PASS** | Lines 136-137 |
| Generation tracking interval | **PASS** | Lines 149-151 — 3 calls with interval=3, third returns true |
| `prepareAllAds` calls both prepare methods | **PASS** | Lines 154-156 |
| Unavailable plugin fallback | **PASS** | Lines 160-168 — all functions return false/empty when plugin missing |
| `isRewardedAdReady()` check | **PASS** | Line 107 |

---

## 9. Emulator Runtime Validation

| Check | Status | Notes |
|-------|--------|-------|
| Banner renders on screen | **DEFERRED** | No active emulator in this session |
| Interstitial displays and dismisses | **DEFERRED** | No active emulator |
| Rewarded ad plays and returns reward | **DEFERRED** | No active emulator |
| Test ad unit IDs work | **DEFERRED** | `VITE_ADMOB_TESTING=true` is set; needs emulator to verify |
| Layout padding adjusts for banner | **DEFERRED** | `useBannerHeight` hook wired; needs visual verification |
| No ad-related crashes on cold start | **DEFERRED** | Code paths look safe; needs emulator to confirm |

**Previous emulator evidence:** `reports/android-export-verification.md` (iteration 2) confirmed the app ran on emulator. AdMob-specific runtime testing was not documented there.

**Recommendation:** Re-verify all DEFERRED items on emulator after deploying iteration 3 changes. Specific test plan:
1. Cold start → verify banner appears at bottom
2. Navigate to Gallery → verify interstitial fires
3. Generate QR → export → verify interstitial fires before download
4. Switch to Professional tier → verify rewarded ad plays and tier unlocks
5. Verify `adb logcat | grep ADMOB` shows test ad unit IDs being used

---

## 10. Architecture Quality Notes

### Strengths
- **Self-heal pattern**: `show*` functions auto-call `prepare*` if inventory is empty — prevents blank ad slots
- **Fire-and-forget re-prepare**: After every successful show, the next ad is immediately prepared (`void prepare*()`)
- **Centralized ID management**: `getAdUnitId()` consolidates all ID logic with context-based routing
- **Graceful degradation**: Every public function returns a safe default when AdMob is unavailable (web, missing plugin)
- **Parallel preloading**: `prepareAllAds()` uses `Promise.all` for fast startup
- **Type-safe contexts**: `InterstitialType` and `RewardedType` union types prevent typos

### Minor Observations
- `VITE_ADMOB_TESTING` is currently `true` in the Makefile — must be set to `false` (or removed) before production release
- The `rewardedInterstitial` type shares the `VITE_ADMOB_REWARDED_PREMIUM` ad unit ID (intentional, per `getAdUnitId` line 100)
- `trackGenerationAndShowAd` is exported but not currently called from any component (infrastructure for future use)

---

## Summary Table

| Category | Checks | PASS | FAIL | DEFERRED |
|----------|--------|------|------|----------|
| Initialization | 6 | 6 | 0 | 0 |
| Ad Unit IDs | 5 | 5 | 0 | 0 |
| Banner Ads | 11 | 11 | 0 | 0 |
| Interstitial Ads | 14 | 14 | 0 | 0 |
| Rewarded Ads | 16 | 16 | 0 | 0 |
| Preloading | 4 | 4 | 0 | 0 |
| Error Handling | 7 | 7 | 0 | 0 |
| Unit Tests | 16 | 16 | 0 | 0 |
| Emulator Runtime | 6 | 0 | 0 | 6 |
| **Total** | **85** | **79** | **0** | **6** |

**Exit Criteria Met:**
- ✅ All 4 ad types (banner, interstitial, rewarded, rewardedInterstitial) verified in code
- ✅ Gallery interstitial confirmed in `Gallery.tsx` `useEffect`
- ✅ Export interstitial confirmed in `useQRGenerator.ts` `download()` flow
- ✅ Professional rewarded confirmed in `Header.tsx` and `help-link.tsx`
- ✅ Unit test coverage comprehensive in `platform-admob.spec.ts`
- ✅ Network/inventory/no-fill failures handled gracefully
- ⏳ Emulator runtime validation deferred to next session
