/**
 * Gallery Items - Comprehensive feature showcase for ANQR
 *
 * Organized by feature category to help users understand visual differences:
 * - Plain QR: No overlay, different styles/colors/ECC
 * - Image Overlays: tsunami.jpg with different modes
 * - Animated Overlays: king.gif with different modes
 * - Blend Modes: Different overlay blend modes
 * - Color Modes: color, grayscale, bw
 * - Preprocessing: brightness, contrast, gamma, etc.
 * - QR Encoding: versions and ECC levels
 * - Dithering: Different dither algorithms
 * - Module Styles: square, rounded, dots, diamond
 * - Finder Styles: square, rounded, circle
 */

import { Capacitor } from '@capacitor/core';
import { buildScanShowcaseSeeds } from '@/data/gallery-scan-scenarios';

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
  | 'power-combos'
  | 'validated-showcase';

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

// Image URLs (will be replaced with absolute URLs during generation)
const TSUNAMI_IMG = '/tsunami.jpg';
const KING_GIF = '/king.gif';

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
// IMAGE OVERLAYS - tsunami.jpg
// ============================================
const imageOverlayItems: GalleryItem[] = [];

// Different overlay modes
const overlayModes = [
  { mode: 'dithered', name: 'Dithered', desc: 'Error diffusion dithering' },
  { mode: 'blue-noise', name: 'Blue Noise', desc: 'Blue noise threshold dithering' },
  { mode: 'halftone', name: 'Halftone', desc: 'Classic halftone dots' },
  { mode: 'mosaic', name: 'Mosaic', desc: 'Mosaic tile effect' },
  { mode: 'brightness', name: 'Brightness', desc: 'Brightness-based modules' },
  { mode: 'duotone', name: 'Duotone', desc: 'Two-tone color mapping' },
  { mode: 'subpixel', name: 'Subpixel', desc: 'High detail subpixel rendering' },
  { mode: 'pixelate', name: 'Pixelate', desc: 'Pixelated overlay effect' },
  { mode: 'outline', name: 'Outline', desc: 'Edge detection overlay' },
  { mode: 'wave', name: 'Wave', desc: 'Wavy distortion effect' },
  { mode: 'extreme', name: 'Extreme', desc: 'Maximum image visibility' },
];

for (const overlay of overlayModes) {
  imageOverlayItems.push({
    id: `img-${overlay.mode}`,
    title: overlay.name,
    description: overlay.desc,
    category: 'image-overlay',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: overlay.mode,
      img: TSUNAMI_IMG,
      intensity: 100,
    },
  });
}

// Different intensities
const intensities = [50, 75, 100];
for (const intensity of intensities) {
  imageOverlayItems.push({
    id: `img-dithered-i${intensity}`,
    title: `Dithered ${intensity}%`,
    description: `Dithered at ${intensity}% intensity`,
    category: 'image-overlay',
    params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'dithered', img: TSUNAMI_IMG, intensity },
  });
}

// Color modes for image
const colorModes = ['color', 'grayscale', 'bw'];
for (const cm of colorModes) {
  imageOverlayItems.push({
    id: `img-colormode-${cm}`,
    title: cm === 'bw' ? 'Black & White' : cm.charAt(0).toUpperCase() + cm.slice(1),
    description: `${cm} color processing`,
    category: 'image-overlay',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: 'dithered',
      img: TSUNAMI_IMG,
      intensity: 100,
      colorMode: cm,
    },
  });
}

// Add one more to make 18 total
imageOverlayItems.push({
  id: 'img-blend',
  title: 'Blend Mode',
  description: 'Color blend overlay',
  category: 'image-overlay',
  params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'blend', img: TSUNAMI_IMG, intensity: 100 },
});

// ============================================
// ANIMATED OVERLAYS - king.gif
// ============================================
const animationOverlayItems: GalleryItem[] = [];

// Animated overlay modes
for (const overlay of overlayModes.slice(0, 6)) {
  animationOverlayItems.push({
    id: `anim-${overlay.mode}`,
    title: `Animated ${overlay.name}`,
    description: `${overlay.desc} with animation`,
    category: 'animation-overlay',
    isAnimated: true,
    params: { data: BASE_DATA, ec: 'H', v: 6, mode: overlay.mode, img: KING_GIF, intensity: 100 },
  });
}

