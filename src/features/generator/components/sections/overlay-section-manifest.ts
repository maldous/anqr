import type { OverlayMode } from '@/store/qr-store';

export const BASIC_OVERLAY_MODES: Array<{ value: OverlayMode; labelKey: string }> = [
  { value: 'center', labelKey: 'overlay.centerLogo' },
  { value: 'blend', labelKey: 'overlay.blendMode' },
  { value: 'halftone', labelKey: 'overlay.halftoneMode' },
  { value: 'dithered', labelKey: 'overlay.ditheredMode' },
  { value: 'artwork', labelKey: 'overlay.artworkMode' },
];

export const ADVANCED_OVERLAY_MODES: Array<{ value: OverlayMode; labelKey: string }> = [
  { value: 'subpixel', labelKey: 'overlay.subpixelMode' },
  { value: 'blue-noise', labelKey: 'overlay.blueNoiseMode' },
  { value: 'halftone-dithered', labelKey: 'overlay.halftoneDitheredMode' },
  { value: 'mosaic', labelKey: 'overlay.mosaicMode' },
  { value: 'gapfill', labelKey: 'overlay.gapFillMode' },
  { value: 'brightness', labelKey: 'overlay.brightnessMode' },
  { value: 'duotone', labelKey: 'overlay.duotoneMode' },
];

export const PRO_OVERLAY_MODES: Array<{ value: OverlayMode; labelKey: string }> = [
  { value: 'pixelate', labelKey: 'overlay.pixelateMode' },
  { value: 'outline', labelKey: 'overlay.outlineMode' },
  { value: 'wave', labelKey: 'overlay.waveMode' },
  { value: 'subpixel-size', labelKey: 'overlay.subpixelSizeMode' },
  { value: 'dither', labelKey: 'overlay.trueDitherMode' },
  { value: 'extreme', labelKey: 'overlay.extremeMode' },
];

export const GALLERY_IMAGES = [
  { id: 'tsunami', name: 'Tsunami', url: '/tsunami.jpg', isAnimated: false },
  { id: 'king', name: 'King', url: '/king.gif', isAnimated: true },
  { id: 'logo', name: 'Logo', url: '/logo.png', isAnimated: false },
  { id: 'test', name: 'Test', url: '/test.png', isAnimated: false },
  { id: 'santa', name: 'Santa', url: '/santa.png', isAnimated: false },
  { id: 'dance', name: 'Dance', url: '/dance.gif', isAnimated: true },
] as const;

export function getAvailableOverlayModes(tier: string) {
  return [
    ...BASIC_OVERLAY_MODES,
    ...(tier === 'advanced' || tier === 'professional' ? ADVANCED_OVERLAY_MODES : []),
    ...(tier === 'professional' ? PRO_OVERLAY_MODES : []),
  ];
}
