/**
 * Ad Unit
 *
 * Renders an AdSense <ins> tag when a valid ad slot ID is available.
 * Falls back to a lightweight placeholder during development, preview
 * builds, or when slot IDs have not been configured yet.
 */

import { Capacitor } from '@capacitor/core';
import { AdPlaceholder, AdSense } from '@/components/AdPlaceholder';

type SlotName =
  // Main app ads
  | 'left-skyscraper'
  | 'right-skyscraper'
  | 'sidebar-bottom'
  // Gallery page ads
  | 'gallery-top'
  | 'gallery-bottom'
  | 'gallery-left'
  | 'gallery-right'
  // Static page ads
  | 'static-left'
  | 'static-right'
  | 'guide-top'
  | 'guide-bottom'
  | 'learn-top'
  | 'learn-bottom'
  | 'examples-top'
  | 'examples-bottom'
  | 'about-top'
  | 'about-bottom'
  | 'privacy-top'
  | 'privacy-bottom'
  | 'terms-top'
  | 'terms-bottom'
  | 'contact-top'
  | 'contact-bottom'
  | 'translate-top'
  | 'translate-bottom'
  // Gallery section divider ads
  | 'gallery-after-plain'
  | 'gallery-after-content-types'
  | 'gallery-after-styles'
  | 'gallery-after-colors'
  | 'gallery-after-image-overlay'
  | 'gallery-after-animation-overlay'
  | 'gallery-after-blend-modes'
  | 'gallery-after-color-modes'
  | 'gallery-after-preprocessing'
  | 'gallery-after-encoding'
  | 'gallery-after-dithering'
  | 'gallery-after-power-combos';

/**
 * Optional environment-driven slot configuration.
 *
 * Set these in your hosting environment (Netlify/Vercel/etc) to enable
 * manual units. If you use AdSense Auto Ads, you can leave these empty.
 */
const SLOT_IDS: Partial<Record<SlotName, string>> = {
  // Main app ads
  'left-skyscraper': import.meta.env.VITE_ADSENSE_SLOT_LEFT_SKYSCRAPER,
  'right-skyscraper': import.meta.env.VITE_ADSENSE_SLOT_RIGHT_SKYSCRAPER,
  'sidebar-bottom': import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR_BOTTOM,
  // Gallery page ads
  'gallery-top':
    import.meta.env.VITE_ADSENSE_SLOT_GALLERY_TOP ||
    import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_PLAIN,
  'gallery-bottom':
    import.meta.env.VITE_ADSENSE_SLOT_GALLERY_BOTTOM ||
    import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_DITHERING,
  'gallery-left': import.meta.env.VITE_ADSENSE_SLOT_GALLERY_LEFT,
  'gallery-right': import.meta.env.VITE_ADSENSE_SLOT_GALLERY_RIGHT,
  // Static page ads
  'static-left': import.meta.env.VITE_ADSENSE_SLOT_STATIC_LEFT,
  'static-right': import.meta.env.VITE_ADSENSE_SLOT_STATIC_RIGHT,
  'guide-top': import.meta.env.VITE_ADSENSE_SLOT_GUIDE_TOP,
  'guide-bottom': import.meta.env.VITE_ADSENSE_SLOT_GUIDE_BOTTOM,
  'learn-top': import.meta.env.VITE_ADSENSE_SLOT_LEARN_TOP,
  'learn-bottom': import.meta.env.VITE_ADSENSE_SLOT_LEARN_BOTTOM,
  'examples-top': import.meta.env.VITE_ADSENSE_SLOT_EXAMPLES_TOP,
  'examples-bottom': import.meta.env.VITE_ADSENSE_SLOT_EXAMPLES_BOTTOM,
  'about-top': import.meta.env.VITE_ADSENSE_SLOT_ABOUT_TOP,
  'about-bottom': import.meta.env.VITE_ADSENSE_SLOT_ABOUT_BOTTOM,
  'privacy-top': import.meta.env.VITE_ADSENSE_SLOT_PRIVACY_TOP,
  'privacy-bottom': import.meta.env.VITE_ADSENSE_SLOT_PRIVACY_BOTTOM,
  'terms-top': import.meta.env.VITE_ADSENSE_SLOT_TERMS_TOP,
  'terms-bottom': import.meta.env.VITE_ADSENSE_SLOT_TERMS_BOTTOM,
  'contact-top': import.meta.env.VITE_ADSENSE_SLOT_CONTACT_TOP,
  'contact-bottom': import.meta.env.VITE_ADSENSE_SLOT_CONTACT_BOTTOM,
  'translate-top': import.meta.env.VITE_ADSENSE_SLOT_TRANSLATE_TOP,
  'translate-bottom': import.meta.env.VITE_ADSENSE_SLOT_TRANSLATE_BOTTOM,
  // Gallery section divider ads
  'gallery-after-plain': import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_PLAIN,
  'gallery-after-content-types': import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_CONTENT_TYPES,
  'gallery-after-styles': import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_STYLES,
  'gallery-after-colors': import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_COLORS,
  'gallery-after-image-overlay': import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_IMAGE_OVERLAY,
  'gallery-after-animation-overlay': import.meta.env
    .VITE_ADSENSE_SLOT_GALLERY_AFTER_ANIMATION_OVERLAY,
  'gallery-after-blend-modes': import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_BLEND_MODES,
  'gallery-after-color-modes': import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_COLOR_MODES,
  'gallery-after-preprocessing': import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_PREPROCESSING,
  'gallery-after-encoding': import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_ENCODING,
  'gallery-after-dithering': import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_DITHERING,
  'gallery-after-power-combos':
    import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_POWER_COMBOS ||
    import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_DITHERING,
};

function isNumericSlot(value: string | undefined | null): value is string {
  return !!value && /^\d+$/.test(value);
}

function resolveSlotId(slot: string): string | null {
  // Allow callers to pass numeric ad-unit IDs directly.
  if (isNumericSlot(slot)) return slot;

  // Otherwise, map known slot names to configured IDs.
  const mapped = SLOT_IDS[slot as SlotName];
  return isNumericSlot(mapped) ? mapped : null;
}

export interface AdUnitProps {
  slot: string;
  width?: number | string;
  height?: number;
  className?: string;
  format?: 'horizontal' | 'vertical' | 'rectangle' | 'auto';
  responsive?: boolean;
}

export function AdUnit({
  slot,
  width = '100%',
  height = 90,
  className = '',
  format = 'auto',
  responsive = true,
}: Readonly<AdUnitProps>) {
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
  const isTestMode = import.meta.env.VITE_ADSENSE_TEST_MODE === 'true';

  const enabled =
    import.meta.env.PROD &&
    import.meta.env.VITE_ADSENSE_ENABLED !== 'false' &&
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
  const w = typeof width === 'number' ? width : undefined;
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
}