// Different intensities for animation
for (const intensity of intensities) {
  animationOverlayItems.push({
    id: `anim-blue-noise-i${intensity}`,
    title: `Blue Noise ${intensity}%`,
    description: `Animated blue noise at ${intensity}%`,
    category: 'animation-overlay',
    isAnimated: true,
    params: { data: BASE_DATA, ec: 'H', v: 6, mode: 'blue-noise', img: KING_GIF, intensity },
  });
}

// Color modes for animation
for (const cm of colorModes) {
  animationOverlayItems.push({
    id: `anim-colormode-${cm}`,
    title: cm === 'bw' ? 'Animated B&W' : `Animated ${cm.charAt(0).toUpperCase() + cm.slice(1)}`,
    description: `${cm} animated overlay`,
    category: 'animation-overlay',
    isAnimated: true,
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: 'dithered',
      img: KING_GIF,
      intensity: 100,
      colorMode: cm,
    },
  });
}

// ============================================
// PREPROCESSING - Image filters
// ============================================
const preprocessingItems: GalleryItem[] = [];

// Brightness variations
const brightnessLevels = [-50, -25, 25, 50];
for (const b of brightnessLevels) {
  preprocessingItems.push({
    id: `prep-brightness-${b > 0 ? 'p' : 'n'}${Math.abs(b)}`,
    title: `Brightness ${b > 0 ? '+' : ''}${b}`,
    description: `Brightness adjusted ${b > 0 ? 'brighter' : 'darker'}`,
    category: 'preprocessing',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: 'dithered',
      img: TSUNAMI_IMG,
      intensity: 100,
      brightness: b,
    },
  });
}

// Contrast variations
const contrastLevels = [-50, 50, 100];
for (const c of contrastLevels) {
  preprocessingItems.push({
    id: `prep-contrast-${c > 0 ? 'p' : 'n'}${Math.abs(c)}`,
    title: `Contrast ${c > 0 ? '+' : ''}${c}`,
    description: `${c > 0 ? 'High' : 'Low'} contrast`,
    category: 'preprocessing',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: 'dithered',
      img: TSUNAMI_IMG,
      intensity: 100,
      contrast: c,
    },
  });
}

// Gamma variations
const gammaLevels = [0.5, 1.5, 2];
for (const g of gammaLevels) {
  preprocessingItems.push({
    id: `prep-gamma-${String(g).replace('.', '')}`,
    title: `Gamma ${g}`,
    description: `Gamma correction ${g}`,
    category: 'preprocessing',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: 'dithered',
      img: TSUNAMI_IMG,
      intensity: 100,
      gamma: g,
    },
  });
}

// Saturation variations
const saturationLevels = [-100, -50, 50, 100];
for (const s of saturationLevels) {
  preprocessingItems.push({
    id: `prep-saturation-${s > 0 ? 'p' : 'n'}${Math.abs(s)}`,
    title: `Saturation ${s > 0 ? '+' : ''}${s}`,
    description: (() => {
      if (s === -100) return 'Desaturated';
      if (s > 0) return 'Oversaturated';
      return 'Reduced saturation';
    })(),
    category: 'preprocessing',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: 'dithered',
      img: TSUNAMI_IMG,
      intensity: 100,
      saturation: s,
    },
  });
}

// Blur variations
const blurLevels = [1, 2, 4];
for (const blur of blurLevels) {
  preprocessingItems.push({
    id: `prep-blur-${blur}`,
    title: `Blur ${blur}px`,
    description: `${blur}px gaussian blur`,
    category: 'preprocessing',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: 'dithered',
      img: TSUNAMI_IMG,
      intensity: 100,
      blur,
    },
  });
}

// Sharpen variations
const sharpenLevels = [25, 50, 100];
for (const sharpen of sharpenLevels) {
  preprocessingItems.push({
    id: `prep-sharpen-${sharpen}`,
    title: `Sharpen ${sharpen}%`,
    description: `${sharpen}% sharpening`,
    category: 'preprocessing',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: 'dithered',
      img: TSUNAMI_IMG,
      intensity: 100,
      sharpen,
    },
  });
}

