/**
 * Ad Unit
 *
 * Renders an AdSense <ins> tag when a valid ad slot ID is available.
 * Falls back to a lightweight placeholder during development, preview
 * builds, or when slot IDs have not been configured yet.
 */

import { Capacitor } from "@capacitor/core";
import { AdPlaceholder, AdSense } from "./AdPlaceholder";
import { resolveSlotId } from "./ad-slot-resolver";

export type { AdUnitProps } from "./AdUnit.types";
import type { AdUnitProps } from "./AdUnit.types";

export const AdUnit = ({
  slot,
  width = "100%",
  height = 90,
  className = "",
  format = "auto",
  responsive = true,
}: Readonly<AdUnitProps>) => {
  const slotId = resolveSlotId(slot);

  // Check if running in native app (Android/iOS via Capacitor)
  // AdSense doesn't work in native WebViews - AdMob handles ads there instead
  const isNative = Capacitor.isNativePlatform();

  // On native platforms, don't render inline web ads at all
  // AdMob banner ads are shown separately via admob-service.ts
  if (isNative) {
    return null;
  }

  // Test mode: show placeholders in production before AdSense approval
  const isTestMode = import.meta.env.VITE_ADSENSE_TEST_MODE === "true";

  const enabled =
    import.meta.env.PROD &&
    import.meta.env.VITE_ADSENSE_ENABLED !== "false" &&
    !!slotId &&
    !isTestMode;

  // Show placeholder in development, test mode, or when slot not configured (web only)
  if (!enabled) {
    return (
      <AdPlaceholder
        slot={slot}
        width={width}
        height={height}
        className={className}
        format={format}
      />
    );
  }

  // When rendering a fixed-size unit, pass width/height via inline style.
  const w = typeof width === "number" ? width : undefined;
  return (
    <AdSense
      slot={slotId}
      format={format}
      responsive={responsive}
      className={className}
      width={w}
      height={height}
    />
  );
};
