import { describe, it, expect, beforeEach, vi } from "vitest";
import { getToastDurationMs } from "./notifications/get-toast-duration-ms";
import { interstitialPrepareKey } from "./ads/interstitial-prepare-key";
import { rewardedPrepareKey } from "./ads/rewarded-prepare-key";
import { generationCountState } from "./ads/generation-count-state";
import { getGenerationCount } from "./ads/get-generation-count";
import { resetGenerationCount } from "./ads/reset-generation-count";
import { currentBannerHeight } from "./ads/current-banner-height";
import { getBannerHeight } from "./ads/get-banner-height";
import { updateBannerHeight } from "./ads/update-banner-height";
import { bannerHeightCallbacks } from "./ads/banner-height-callbacks";
import { currentBannerPosition } from "./ads/current-banner-position-state";
import { getCurrentBannerPosition } from "./ads/get-current-banner-position";
import { setCurrentBannerPosition } from "./ads/set-current-banner-position";
import { onBannerHeightChange } from "./ads/on-banner-height-change";
import { isAdMobAvailable } from "./ads/is-admob-available";
import { isRewardedAdReady } from "./ads/rewarded-ad-ready";
import { admobRuntime } from "./ads/admob-runtime-state";
import { TEST_AD_UNIT_IDS } from "./ads/test-ad-unit-ids";