// Posterize variations
const posterizeLevels = [2, 4, 8];
for (const levels of posterizeLevels) {
  preprocessingItems.push({
    id: `prep-posterize-${levels}`,
    title: `Posterize ${levels}`,
    description: `${levels} color levels`,
    category: 'preprocessing',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: 'dithered',
      img: TSUNAMI_IMG,
      intensity: 100,
      posterize: levels,
    },
  });
}

// Threshold variations
const thresholdLevels = [64, 128, 192];
for (const thresh of thresholdLevels) {
  preprocessingItems.push({
    id: `prep-threshold-${thresh}`,
    title: `Threshold ${thresh}`,
    description: `Binary threshold at ${thresh}`,
    category: 'preprocessing',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: 'dithered',
      img: TSUNAMI_IMG,
      intensity: 100,
      threshold: thresh,
    },
  });
}

// Edge detection
const edgeModes = ['sobel', 'canny'];
for (const edge of edgeModes) {
  preprocessingItems.push({
    id: `prep-edge-${edge}`,
    title: `Edge ${edge.charAt(0).toUpperCase() + edge.slice(1)}`,
    description: `${edge} edge detection`,
    category: 'preprocessing',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: 'dithered',
      img: TSUNAMI_IMG,
      intensity: 100,
      edge,
    },
  });
}

// Invert and hue rotate to make 30 total (multiple of 6)
preprocessingItems.push(
  {
    id: 'prep-invert',
    title: 'Inverted',
    description: 'Inverted colors',
    category: 'preprocessing',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: 'dithered',
      img: TSUNAMI_IMG,
      intensity: 100,
      invert: true,
    },
  },
  {
    id: 'prep-hue-90',
    title: 'Hue +90°',
    description: 'Hue rotation 90 degrees',
    category: 'preprocessing',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: 'dithered',
      img: TSUNAMI_IMG,
      intensity: 100,
      hue: 90,
    },
  }
);

// ============================================
// QR ENCODING - Versions and ECC
// ============================================
const encodingItems: GalleryItem[] = [];

// Version comparisons with image
const versions = [0, 6, 9, 12];
for (const v of versions) {
  encodingItems.push({
    id: `enc-v${v}`,
    title: v === 0 ? 'Auto Version' : `Version ${v}`,
    description: (() => {
      if (v === 0) return 'Automatic version selection';
      if (v === 6) return 'Best for overlays (no center eye)';
      return `Version ${v} QR code`;
    })(),
    category: 'encoding',
    params: { data: BASE_DATA, ec: 'H', v, mode: 'dithered', img: TSUNAMI_IMG, intensity: 100 },
  });
}

// ECC level comparisons
const eccLevels = [
  { level: 'L', name: 'Low', desc: '7% error correction' },
  { level: 'M', name: 'Medium', desc: '15% error correction' },
  { level: 'Q', name: 'Quartile', desc: '25% error correction' },
  { level: 'H', name: 'High', desc: '30% error correction' },
];
for (const ecc of eccLevels) {
  encodingItems.push({
    id: `enc-ecc-${ecc.level.toLowerCase()}`,
    title: `ECC ${ecc.name}`,
    description: ecc.desc,
    category: 'encoding',
    params: {
      data: BASE_DATA,
      ec: ecc.level,
      v: 6,
      mode: 'dithered',
      img: TSUNAMI_IMG,
      intensity: 100,
    },
  });
}

// Version + ECC combinations
const versionEccCombos = [
  { v: 6, ec: 'L', name: 'V6 + ECC Low' },
  { v: 6, ec: 'H', name: 'V6 + ECC High' },
  { v: 9, ec: 'L', name: 'V9 + ECC Low' },
  { v: 9, ec: 'H', name: 'V9 + ECC High' },
];
for (const combo of versionEccCombos) {
  encodingItems.push({
    id: `enc-v${combo.v}-${combo.ec.toLowerCase()}`,
    title: combo.name,
    description: `Version ${combo.v} with ${combo.ec === 'H' ? 'high' : 'low'} error correction`,
    category: 'encoding',
    params: {
      data: BASE_DATA,
      ec: combo.ec,
      v: combo.v,
      mode: 'dithered',
      img: TSUNAMI_IMG,
      intensity: 100,
    },
  });
}

// ============================================
// DITHERING ALGORITHMS
// ============================================
const ditheringItems: GalleryItem[] = [];

