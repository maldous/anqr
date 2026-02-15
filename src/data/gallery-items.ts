/**
 * Gallery Items - Comprehensive feature showcase for ANQR
 *
 * Non-overlay sections (plain, content-types, styles, colors) are hand-crafted.
 * Overlay sections are built programmatically from scan-validated Tier A scenarios
 * (GALLERY_SCAN_SCENARIOS × CANONICAL_FIXTURES) to guarantee every gallery image
 * is proven scannable.
 */

import { Capacitor } from '@capacitor/core';
import {
  CANONICAL_FIXTURES,
  type CanonicalFixtureId,
  GALLERY_SCAN_SCENARIOS,
  type ScenarioFeatureGroup,
} from '@/data/gallery-scan-scenarios';

export type GalleryCategory =
  | 'plain'
  | 'content-types'
  | 'styles'
  | 'colors'
  | 'image-overlay'
  | 'animation-overlay'
  | 'blend-modes'
  | 'color-modes'
  | 'preprocessing'
  | 'encoding'
  | 'dithering'
  | 'power-combos';

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: GalleryCategory;
  params: Record<string, string | number | boolean>;
  isAnimated?: boolean;
}

export interface GallerySection {
  id: GalleryCategory;
  title: string;
  description: string;
  icon: string;
  items: GalleryItem[];
}

// Base URL for sample QR codes
const BASE_DATA = 'https://anqr.link';

// ============================================
// PLAIN QR CODES - No overlay (6 items)
// ============================================
const plainItems: GalleryItem[] = [
  {
    id: 'plain-basic',
    title: 'Classic',
    description: 'Standard QR code',
    category: 'plain',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 0,
      style: 'square',
      finder: 'square',
      fg: '000000',
      bg: 'ffffff',
    },
  },
  {
    id: 'plain-v6',
    title: 'Version 6',
    description: 'Larger without center eye',
    category: 'plain',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      style: 'square',
      finder: 'square',
      fg: '000000',
      bg: 'ffffff',
    },
  },
  {
    id: 'plain-v9',
    title: 'Version 9',
    description: 'Even larger with center eye',
    category: 'plain',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 9,
      style: 'square',
      finder: 'square',
      fg: '000000',
      bg: 'ffffff',
    },
  },
  {
    id: 'plain-v12',
    title: 'Version 12',
    description: 'Large with multiple alignment',
    category: 'plain',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 12,
      style: 'square',
      finder: 'square',
      fg: '000000',
      bg: 'ffffff',
    },
  },
  {
    id: 'plain-ecc-l',
    title: 'ECC Low (7%)',
    description: 'Minimal error correction',
    category: 'plain',
    params: {
      data: BASE_DATA,
      ec: 'L',
      v: 0,
      style: 'square',
      finder: 'square',
      fg: '000000',
      bg: 'ffffff',
    },
  },
  {
    id: 'plain-ecc-q',
    title: 'ECC Quartile (25%)',
    description: 'Medium-high error correction',
    category: 'plain',
    params: {
      data: BASE_DATA,
      ec: 'Q',
      v: 0,
      style: 'square',
      finder: 'square',
      fg: '000000',
      bg: 'ffffff',
    },
  },
];

