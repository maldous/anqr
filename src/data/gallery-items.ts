/**
 * Gallery Items - Hero showcase for ANQR
 *
 * Non-overlay sections (plain, content-types, styles, colors) are hand-crafted.
 * Image overlay section shows ONE fixture per scenario for maximum visual variety.
 * Animated overlay section uses king.gif exclusively across blend modes.
 * Other overlay-based sections use all fixtures for comprehensive coverage.
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
  | 'encoding'
  | 'power-combos'
  | 'qr-art';

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
  trump: 'Trump',
  dance: 'Dance',
};

const FEATURE_GROUP_TO_CATEGORY: Partial<Record<ScenarioFeatureGroup, GalleryCategory>> = {
  overlay: 'image-overlay',
  animation: 'animation-overlay',
  preservation: 'blend-modes',
  output: 'color-modes',
  encoding: 'encoding',
  render: 'power-combos',
  watermark: 'power-combos',
  'qr-art': 'qr-art',
};

const KING_FIXTURE = CANONICAL_FIXTURES.find((f) => f.id === 'king')!;
const DANCE_FIXTURE = CANONICAL_FIXTURES.find((f) => f.id === 'dance')!;
const ANIMATED_FIXTURES = [KING_FIXTURE, DANCE_FIXTURE];

const IMAGE_OVERLAY_FIXTURE: Record<string, CanonicalFixtureId> = {
  'overlay-dithered': 'tsunami',
  'overlay-blue-noise': 'logo',
  'overlay-subpixel': 'test',
  'overlay-halftone': 'tsunami',
  'overlay-mosaic': 'logo',
  'overlay-extreme': 'tsunami',
  'overlay-duotone': 'tsunami',
  'overlay-pixelate': 'logo',
  'overlay-blend': 'tsunami',
  'overlay-dithered-bayer': 'logo',
  'overlay-dithered-atkinson': 'test',
  'overlay-halftone-dots': 'tsunami',
  'overlay-blend-rounded': 'logo',
  'overlay-duotone-sunset': 'tsunami',
  'overlay-duotone-ocean': 'logo',
  'overlay-duotone-neon': 'test',
  'overlay-mosaic-diamond': 'tsunami',
  'overlay-dithered-posterized': 'logo',
  'overlay-pixelate-grayscale': 'test',
  'overlay-extreme-edges': 'tsunami',
  'overlay-center': 'trump',
  'overlay-halftone-dithered': 'trump',
  'overlay-gapfill': 'dance',
  'overlay-brightness-mode': 'trump',
  'overlay-outline': 'dance',
  'overlay-wave': 'trump',
  'overlay-subpixel-size': 'dance',
  'overlay-true-dither': 'trump',
};

function buildScenarioParams(
  scenario: (typeof GALLERY_SCAN_SCENARIOS)[number],
  fixture?: (typeof CANONICAL_FIXTURES)[number]
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {
    data: BASE_DATA,
    ...Object.fromEntries(
      Object.entries(scenario.galleryParams).filter(([, v]) => v !== undefined)
    ),
  };
  if (fixture) {
    params.img = fixture.publicPath;
  }
  return params;
}

function buildValidatedItems(): GalleryItem[] {
  const items: GalleryItem[] = [];

  for (const scenario of GALLERY_SCAN_SCENARIOS) {
    if (!scenario.galleryEligible) continue;
    if (scenario.featureGroup === 'preprocessing' || scenario.featureGroup === 'dithering')
      continue;

    const category = FEATURE_GROUP_TO_CATEGORY[scenario.featureGroup];
    if (!category) continue;

    // Image overlays: one fixture per scenario for maximum visual variety
    if (category === 'image-overlay') {
      const fixtureId = IMAGE_OVERLAY_FIXTURE[scenario.id];
      if (!fixtureId) continue;
      const fixture = CANONICAL_FIXTURES.find((f) => f.id === fixtureId)!;
      items.push({
        id: `${scenario.id}-${fixtureId}`,
        title: `${scenario.title} — ${FIXTURE_DISPLAY_NAMES[fixtureId]}`,
        description: scenario.description,
        category,
        isAnimated: fixture.isAnimated,
        params: buildScenarioParams(scenario, fixture),
      });
      continue;
    }

    // Animated overlays: king.gif and dance.gif
    if (category === 'animation-overlay') {
      const displayTitle = scenario.title.replace(/^Animation\s+/i, '');
      for (const fixture of ANIMATED_FIXTURES) {
        items.push({
          id: `${scenario.id}-${fixture.id}`,
          title: `${displayTitle} — ${FIXTURE_DISPLAY_NAMES[fixture.id]}`,
          description: scenario.description,
          category,
          isAnimated: true,
          params: buildScenarioParams(scenario, fixture),
        });
      }
      continue;
    }

    // Non-overlay scenarios: single item
    if (!scenario.useOverlay) {
      items.push({
        id: scenario.id,
        title: scenario.title,
        description: scenario.description,
        category,
        params: buildScenarioParams(scenario),
      });
      continue;
    }

    // QR Art: trump and dance fixtures only
    if (category === 'qr-art') {
      const qrartFixtures = CANONICAL_FIXTURES.filter((f) => f.id === 'trump' || f.id === 'dance');
      for (const fixture of qrartFixtures) {
        items.push({
          id: `${scenario.id}-${fixture.id}`,
          title: `${scenario.title} — ${FIXTURE_DISPLAY_NAMES[fixture.id]}`,
          description: scenario.description,
          category,
          isAnimated: fixture.isAnimated,
          params: buildScenarioParams(scenario, fixture),
        });
      }
      continue;
    }

    // Other overlay categories (preservation, encoding, etc.): all fixtures
    for (const fixture of CANONICAL_FIXTURES) {
      items.push({
        id: `${scenario.id}-${fixture.id}`,
        title: `${scenario.title} — ${FIXTURE_DISPLAY_NAMES[fixture.id]}`,
        description: scenario.description,
        category,
        isAnimated: fixture.isAnimated,
        params: buildScenarioParams(scenario, fixture),
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
const qrArtItems = validatedItems.filter((i) => i.category === 'qr-art');

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
    description: 'Every overlay mode, dither algorithm, color treatment, and filter effect',
    icon: 'Image',
    items: imageOverlayItems,
  },
  {
    id: 'animation-overlay',
    title: 'Animated Overlays',
    description:
      'Animated overlays with king.gif and dance.gif in color, grayscale, B&W, and duotone',
    icon: 'Film',
    items: animationOverlayItems,
  },
  {
    id: 'blend-modes',
    title: 'Preservation Modes',
    description: 'Functional module preservation strategies',
    icon: 'Layers',
    items: blendModeItems,
  },
  {
    id: 'color-modes',
    title: 'Output Modes',
    description: 'Output rendering modes and color treatments',
    icon: 'Contrast',
    items: colorModeItems,
  },
  {
    id: 'encoding',
    title: 'QR Encoding',
    description: 'QR versions and error correction levels with overlays',
    icon: 'Settings2',
    items: encodingItems,
  },
  {
    id: 'power-combos',
    title: 'Power Combos',
    description: 'Render styles, frames, and watermark combinations',
    icon: 'Sparkles',
    items: powerComboItems,
  },
  {
    id: 'qr-art',
    title: 'QR Art',
    description: 'Artistic QR codes using Reed-Solomon data shaping to embed images',
    icon: 'Paintbrush',
    items: qrArtItems,
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
