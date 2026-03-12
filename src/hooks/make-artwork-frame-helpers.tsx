import type { QRGeneratorConfig } from '../domain/render/generator';
import { qrGenerator } from './qr-generator';
import { cloneCanvasFrame } from './clone-canvas-frame';
import type { ArtworkFrameState } from './artwork-frame-state';

export function makeArtworkFrameHelpers(params: {
  artworkState: ArtworkFrameState;
  previewScanConfigBase: QRGeneratorConfig;
  frameOverlayCanvas: HTMLCanvasElement | OffscreenCanvas;
  frameIdx: number;
}): {
  reuseLastSuccessfulFrame: () => HTMLCanvasElement | null;
  rememberSuccessfulFrame: (f: HTMLCanvasElement | OffscreenCanvas, mp: number) => void;
  fallbackGenerate: () => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
} {
  const reuseLastSuccessfulFrame = (): HTMLCanvasElement | null =>
    params.artworkState.lastSuccessfulArtworkFrame
      ? cloneCanvasFrame(params.artworkState.lastSuccessfulArtworkFrame)
      : null;
  const rememberSuccessfulFrame = (
    frame: HTMLCanvasElement | OffscreenCanvas,
    matchPercentage: number
  ): void => {
    params.artworkState.setLastSuccessfulFrame(
      cloneCanvasFrame(frame, params.artworkState.lastSuccessfulArtworkFrame)
    );
    if (Number.isFinite(matchPercentage)) {
      params.artworkState.setLastSuccessfulMatchPercentage(matchPercentage);
    }
  };
  const fallbackGenerate = () =>
    qrGenerator.generate(
      {
        ...params.previewScanConfigBase,
        frameIndex: params.frameIdx,
        overlayMode: 'dithered',
      },
      params.frameOverlayCanvas
    );
  return { reuseLastSuccessfulFrame, rememberSuccessfulFrame, fallbackGenerate };
}
