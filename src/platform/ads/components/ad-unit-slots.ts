import type { SlotName } from "./ad-slot-name";

export const SLOT_IDS: Partial<Record<SlotName, string>> = {
  "left-skyscraper": import.meta.env.VITE_ADSENSE_SLOT_LEFT_SKYSCRAPER,
  "right-skyscraper": import.meta.env.VITE_ADSENSE_SLOT_RIGHT_SKYSCRAPER,
  "sidebar-bottom": import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR_BOTTOM,
  "gallery-top":
    import.meta.env.VITE_ADSENSE_SLOT_GALLERY_TOP ||
    import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_PLAIN,
  "gallery-bottom":
    import.meta.env.VITE_ADSENSE_SLOT_GALLERY_BOTTOM ||
    import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_DITHERING,
  "gallery-left": import.meta.env.VITE_ADSENSE_SLOT_GALLERY_LEFT,
  "gallery-right": import.meta.env.VITE_ADSENSE_SLOT_GALLERY_RIGHT,
  "static-left": import.meta.env.VITE_ADSENSE_SLOT_STATIC_LEFT,
  "static-right": import.meta.env.VITE_ADSENSE_SLOT_STATIC_RIGHT,
  "guide-top": import.meta.env.VITE_ADSENSE_SLOT_GUIDE_TOP,
  "guide-bottom": import.meta.env.VITE_ADSENSE_SLOT_GUIDE_BOTTOM,
  "learn-top": import.meta.env.VITE_ADSENSE_SLOT_LEARN_TOP,
  "learn-bottom": import.meta.env.VITE_ADSENSE_SLOT_LEARN_BOTTOM,
  "examples-top": import.meta.env.VITE_ADSENSE_SLOT_EXAMPLES_TOP,
  "examples-bottom": import.meta.env.VITE_ADSENSE_SLOT_EXAMPLES_BOTTOM,
  "about-top": import.meta.env.VITE_ADSENSE_SLOT_ABOUT_TOP,
  "about-bottom": import.meta.env.VITE_ADSENSE_SLOT_ABOUT_BOTTOM,
  "privacy-top": import.meta.env.VITE_ADSENSE_SLOT_PRIVACY_TOP,
  "privacy-bottom": import.meta.env.VITE_ADSENSE_SLOT_PRIVACY_BOTTOM,
  "terms-top": import.meta.env.VITE_ADSENSE_SLOT_TERMS_TOP,
  "terms-bottom": import.meta.env.VITE_ADSENSE_SLOT_TERMS_BOTTOM,
  "contact-top": import.meta.env.VITE_ADSENSE_SLOT_CONTACT_TOP,
  "contact-bottom": import.meta.env.VITE_ADSENSE_SLOT_CONTACT_BOTTOM,
  "translate-top": import.meta.env.VITE_ADSENSE_SLOT_TRANSLATE_TOP,
  "translate-bottom": import.meta.env.VITE_ADSENSE_SLOT_TRANSLATE_BOTTOM,
  "gallery-after-plain": import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_PLAIN,
  "gallery-after-content-types": import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_CONTENT_TYPES,
  "gallery-after-styles": import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_STYLES,
  "gallery-after-colors": import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_COLORS,
  "gallery-after-image-overlay": import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_IMAGE_OVERLAY,
  "gallery-after-animation-overlay": import.meta.env
    .VITE_ADSENSE_SLOT_GALLERY_AFTER_ANIMATION_OVERLAY,
  "gallery-after-blend-modes": import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_BLEND_MODES,
  "gallery-after-color-modes": import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_COLOR_MODES,
  "gallery-after-preprocessing": import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_PREPROCESSING,
  "gallery-after-encoding": import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_ENCODING,
  "gallery-after-dithering": import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_DITHERING,
  "gallery-after-power-combos":
    import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_POWER_COMBOS ||
    import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_DITHERING,
  "gallery-after-qr-art":
    import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_QR_ART ||
    import.meta.env.VITE_ADSENSE_SLOT_GALLERY_AFTER_POWER_COMBOS,
};
