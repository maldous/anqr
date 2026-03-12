import type { QArtModule } from './q-art-module';
import type { QArtResult } from './q-art-result';

export async function runArtworkMainThreadFallback(params: {
  qartModule: QArtModule;
  qartConfig: Record<string, unknown>;
  frameOverlayCanvas: HTMLCanvasElement | OffscreenCanvas;
  useAutoMask: boolean;
  artworkLockedMask: number;
  configMaskPattern: number;
}): Promise<QArtResult> {
  return params.useAutoMask && params.artworkLockedMask < 0
    ? await params.qartModule.generateFullQArtOptimal({
        ...params.qartConfig,
        targetImage: params.frameOverlayCanvas,
      } as Parameters<QArtModule['generateFullQArtOptimal']>[0])
    : await params.qartModule.generateFullQArt({
        ...params.qartConfig,
        targetImage: params.frameOverlayCanvas,
        maskPattern:
          params.artworkLockedMask >= 0 ? params.artworkLockedMask : params.configMaskPattern,
      } as Parameters<QArtModule['generateFullQArt']>[0]);
}