// Dither kinds
const ditherKinds = [
  { kind: 'error_diffusion', name: 'Error Diffusion', desc: 'Floyd-Steinberg style' },
  { kind: 'ordered_bayer', name: 'Ordered Bayer', desc: 'Bayer matrix dithering' },
  { kind: 'blue_noise', name: 'Blue Noise', desc: 'Blue noise threshold' },
  { kind: 'white_noise', name: 'White Noise', desc: 'Random noise threshold' },
  { kind: 'blue_noise_error_diffusion', name: 'Blue Noise + Error', desc: 'Hybrid blue noise' },
  { kind: 'perceptual', name: 'Perceptual', desc: 'Luminance-weighted' },
  { kind: 'adaptive_threshold', name: 'Adaptive', desc: 'Adaptive threshold' },
];

for (const dither of ditherKinds) {
  ditheringItems.push({
    id: `dither-${dither.kind.replaceAll('_', '-')}`,
    title: dither.name,
    description: dither.desc,
    category: 'dithering',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: 'dithered',
      img: TSUNAMI_IMG,
      intensity: 100,
      ditherKind: dither.kind,
    },
  });
}

// Diffusion kernels
const diffusionKernels = [
  { kernel: 'floyd_steinberg', name: 'Floyd-Steinberg' },
  { kernel: 'jarvis_judice_ninke', name: 'Jarvis-Judice-Ninke' },
  { kernel: 'stucki', name: 'Stucki' },
  { kernel: 'atkinson', name: 'Atkinson' },
  { kernel: 'sierra', name: 'Sierra' },
  { kernel: 'burkes', name: 'Burkes' },
];

for (const d of diffusionKernels) {
  ditheringItems.push({
    id: `dither-kernel-${d.kernel.replaceAll('_', '-')}`,
    title: d.name,
    description: `${d.name} error diffusion`,
    category: 'dithering',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: 'dithered',
      img: TSUNAMI_IMG,
      intensity: 100,
      ditherKind: 'error_diffusion',
      diffusionKernel: d.kernel,
    },
  });
}

// Dither strength variations (5 items to make 18 total)
const ditherStrengths = [20, 40, 60, 80, 100];
for (const strength of ditherStrengths) {
  ditheringItems.push({
    id: `dither-strength-${strength}`,
    title: `Strength ${strength}%`,
    description: `Dither strength at ${strength}%`,
    category: 'dithering',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: 'dithered',
      img: TSUNAMI_IMG,
      intensity: 100,
      ditherStrength: strength,
    },
  });
}

