import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";
import { onBannerHeightChange } from "../../../../platform/native/src";

/**
 * Hook to track AdMob banner height for layout purposes.
 * Returns 0 on web platforms.
 */
export function useBannerHeight(): number {
  const [bannerHeight, setBannerHeight] = useState(0);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Set initial estimate for adaptive banner (~50-60px on most devices)
      setBannerHeight(60);
      const unsubscribe = onBannerHeightChange((height: number) => {
        setBannerHeight(height);
      });
      return unsubscribe;
    }
  }, []);

  return bannerHeight;
}
