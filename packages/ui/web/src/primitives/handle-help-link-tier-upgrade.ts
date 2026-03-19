import { Capacitor } from "@capacitor/core";
import type { Tier } from "./tier.types";

export async function handleTierUpgrade(
  effectiveTier: Tier,
  currentTier: Tier,
  setTier: (tier: Tier) => void,
  checkPremiumAccess: () => boolean,
  activatePremiumAccess: () => void,
  setLoadingAd: (loading: boolean) => void,
  requestProfessionalAccess?: (
    activatePremiumAccess: () => void,
    setLoadingAd: (loading: boolean) => void,
  ) => Promise<boolean>,
): Promise<boolean> {
  const tierOrder: Tier[] = ["basic", "advanced", "professional"];
  const currentIndex = tierOrder.indexOf(currentTier);
  const requiredIndex = tierOrder.indexOf(effectiveTier);

  if (requiredIndex <= currentIndex) return true;

  if (effectiveTier === "professional" && Capacitor.isNativePlatform()) {
    if (!checkPremiumAccess()) {
      if (!requestProfessionalAccess) return false;
      const granted = await requestProfessionalAccess(activatePremiumAccess, setLoadingAd);
      if (!granted) return false;
    }
  }

  setTier(effectiveTier);
  return true;
}