// ============================================
// POWER COMBOS - Striking multi-feature combinations (12 items)
// ============================================
const powerComboItems: GalleryItem[] = [
  {
    id: 'combo-dots-halftone-gold',
    title: 'Dots + Halftone Gold',
    description: 'Dot modules with halftone overlay',
    category: 'power-combos',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      style: 'dots',
      finder: 'circle',
      mode: 'halftone',
      img: TSUNAMI_IMG,
      intensity: 100,
      fg: '7f5539',
      bg: 'ffe8cc',
    },
  },
  {
    id: 'combo-diamond-blue-noise-navy',
    title: 'Diamond + Blue Noise Navy',
    description: 'Diamond modules with blue noise',
    category: 'power-combos',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      style: 'diamond',
      finder: 'rounded',
      mode: 'blue-noise',
      img: TSUNAMI_IMG,
      intensity: 100,
      fg: '001d3d',
      bg: 'a2d2ff',
    },
  },
  {
    id: 'combo-rounded-mosaic-sunset',
    title: 'Rounded + Mosaic Sunset',
    description: 'Rounded modules with mosaic overlay',
    category: 'power-combos',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      style: 'rounded',
      finder: 'rounded',
      mode: 'mosaic',
      img: TSUNAMI_IMG,
      intensity: 100,
      fg: 'bf0603',
      bg: 'fff3b0',
    },
  },
  {
    id: 'combo-connected-wave-ocean',
    title: 'Connected + Wave Ocean',
    description: 'Connected modules with wave effect',
    category: 'power-combos',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      style: 'connected',
      finder: 'square',
      mode: 'wave',
      img: TSUNAMI_IMG,
      intensity: 100,
      fg: '023e8a',
      bg: 'caf0f8',
    },
  },
  {
    id: 'combo-dots-extreme-forest',
    title: 'Dots + Extreme Forest',
    description: 'Maximum visibility with dots',
    category: 'power-combos',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      style: 'dots',
      finder: 'circle',
      mode: 'extreme',
      img: TSUNAMI_IMG,
      intensity: 100,
      fg: '1b4332',
      bg: 'd8f3dc',
    },
  },
  {
    id: 'combo-rounded-dithered-royal',
    title: 'Rounded + Dithered Royal',
    description: 'Classic dithered with rounded style',
    category: 'power-combos',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      style: 'rounded',
      finder: 'rounded',
      mode: 'dithered',
      img: TSUNAMI_IMG,
      intensity: 100,
      fg: '4a0080',
      bg: 'f5e6ff',
    },
  },
  {
    id: 'combo-diamond-duotone-crimson',
    title: 'Diamond + Duotone Crimson',
    description: 'Duotone effect with diamond modules',
    category: 'power-combos',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      style: 'diamond',
      finder: 'rounded',
      mode: 'duotone',
      img: TSUNAMI_IMG,
      intensity: 100,
      fg: '9d0208',
      bg: 'ffccd5',
    },
  },
  {
    id: 'combo-connected-pixelate-teal',
    title: 'Connected + Pixelate Teal',
    description: 'Pixelated overlay with connected modules',
    category: 'power-combos',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      style: 'connected',
      finder: 'square',
      mode: 'pixelate',
      img: TSUNAMI_IMG,
      intensity: 100,
      fg: '006d77',
      bg: 'e0f4f5',
    },
  },
  {
    id: 'combo-dots-outline-slate',
    title: 'Dots + Outline Slate',
    description: 'Edge detection with dot modules',
    category: 'power-combos',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      style: 'dots',
      finder: 'circle',
      mode: 'outline',
      img: TSUNAMI_IMG,
      intensity: 100,
      fg: '343a40',
      bg: 'e9ecef',
    },
  },
  {
    id: 'combo-rounded-subpixel-coral',
    title: 'Rounded + Subpixel Coral',
    description: 'High-detail subpixel rendering',
    category: 'power-combos',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      style: 'rounded',
      finder: 'rounded',
      mode: 'subpixel',
      img: TSUNAMI_IMG,
      intensity: 100,
      fg: 'e85d04',
      bg: 'ffe8d6',
    },
  },
  {
    id: 'combo-anim-dots-halftone',
    title: 'Animated Dots + Halftone',
    description: 'Animated halftone with dot modules',
    category: 'power-combos',
    isAnimated: true,
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      style: 'dots',
      finder: 'circle',
      mode: 'halftone',
      img: KING_GIF,
      intensity: 100,
      fg: '1a1a2e',
      bg: 'eef1ff',
    },
  },
  {
    id: 'combo-anim-rounded-blue-noise',
    title: 'Animated Rounded + Blue Noise',
    description: 'Animated blue noise with rounded',
    category: 'power-combos',
    isAnimated: true,
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      style: 'rounded',
      finder: 'rounded',
      mode: 'blue-noise',
      img: KING_GIF,
      intensity: 100,
      fg: '702459',
      bg: 'fff5f7',
    },
  },
];

// ============================================
// BLEND MODES (for advanced overlays)
// ============================================
const blendModeItems: GalleryItem[] = [];

// Image blend with different color schemes
const blendColors = [
  { name: 'Classic', fg: '000000', bg: 'ffffff' },
  { name: 'Navy', fg: '1a365d', bg: 'ebf8ff' },
  { name: 'Wine', fg: '702459', bg: 'fff5f7' },
  { name: 'Forest', fg: '1c4532', bg: 'f0fff4' },
];

for (const color of blendColors) {
  blendModeItems.push({
    id: `blend-${color.name.toLowerCase()}`,
    title: `${color.name} Blend`,
    description: `Dithered overlay with ${color.name.toLowerCase()} palette`,
    category: 'blend-modes',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: 'dithered',
      img: TSUNAMI_IMG,
      intensity: 100,
      fg: color.fg,
      bg: color.bg,
    },
  });
}

// Halftone with colors
for (const color of blendColors) {
  blendModeItems.push({
    id: `halftone-${color.name.toLowerCase()}`,
    title: `${color.name} Halftone`,
    description: `Halftone with ${color.name.toLowerCase()} palette`,
    category: 'blend-modes',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: 'halftone',
      img: TSUNAMI_IMG,
      intensity: 100,
      fg: color.fg,
      bg: color.bg,
    },
  });
}