describe("platform/native", () => {
  beforeEach(() => {
    generationCountState.value = 0;
    currentBannerHeight.value = 0;
    bannerHeightCallbacks.value = [];
    currentBannerPosition.value = null;
    admobRuntime.available = false;
    admobRuntime.initialized = false;
    admobRuntime.preparedRewardedKeys = new Set();
    admobRuntime.preparedInterstitialKeys = new Set();
  });

  // ── Notifications: getToastDurationMs ──────────────────────────

  describe("getToastDurationMs", () => {
    it("returns 1800 for short duration", () => {
      expect(getToastDurationMs("short")).toBe(1800);
    });

    it("returns 3200 for long duration", () => {
      expect(getToastDurationMs("long")).toBe(3200);
    });
  });

  // ── Ads: interstitialPrepareKey ────────────────────────────────

  describe("interstitialPrepareKey", () => {
    it("returns prefixed key for interstitial", () => {
      expect(interstitialPrepareKey("interstitial")).toBe("interstitial:interstitial");
    });

    it("returns bare key for rewardedInterstitial", () => {
      expect(interstitialPrepareKey("rewardedInterstitial")).toBe("rewardedInterstitial");
    });

    it("returns prefixed key for gallery", () => {
      expect(interstitialPrepareKey("gallery")).toBe("interstitial:gallery");
    });

    it("returns prefixed key for export", () => {
      expect(interstitialPrepareKey("export")).toBe("interstitial:export");
    });

    it("returns prefixed key for generation", () => {
      expect(interstitialPrepareKey("generation")).toBe("interstitial:generation");
    });
  });

  // ── Ads: rewardedPrepareKey ────────────────────────────────────

  describe("rewardedPrepareKey", () => {
    it("returns prefixed key for rewarded", () => {
      expect(rewardedPrepareKey("rewarded")).toBe("rewarded:rewarded");
    });

    it("returns bare key for rewardedInterstitial", () => {
      expect(rewardedPrepareKey("rewardedInterstitial")).toBe("rewardedInterstitial");
    });

    it("returns prefixed key for premium", () => {
      expect(rewardedPrepareKey("premium")).toBe("rewarded:premium");
    });
  });

  // ── Ads: generation count ──────────────────────────────────────

  describe("generationCount", () => {
    it("starts at 0", () => {
      expect(getGenerationCount()).toBe(0);
    });

    it("reflects direct state changes", () => {
      generationCountState.value = 5;
      expect(getGenerationCount()).toBe(5);
    });

    it("resets to 0", () => {
      generationCountState.value = 10;
      resetGenerationCount();
      expect(getGenerationCount()).toBe(0);
    });

    it("state object is shared with getter", () => {
      generationCountState.value = 42;
      expect(getGenerationCount()).toBe(42);
      resetGenerationCount();
      expect(generationCountState.value).toBe(0);
    });
  });

  // ── Ads: banner height ─────────────────────────────────────────

  describe("bannerHeight", () => {
    it("starts at 0", () => {
      expect(getBannerHeight()).toBe(0);
    });

    it("reflects updated value", () => {
      updateBannerHeight(56);
      expect(getBannerHeight()).toBe(56);
    });

    it("calls registered callbacks on update", () => {
      const cb = vi.fn();
      bannerHeightCallbacks.value.push(cb);
      updateBannerHeight(90);
      expect(cb).toHaveBeenCalledWith(90);
    });

    it("calls multiple callbacks", () => {
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      bannerHeightCallbacks.value.push(cb1, cb2);
      updateBannerHeight(44);
      expect(cb1).toHaveBeenCalledWith(44);
      expect(cb2).toHaveBeenCalledWith(44);
    });
  });

  // ── Ads: banner position ───────────────────────────────────────

  describe("bannerPosition", () => {
    it("starts as null", () => {
      expect(getCurrentBannerPosition()).toBeNull();
    });

    it("sets a position value", () => {
      const pos = "top" as Parameters<typeof setCurrentBannerPosition>[0];
      setCurrentBannerPosition(pos);
      expect(getCurrentBannerPosition()).toBe(pos);
    });

    it("can clear back to null", () => {
      const pos = "bottom" as Parameters<typeof setCurrentBannerPosition>[0];
      setCurrentBannerPosition(pos);
      setCurrentBannerPosition(null as Parameters<typeof setCurrentBannerPosition>[0]);
      expect(getCurrentBannerPosition()).toBeNull();
    });

    it("state is shared between getter and setter", () => {
      const pos = "top" as Parameters<typeof setCurrentBannerPosition>[0];
      setCurrentBannerPosition(pos);
      expect(currentBannerPosition.value).toBe(pos);
    });
  });

  // ── Ads: onBannerHeightChange ──────────────────────────────────

  describe("onBannerHeightChange", () => {
    it("registers callback", () => {
      const cb = vi.fn();
      onBannerHeightChange(cb);
      expect(bannerHeightCallbacks.value).toContain(cb);
    });

    it("does not fire when height is zero", () => {
      const cb = vi.fn();
      onBannerHeightChange(cb);
      expect(cb).not.toHaveBeenCalled();
    });

    it("fires immediately when height is positive", () => {
      currentBannerHeight.value = 50;
      const cb = vi.fn();
      onBannerHeightChange(cb);
      expect(cb).toHaveBeenCalledWith(50);
    });

    it("returns unsubscribe function", () => {
      const cb = vi.fn();
      const unsubscribe = onBannerHeightChange(cb);
      expect(typeof unsubscribe).toBe("function");
      unsubscribe();
      expect(bannerHeightCallbacks.value).not.toContain(cb);
    });

    it("unsubscribed callback does not receive updates", () => {
      const cb = vi.fn();
      const unsubscribe = onBannerHeightChange(cb);
      unsubscribe();
      updateBannerHeight(200);
      expect(cb).not.toHaveBeenCalled();
    });

    it("receives subsequent height updates", () => {
      const cb = vi.fn();
      onBannerHeightChange(cb);
      updateBannerHeight(100);
      updateBannerHeight(120);
      expect(cb).toHaveBeenCalledTimes(2);
      expect(cb).toHaveBeenLastCalledWith(120);
    });
  });

  // ── Ads: isAdMobAvailable ──────────────────────────────────────

  describe("isAdMobAvailable", () => {
    it("returns false by default", () => {
      expect(isAdMobAvailable()).toBe(false);
    });

    it("returns true when runtime is available", () => {
      admobRuntime.available = true;
      expect(isAdMobAvailable()).toBe(true);
    });
  });

  // ── Ads: isRewardedAdReady ─────────────────────────────────────

  describe("isRewardedAdReady", () => {
    it("returns false by default", () => {
      expect(isRewardedAdReady()).toBe(false);
    });

    it("returns false when available but no prepared keys", () => {
      admobRuntime.available = true;
      expect(isRewardedAdReady()).toBe(false);
    });

    it("returns true when available and has prepared keys", () => {
      admobRuntime.available = true;
      admobRuntime.preparedRewardedKeys.add("rewarded:premium");
      expect(isRewardedAdReady()).toBe(true);
    });
  });

  // ── Ads: TEST_AD_UNIT_IDS ──────────────────────────────────────

  describe("TEST_AD_UNIT_IDS", () => {
    it("has all four ad types", () => {
      expect(TEST_AD_UNIT_IDS).toHaveProperty("banner");
      expect(TEST_AD_UNIT_IDS).toHaveProperty("interstitial");
      expect(TEST_AD_UNIT_IDS).toHaveProperty("rewarded");
      expect(TEST_AD_UNIT_IDS).toHaveProperty("rewardedInterstitial");
    });

    it("all values are Google test ad unit IDs", () => {
      for (const value of Object.values(TEST_AD_UNIT_IDS)) {
        expect(value).toMatch(/^ca-app-pub-/);
      }
    });
  });

  // ── Ads: admobRuntime ──────────────────────────────────────────

  describe("admobRuntime", () => {
    it("starts with available=false and initialized=false", () => {
      expect(admobRuntime.available).toBe(false);
      expect(admobRuntime.initialized).toBe(false);
    });

    it("starts with null plugin references", () => {
      expect(admobRuntime.AdMob).toBeNull();
      expect(admobRuntime.BannerAdSize).toBeNull();
      expect(admobRuntime.BannerAdPosition).toBeNull();
    });

    it("starts with empty prepared key sets", () => {
      expect(admobRuntime.preparedInterstitialKeys.size).toBe(0);
      expect(admobRuntime.preparedRewardedKeys.size).toBe(0);
    });

    it("prepared key sets are mutable", () => {
      admobRuntime.preparedInterstitialKeys.add("interstitial:gallery");
      admobRuntime.preparedRewardedKeys.add("rewarded:premium");
      expect(admobRuntime.preparedInterstitialKeys.has("interstitial:gallery")).toBe(true);
      expect(admobRuntime.preparedRewardedKeys.has("rewarded:premium")).toBe(true);
    });
  });
});
