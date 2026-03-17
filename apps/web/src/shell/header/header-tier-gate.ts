import { Capacitor } from "@capacitor/core";
import type { Tier } from "@/lib/tier";
import { createLogger } from "@/infra/logging/logger";
import { trackEvent } from "@/infra/telemetry/zaraz";
import { prepareInterstitial, showInterstitial } from "@/modules/platform";

const log = createLogger("HEADER");

export async function changeTierWithAdGate(
  newTier: Tier,
  setTier: (t: Tier) => void,
  checkPremiumAccess: () => boolean,
  activatePremiumAccess: () => void,
  setLoadingAd: (v: boolean) => void,
): Promise<void> {
  if (newTier !== "professional" || !Capacitor.isNativePlatform()) {
    setTier(newTier);
    return;
  }
  if (checkPremiumAccess()) {
    setTier(newTier);
    return;
  }
  setLoadingAd(true);
  try {
    await prepareInterstitial("generation");
    await showInterstitial("generation");
    trackEvent("premium_interstitial_shown", { tier: "professional" });
    activatePremiumAccess();
    trackEvent("premium_activated", { tier: "professional", source: "interstitial" });
    setTier("professional");
    prepareInterstitial("generation");
  } catch (error) {
    log.error("Failed to show interstitial ad", { error });
    activatePremiumAccess();
    trackEvent("premium_activated", { tier: "professional", source: "fallback" });
    setTier("professional");
  } finally {
    setLoadingAd(false);
  }
}
