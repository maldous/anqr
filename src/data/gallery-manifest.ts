/**
 * Lightweight Gallery section manifest used by non-gallery routes/components.
 *
 * Keep this file small and stable so header/navigation can reference
 * gallery categories without importing the full generated showcase payload.
 */

export type GalleryCategory =
  | 'plain'
  | 'styles'
  | 'colors'
  | 'image-overlay'
  | 'animation-overlay'
  | 'blend-modes'
  | 'color-modes'
  | 'encoding'
  | 'power-combos'
  | 'qr-art';

export interface GallerySectionManifestItem {
  id: GalleryCategory;
  title: string;
  icon: string;
}

export const gallerySectionManifest: readonly GallerySectionManifestItem[] = [
  { id: 'plain', title: 'Plain QR Codes', icon: 'QrCode' },
  { id: 'styles', title: 'Module & Finder Styles', icon: 'Shapes' },
  { id: 'colors', title: 'Colors & Themes', icon: 'Palette' },
  { id: 'image-overlay', title: 'Image Overlays', icon: 'Image' },
  { id: 'animation-overlay', title: 'Animated Overlays', icon: 'Film' },
  { id: 'blend-modes', title: 'Blend Modes', icon: 'Layers' },
  { id: 'color-modes', title: 'Color Processing', icon: 'Contrast' },
  { id: 'encoding', title: 'QR Encoding', icon: 'Settings2' },
  { id: 'power-combos', title: 'Power Combos', icon: 'Sparkles' },
  { id: 'qr-art', title: 'QR Art', icon: 'Paintbrush' },
] as const;
