/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Artwork frame state interface.
 */

export interface ArtworkFrameState {
  artworkLockedMask: number;
  artworkLockedVersion: number;
  lastSuccessfulArtworkFrame: HTMLCanvasElement | null;
  lastSuccessfulArtworkMatchPercentage: number;
  getArtworkBitmapScratchCanvas: (slot: 0 | 1, w: number, h: number) => HTMLCanvasElement;
  getArtworkFrameTargetImage: (c: HTMLCanvasElement | OffscreenCanvas, fi: number) => ImageData;
  artworkRenderConfigTemplate: Record<string, unknown>;
  setLockedMask: (v: number) => void;
  setLockedVersion: (v: number) => void;
  setLastSuccessfulFrame: (f: HTMLCanvasElement | null) => void;
  setLastSuccessfulMatchPercentage: (v: number) => void;
}