// Mosaic with colors (4 more to make 12 total)
for (const color of blendColors) {
  blendModeItems.push({
    id: `mosaic-${color.name.toLowerCase()}`,
    title: `${color.name} Mosaic`,
    description: `Mosaic with ${color.name.toLowerCase()} palette`,
    category: 'blend-modes',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: 'mosaic',
      img: TSUNAMI_IMG,
      intensity: 100,
      fg: color.fg,
      bg: color.bg,
    },
  });
}

// ============================================
// COLOR MODES - Processing modes (6 items)
// ============================================
const colorModeItems: GalleryItem[] = [];

// Color modes with different overlay modes (reduced to 6 most distinct)
const modeColorCombos = [
  { overlayMode: 'dithered', colorMode: 'color' },
  { overlayMode: 'dithered', colorMode: 'grayscale' },
  { overlayMode: 'blue-noise', colorMode: 'color' },
  { overlayMode: 'blue-noise', colorMode: 'bw' },
  { overlayMode: 'halftone', colorMode: 'color' },
  { overlayMode: 'halftone', colorMode: 'bw' },
];

for (const combo of modeColorCombos) {
  const overlayName = combo.overlayMode
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  const colorName =
    combo.colorMode === 'bw'
      ? 'B&W'
      : combo.colorMode.charAt(0).toUpperCase() + combo.colorMode.slice(1);
  colorModeItems.push({
    id: `cmode-${combo.overlayMode}-${combo.colorMode}`,
    title: `${overlayName} ${colorName}`,
    description: `${overlayName} in ${colorName}`,
    category: 'color-modes',
    params: {
      data: BASE_DATA,
      ec: 'H',
      v: 6,
      mode: combo.overlayMode,
      img: TSUNAMI_IMG,
      intensity: 100,
      colorMode: combo.colorMode,
    },
  });
}

// ============================================
// VALIDATED SHOWCASE - Scan-approved canonical scenarios
// ============================================
const validatedShowcaseItems: GalleryItem[] = buildScanShowcaseSeeds(BASE_DATA, TSUNAMI_IMG).map(
  (seed) => ({
    id: seed.id,
    title: seed.title,
    description: seed.description,
    category: 'validated-showcase',
    params: Object.fromEntries(
      Object.entries(seed.params).filter(([, v]) => v !== undefined)
    ) as Record<string, string | number | boolean>,
  })
);

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
    description: 'Static image overlays with different blend modes',
    icon: 'Image',
    items: imageOverlayItems,
  },
  {
    id: 'animation-overlay',
    title: 'Animated Overlays',
    description: 'Animated GIF overlays with different blend modes',
    icon: 'Film',
    items: animationOverlayItems,
  },
  {
    id: 'blend-modes',
    title: 'Blend Modes',
    description: 'Different color blending with image overlays',
    icon: 'Layers',
    items: blendModeItems,
  },
  {
    id: 'color-modes',
    title: 'Color Processing',
    description: 'Color, grayscale, and black & white processing',
    icon: 'Contrast',
    items: colorModeItems,
  },
  {
    id: 'preprocessing',
    title: 'Image Preprocessing',
    description: 'Brightness, contrast, gamma, blur, sharpen, posterize, edge detection',
    icon: 'Sliders',
    items: preprocessingItems,
  },
  {
    id: 'encoding',
    title: 'QR Encoding',
    description: 'Different QR versions and error correction levels',
    icon: 'Settings2',
    items: encodingItems,
  },
  {
    id: 'dithering',
    title: 'Dithering Algorithms',
    description: 'Different dithering methods and error diffusion kernels',
    icon: 'Grid3x3',
    items: ditheringItems,
  },
  {
    id: 'power-combos',
    title: 'Power Combos',
    description: 'Striking multi-feature combinations showcasing ANQR capabilities',
    icon: 'Sparkles',
    items: powerComboItems,
  },
  {
    id: 'validated-showcase',
    title: 'Validated Showcase',
    description: 'Scan-verified overlay configurations tested across canonical fixtures',
    icon: 'ShieldCheck',
    items: validatedShowcaseItems,
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