// ============================================
// CONTENT TYPES - Different payload types (6 items)
// ============================================
const contentTypeItems: GalleryItem[] = [
  {
    id: 'content-vcard',
    title: 'vCard Contact',
    description: 'Contact card with rounded navy style',
    category: 'content-types',
    params: {
      data: 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nORG:ANQR\nEND:VCARD',
      ec: 'H',
      v: 0,
      style: 'rounded',
      finder: 'rounded',
      fg: '1a365d',
      bg: 'ebf8ff',
    },
  },
  {
    id: 'content-wifi',
    title: 'WiFi Network',
    description: 'WiFi config with dots forest green',
    category: 'content-types',
    params: {
      data: 'WIFI:T:WPA;S:MyNetwork;P:password123;;',
      ec: 'H',
      v: 0,
      style: 'dots',
      finder: 'circle',
      fg: '1b4332',
      bg: 'd8f3dc',
    },
  },
  {
    id: 'content-email',
    title: 'Email Address',
    description: 'Mailto link with coral colors',
    category: 'content-types',
    params: {
      data: 'mailto:hello@anqr.link?subject=Hello',
      ec: 'H',
      v: 0,
      style: 'square',
      finder: 'square',
      fg: 'e85d04',
      bg: 'ffe8d6',
    },
  },
  {
    id: 'content-sms',
    title: 'SMS Message',
    description: 'Pre-filled SMS with diamond teal',
    category: 'content-types',
    params: {
      data: 'sms:+1234567890?body=Hello%20from%20ANQR',
      ec: 'H',
      v: 0,
      style: 'diamond',
      finder: 'rounded',
      fg: '006d77',
      bg: 'e0f4f5',
    },
  },
  {
    id: 'content-geo',
    title: 'Geo Location',
    description: 'Map coords with connected gold',
    category: 'content-types',
    params: {
      data: 'geo:37.7749,-122.4194?q=San+Francisco',
      ec: 'H',
      v: 0,
      style: 'connected',
      finder: 'square',
      fg: '7f5539',
      bg: 'ffe8cc',
    },
  },
  {
    id: 'content-event',
    title: 'Calendar Event',
    description: 'iCal event with rounded royal',
    category: 'content-types',
    params: {
      data: 'BEGIN:VEVENT\nSUMMARY:Meeting\nDTSTART:20240101T100000\nEND:VEVENT',
      ec: 'H',
      v: 0,
      style: 'rounded',
      finder: 'circle',
      fg: '4a0080',
      bg: 'f5e6ff',
    },
  },
];

// ============================================
// MODULE & FINDER STYLES
// ============================================
const styleItems: GalleryItem[] = [];

// Module styles
const moduleStyles = ['square', 'rounded', 'dots', 'diamond', 'connected'];
const finderStyles = ['square', 'rounded', 'circle'];

for (const style of moduleStyles) {
  styleItems.push({
    id: `style-${style}`,
    title: `${style.charAt(0).toUpperCase() + style.slice(1)} Modules`,
    description: `${style} module style`,
    category: 'styles',
    params: { data: BASE_DATA, ec: 'H', v: 0, style, finder: 'square', fg: '000000', bg: 'ffffff' },
  });
}

for (const finder of finderStyles) {
  styleItems.push({
    id: `finder-${finder}`,
    title: `${finder.charAt(0).toUpperCase() + finder.slice(1)} Finders`,
    description: `${finder} finder pattern`,
    category: 'styles',
    params: { data: BASE_DATA, ec: 'H', v: 0, style: 'square', finder, fg: '000000', bg: 'ffffff' },
  });
}

// Style + finder combinations
const styleCombos = [
  { style: 'rounded', finder: 'rounded' },
  { style: 'dots', finder: 'circle' },
  { style: 'diamond', finder: 'rounded' },
  { style: 'connected', finder: 'square' },
];
for (const combo of styleCombos) {
  styleItems.push({
    id: `combo-${combo.style}-${combo.finder}`,
    title: `${combo.style.charAt(0).toUpperCase() + combo.style.slice(1)} + ${combo.finder.charAt(0).toUpperCase() + combo.finder.slice(1)}`,
    description: `${combo.style} modules with ${combo.finder} finders`,
    category: 'styles',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 0,
      style: combo.style,
      finder: combo.finder,
      fg: '000000',
      bg: 'ffffff',
    },
  });
}

// ============================================
// COLORS & GRADIENTS
// ============================================
const colorItems: GalleryItem[] = [];

