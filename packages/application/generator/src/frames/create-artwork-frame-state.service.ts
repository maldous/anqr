/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Create initial artwork frame state.
 */

import type { QRGeneratorConfig } from "@/modules/qr-generator";
import type { ArtworkFrameState } from "./frames-artworkstate.types";
import { readCanvasImageData } from "../generation/read-canvas-image-data.service";
import { sanitizeQArtRenderConfig } from "../generation/sanitize-q-art-render-config.service";

export function createArtworkFrameState(
  debouncedConfig: Record<string, unknown>,
): ArtworkFrameState {
  const artworkFrameImageDataCache = new WeakMap<
    HTMLCanvasElement | OffscreenCanvas,
    { frameIdx: number; width: number; height: number; imageData: ImageData }
  >();
  const getArtworkFrameTargetImage = (
    sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
    frameIdx: number,
  ): ImageData => {
    const cached = artworkFrameImageDataCache.get(sourceCanvas);
    if (
      cached?.frameIdx === frameIdx &&
      cached?.width === sourceCanvas.width &&
      cached?.height === sourceCanvas.height &&
      cached?.imageData.data.byteLength > 0
    ) {
      return cached.imageData;
    }
    const imageData = readCanvasImageData(sourceCanvas);
    artworkFrameImageDataCache.set(sourceCanvas, {
      frameIdx,
      width: sourceCanvas.width,
      height: sourceCanvas.height,
      imageData,
    });
    return imageData;
  };
  let artworkLockedMask = -1;
  let artworkLockedVersion = (debouncedConfig.typeNumber as number) || 0;
  let lastSuccessfulArtworkFrame: HTMLCanvasElement | null = null;
  let lastSuccessfulArtworkMatchPercentage = -1;
  let artworkBitmapScratchA: HTMLCanvasElement | null = null;
  let artworkBitmapScratchB: HTMLCanvasElement | null = null;
  const getArtworkBitmapScratchCanvas = (
    slot: 0 | 1,
    width: number,
    height: number,
  ): HTMLCanvasElement => {
    const current = slot === 0 ? artworkBitmapScratchA : artworkBitmapScratchB;
    if (!current) {
      const created = document.createElement("canvas");
      created.width = width;
      created.height = height;
      if (slot === 0) {
        artworkBitmapScratchA = created;
      } else {
        artworkBitmapScratchB = created;
      }
      return created;
    }
    if (current.width !== width) current.width = width;
    if (current.height !== height) current.height = height;
    return current;
  };
  const artworkRenderConfigTemplate = sanitizeQArtRenderConfig({
    ...debouncedConfig,
    overlayMode: undefined,
  } as QRGeneratorConfig);

  return {
    get artworkLockedMask() {
      return artworkLockedMask;
    },
    get artworkLockedVersion() {
      return artworkLockedVersion;
    },
    get lastSuccessfulArtworkFrame() {
      return lastSuccessfulArtworkFrame;
    },
    get lastSuccessfulArtworkMatchPercentage() {
      return lastSuccessfulArtworkMatchPercentage;
    },
    getArtworkBitmapScratchCanvas,
    getArtworkFrameTargetImage,
    artworkRenderConfigTemplate,
    setLockedMask: (v: number) => {
      artworkLockedMask = v;
    },
    setLockedVersion: (v: number) => {
      artworkLockedVersion = v;
    },
    setLastSuccessfulFrame: (f: HTMLCanvasElement | null) => {
      lastSuccessfulArtworkFrame = f;
    },
    setLastSuccessfulMatchPercentage: (v: number) => {
      lastSuccessfulArtworkMatchPercentage = v;
    },
  };
}
