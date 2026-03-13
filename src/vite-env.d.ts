/// <reference types="vite/client" />

type ImportMetaEnv = {
  // Sentry release version for source map matching
  readonly VITE_SENTRY_RELEASE: string;
  // AdSense configuration
  readonly VITE_ADSENSE_ENABLED: string;
  // Show placeholder ads in production (for testing before AdSense approval)
  readonly VITE_ADSENSE_TEST_MODE: string;
  // Main app ads
  readonly VITE_ADSENSE_SLOT_LEFT_SKYSCRAPER: string;
  readonly VITE_ADSENSE_SLOT_RIGHT_SKYSCRAPER: string;
  readonly VITE_ADSENSE_SLOT_PREVIEW_MOBILE_TOP: string;
  readonly VITE_ADSENSE_SLOT_PREVIEW_MOBILE_BOTTOM: string;
  readonly VITE_ADSENSE_SLOT_SIDEBAR_BOTTOM: string;
  // Gallery page ads
  readonly VITE_ADSENSE_SLOT_GALLERY_LEFT: string;
  readonly VITE_ADSENSE_SLOT_GALLERY_RIGHT: string;
  readonly VITE_ADSENSE_SLOT_GALLERY_TOP: string;
  readonly VITE_ADSENSE_SLOT_GALLERY_BOTTOM: string;
  // Static page ads
  readonly VITE_ADSENSE_SLOT_STATIC_LEFT: string;
  readonly VITE_ADSENSE_SLOT_STATIC_RIGHT: string;
  readonly VITE_ADSENSE_SLOT_DOCS_TOP: string;
  readonly VITE_ADSENSE_SLOT_DOCS_BOTTOM: string;
  readonly VITE_ADSENSE_SLOT_ABOUT_TOP: string;
  readonly VITE_ADSENSE_SLOT_ABOUT_BOTTOM: string;
  readonly VITE_ADSENSE_SLOT_PRIVACY_TOP: string;
  readonly VITE_ADSENSE_SLOT_PRIVACY_BOTTOM: string;
  readonly VITE_ADSENSE_SLOT_TERMS_TOP: string;
  readonly VITE_ADSENSE_SLOT_TERMS_BOTTOM: string;
  readonly VITE_ADSENSE_SLOT_CONTACT_TOP: string;
  readonly VITE_ADSENSE_SLOT_CONTACT_BOTTOM: string;
  // Gallery section divider ads
  readonly VITE_ADSENSE_SLOT_GALLERY_AFTER_PLAIN: string;
  readonly VITE_ADSENSE_SLOT_GALLERY_AFTER_CONTENT_TYPES: string;
  readonly VITE_ADSENSE_SLOT_GALLERY_AFTER_STYLES: string;
  readonly VITE_ADSENSE_SLOT_GALLERY_AFTER_COLORS: string;
  readonly VITE_ADSENSE_SLOT_GALLERY_AFTER_IMAGE_OVERLAY: string;
  readonly VITE_ADSENSE_SLOT_GALLERY_AFTER_ANIMATION_OVERLAY: string;
  readonly VITE_ADSENSE_SLOT_GALLERY_AFTER_BLEND_MODES: string;
  readonly VITE_ADSENSE_SLOT_GALLERY_AFTER_COLOR_MODES: string;
  readonly VITE_ADSENSE_SLOT_GALLERY_AFTER_PREPROCESSING: string;
  readonly VITE_ADSENSE_SLOT_GALLERY_AFTER_ENCODING: string;
  readonly VITE_ADSENSE_SLOT_GALLERY_AFTER_DITHERING: string;
  readonly VITE_ADSENSE_SLOT_GALLERY_AFTER_POWER_COMBOS: string;
  readonly VITE_ADSENSE_SLOT_GALLERY_AFTER_QR_ART: string;
  // AdMob (Android/iOS)
  readonly VITE_ADMOB_BANNER_BOTTOM: string;
  readonly VITE_ADMOB_BANNER_TOP: string;
  readonly VITE_ADMOB_INTERSTITIAL_EXPORT: string;
  readonly VITE_ADMOB_INTERSTITIAL_GALLERY: string;
  readonly VITE_ADMOB_INTERSTITIAL_GENERATION: string;
  readonly VITE_ADMOB_REWARDED_PREMIUM: string;
  readonly VITE_ADMOB_REWARDED_EXPORT_HD: string;
  readonly VITE_ADMOB_TESTING: string;
};

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