const colorSchemes = [
  { name: 'Midnight', fg: '1a1a2e', bg: 'eef1ff' },
  { name: 'Forest', fg: '1b4332', bg: 'd8f3dc' },
  { name: 'Ocean', fg: '023e8a', bg: 'caf0f8' },
  { name: 'Sunset', fg: 'bf0603', bg: 'fff3b0' },
  { name: 'Royal', fg: '4a0080', bg: 'f5e6ff' },
  { name: 'Coral', fg: 'e85d04', bg: 'ffe8d6' },
  { name: 'Slate', fg: '343a40', bg: 'e9ecef' },
  { name: 'Crimson', fg: '9d0208', bg: 'ffccd5' },
  { name: 'Teal', fg: '006d77', bg: 'e0f4f5' },
  { name: 'Gold', fg: '7f5539', bg: 'ffe8cc' },
  { name: 'Inverted', fg: 'ffffff', bg: '000000' },
  { name: 'Navy', fg: '001d3d', bg: 'a2d2ff' },
];

for (const color of colorSchemes) {
  colorItems.push({
    id: `color-${color.name.toLowerCase()}`,
    title: color.name,
    description: `#${color.fg} on #${color.bg}`,
    category: 'colors',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 0,
      style: 'square',
      finder: 'square',
      fg: color.fg,
      bg: color.bg,
    },
  });
}

// Colors with styles (6 items to make 18 total)
for (const color of colorSchemes.slice(0, 6)) {
  colorItems.push({
    id: `color-${color.name.toLowerCase()}-dots`,
    title: `${color.name} Dots`,
    description: `${color.name} with dot modules`,
    category: 'colors',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 0,
      style: 'dots',
      finder: 'circle',
      fg: color.fg,
      bg: color.bg,
    },
  });
}

// ============================================
// SCAN-VALIDATED OVERLAY SECTIONS
// Built from GALLERY_SCAN_SCENARIOS × CANONICAL_FIXTURES
// Every image has passed Tier A scan validation
// ============================================

const FIXTURE_DISPLAY_NAMES: Record<CanonicalFixtureId, string> = {
  tsunami: 'Tsunami',
  king: 'King',
  logo: 'Logo',
  test: 'Test',
};

const FEATURE_GROUP_TO_CATEGORY: Record<ScenarioFeatureGroup, GalleryCategory> = {
  overlay: 'image-overlay',
  animation: 'animation-overlay',
  preservation: 'blend-modes',
  output: 'color-modes',
  encoding: 'encoding',
  render: 'power-combos',
  watermark: 'power-combos',
  preprocessing: 'preprocessing',
  dithering: 'dithering',
};

function buildValidatedItems(): GalleryItem[] {
  const items: GalleryItem[] = [];

  for (const scenario of GALLERY_SCAN_SCENARIOS) {
    if (!scenario.galleryEligible) continue;
    if (scenario.featureGroup === 'preprocessing' || scenario.featureGroup === 'dithering') continue;

    const category = FEATURE_GROUP_TO_CATEGORY[scenario.featureGroup];

    const fixturesToUse = scenario.useOverlay ? CANONICAL_FIXTURES : [CANONICAL_FIXTURES[0]];

    for (const fixture of fixturesToUse) {
      const params: Record<string, string | number | boolean> = {
        data: BASE_DATA,
        ...Object.fromEntries(
          Object.entries(scenario.galleryParams).filter(([, v]) => v !== undefined)
        ),
      };

      if (scenario.useOverlay) {
        params.img = fixture.publicPath;
      }

      items.push({
        id: scenario.useOverlay ? `${scenario.id}-${fixture.id}` : scenario.id,
        title: scenario.useOverlay
          ? `${scenario.title} — ${FIXTURE_DISPLAY_NAMES[fixture.id]}`
          : scenario.title,
        description: scenario.description,
        category,
        isAnimated: scenario.useOverlay ? fixture.isAnimated : false,
        params,
      });
    }
  }

  return items;
}

const validatedItems = buildValidatedItems();

const imageOverlayItems = validatedItems.filter((i) => i.category === 'image-overlay');
const animationOverlayItems = validatedItems.filter((i) => i.category === 'animation-overlay');
const blendModeItems = validatedItems.filter((i) => i.category === 'blend-modes');
const colorModeItems = validatedItems.filter((i) => i.category === 'color-modes');
const encodingItems = validatedItems.filter((i) => i.category === 'encoding');
const powerComboItems = validatedItems.filter((i) => i.category === 'power-combos');
// ============================================
// IMAGE PRE-PROCESSING - Hand-crafted HERO items (10 items)
// IDs match generate-gallery.mjs for image file alignment
// ============================================
const TSUNAMI_IMG = '/tsunami.jpg';

