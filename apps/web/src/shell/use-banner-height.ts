import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";
import { onBannerHeightChange } from "@/platform/native";

export function useBannerHeight(): number {
  const [bannerHeight, setBannerHeight] = useState(0);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    setBannerHeight(60);
    const unsubscribe = onBannerHeightChange((height: number) => {
      setBannerHeight(height);
    });
    return unsubscribe;
  }, []);

  return bannerHeight;
}