const preprocessingItems: GalleryItem[] = [
  { id: 'prep-brightness-p50', title: 'Brightness +50', description: 'Brightness-boosted overlay', category: 'preprocessing', params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100, brightness: 50 } },
  { id: 'prep-contrast-p100', title: 'High Contrast', description: 'Maximum contrast enhancement', category: 'preprocessing', params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100, contrast: 100 } },
  { id: 'prep-gamma-05', title: 'Gamma Darkened', description: 'Low gamma for dramatic shadows', category: 'preprocessing', params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100, gamma: 0.5 } },
  { id: 'prep-saturation-n100', title: 'Desaturated', description: 'Full desaturation effect', category: 'preprocessing', params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100, saturation: -100 } },
  { id: 'prep-saturation-p100', title: 'Full Vibrance', description: 'Maximum saturation boost', category: 'preprocessing', params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100, saturation: 100 } },
  { id: 'prep-blur-4', title: 'Soft Blur', description: 'Dreamy soft blur effect', category: 'preprocessing', params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100, blur: 4 } },
  { id: 'prep-sharpen-100', title: 'Sharpened Detail', description: 'Maximum sharpening for crisp detail', category: 'preprocessing', params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100, sharpen: 100 } },
  { id: 'prep-posterize-4', title: 'Posterized', description: 'Bold 4-level posterization', category: 'preprocessing', params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100, posterize: 4 } },
  { id: 'prep-edge-sobel', title: 'Sobel Edge Detection', description: 'Outline-style edge filter', category: 'preprocessing', params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100, edge: 'sobel' } },
  { id: 'prep-invert', title: 'Inverted', description: 'Negative/inverted overlay', category: 'preprocessing', params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100, invert: true } },
];

// ============================================
// DITHERING ALGORITHMS - Hand-crafted HERO items (10 items)
// IDs match generate-gallery.mjs for image file alignment
// ============================================
const ditheringItems: GalleryItem[] = [
  { id: 'dither-error-diffusion', title: 'Error Diffusion', description: 'Classic error diffusion dithering', category: 'dithering', params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100, ditherKind: 'error_diffusion' } },
  { id: 'dither-ordered-bayer', title: 'Ordered Bayer', description: 'Bayer matrix dithering pattern', category: 'dithering', params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100, ditherKind: 'ordered_bayer' } },
  { id: 'dither-blue-noise', title: 'Blue Noise', description: 'Smooth blue noise threshold', category: 'dithering', params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100, ditherKind: 'blue_noise' } },
  { id: 'dither-perceptual', title: 'Perceptual', description: 'Perceptually-weighted adaptive dithering', category: 'dithering', params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100, ditherKind: 'perceptual' } },
  { id: 'dither-adaptive-threshold', title: 'Adaptive Threshold', description: 'Locally adaptive threshold dithering', category: 'dithering', params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100, ditherKind: 'adaptive_threshold' } },
  { id: 'dither-kernel-floyd-steinberg', title: 'Floyd-Steinberg', description: 'Classic Floyd-Steinberg diffusion kernel', category: 'dithering', params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100, ditherKind: 'error_diffusion', diffusionKernel: 'floyd_steinberg' } },
  { id: 'dither-kernel-atkinson', title: 'Atkinson', description: 'Classic Macintosh Atkinson kernel', category: 'dithering', params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100, ditherKind: 'error_diffusion', diffusionKernel: 'atkinson' } },
  { id: 'dither-kernel-stucki', title: 'Stucki', description: 'High-quality Stucki diffusion kernel', category: 'dithering', params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100, ditherKind: 'error_diffusion', diffusionKernel: 'stucki' } },
  { id: 'dither-strength-20', title: 'Subtle Dither (20%)', description: 'Light dithering at 20% strength', category: 'dithering', params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100, ditherStrength: 20 } },
  { id: 'dither-strength-100', title: 'Full Dither (100%)', description: 'Maximum dithering strength', category: 'dithering', params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100, ditherStrength: 100 } },
];

// ============================================
// ALL GALLERY SECTIONS
// ============================================
export const gallerySections: GallerySection[] = [
  {
    id: 'plain',
    title: 'Plain QR Codes',
    description: 'Standard QR codes without overlay - different versions and error correction',
    icon: 'QrCode',
    items: plainItems,
  },
  {
    id: 'content-types',
    title: 'Content Types',
    description: 'Different payload formats - vCard, WiFi, Email, SMS, Geo, Calendar',
    icon: 'FileText',
    items: contentTypeItems,
  },
  {
    id: 'styles',
    title: 'Module & Finder Styles',
    description: 'Different visual styles for modules and finder patterns',
    icon: 'Shapes',
    items: styleItems,
  },
  {
    id: 'colors',
    title: 'Colors & Themes',
    description: 'Color schemes and themed palettes',
    icon: 'Palette',
    items: colorItems,
  },
  {
    id: 'image-overlay',
    title: 'Image Overlays',
    description: 'Scan-validated image overlays across all fixture images',
    icon: 'Image',
    items: imageOverlayItems,
  },
  {
    id: 'animation-overlay',
    title: 'Animated Overlays',
    description: 'Scan-validated animated overlays across all fixture images',
    icon: 'Film',
    items: animationOverlayItems,
  },
  {
    id: 'blend-modes',
    title: 'Preservation Modes',
    description: 'Scan-validated functional module preservation strategies',
    icon: 'Layers',
    items: blendModeItems,
  },
  {
    id: 'color-modes',
    title: 'Output Modes',
    description: 'Scan-validated output rendering modes',
    icon: 'Contrast',
    items: colorModeItems,
  },
  {
    id: 'encoding',
    title: 'QR Encoding',
    description: 'Scan-validated QR versions and error correction levels',
    icon: 'Settings2',
    items: encodingItems,
  },
  {
    id: 'preprocessing',
    title: 'Image Pre-Processing',
    description: 'Brightness, contrast, gamma, sharpen, posterize, and edge detection filters',
    icon: 'Sliders',
    items: preprocessingItems,
  },
  {
    id: 'dithering',
    title: 'Dithering Algorithms',
    description: 'Different dithering algorithms and diffusion kernels for overlay rendering',
    icon: 'Grid3x3',
    items: ditheringItems,
  },
  {
    id: 'power-combos',
    title: 'Power Combos',
    description: 'Scan-validated render styles, frames, and watermark combinations',
    icon: 'Sparkles',
    items: powerComboItems,
  },
];

// ============================================
// URL HELPERS
// ============================================

export function getGalleryBaseUrl(): string {
  // Always use the live URL for gallery links
  return 'https://anqr.link';
}
export const GALLERY_IMAGE_PATH = '/gallery';

export function buildGalleryUrl(item: GalleryItem): string {
  const baseUrl = getGalleryBaseUrl();
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(item.params)) {
    if (value !== undefined && value !== null) {
      if ((key === 'fg' || key === 'bg') && typeof value === 'string') {
        params.set(key, value.replace('#', ''));
      } else if (key === 'img' && typeof value === 'string' && value.startsWith('/')) {
        // Convert relative image paths to absolute URLs
        params.set(key, `${baseUrl}${value}`);
      } else {
        params.set(key, String(value));
      }
    }
  }

  return `${baseUrl}?${params.toString()}`;
}

export function getGalleryImagePath(item: GalleryItem): string {
  // Animated items are saved as GIF, static items as PNG
  const ext = item.isAnimated ? 'gif' : 'png';
  const relativePath = `${GALLERY_IMAGE_PATH}/${item.id}.${ext}`;

  // On native apps (Android/iOS), load gallery images from the web
  // since we don't bundle them locally to reduce APK size
  if (Capacitor.isNativePlatform()) {
    return `https://anqr.link${relativePath}`;
  }

  // On web, use relative path (works on anqr.link)
  return relativePath;
}
