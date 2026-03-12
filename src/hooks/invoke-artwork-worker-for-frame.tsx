import { log } from './log';
import { handleArtworkMainThreadFallbackForFrame } from './handle-artwork-main-thread-fallback-for-frame';
import type { QArtModule } from './q-art-module';
import type { QArtWorkerResult } from './q-art-worker-result';
import type { ArtworkFrameState } from './artwork-frame-state';

export async function invokeArtworkWorkerForFrame(params: {
  qartModule: QArtModule;
  qartConfig: Record<string, unknown>;
  workerRenderConfig: Record<string, unknown>;
  resolvedMask: number | undefined;
  artworkState: ArtworkFrameState;
  frameOverlayCanvas: HTMLCanvasElement | OffscreenCanvas;
  frameIdx: number;
  abortSignal: AbortSignal;
  isRunCancelled: () => boolean;
  debouncedConfig: Record<string, unknown>;
  useAutoMask: boolean;
  reuseLastSuccessfulFrame: () => HTMLCanvasElement | null;
  fallbackGenerate: () => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
  rememberSuccessfulFrame: (f: HTMLCanvasElement | OffscreenCanvas, mp: number) => void;
}): Promise<
  | { workerResult: QArtWorkerResult }
  | { fallbackCanvas: HTMLCanvasElement | OffscreenCanvas | null }
> {
  try {
    const targetImage = params.artworkState.getArtworkFrameTargetImage(
      params.frameOverlayCanvas,
      params.frameIdx
    );
    const workerResult = await params.qartModule.generateQArtInWorker(
      {
        data: params.qartConfig.data as string,
        targetImage,
        version: params.qartConfig.version as number,
        ecc: params.qartConfig.ecc as 'L' | 'M' | 'Q' | 'H',
        strictSuffix: params.qartConfig.strictSuffix as boolean,
        targetControlPercent: params.qartConfig.targetControlPercent as number,
        searchAttempts: params.qartConfig.searchAttempts as number,
        searchSeed: params.qartConfig.searchSeed as number,
        lockVersionToMinimum: params.qartConfig.lockVersionToMinimum as boolean,
        maskPattern: params.resolvedMask,
        performanceProfile: params.qartConfig.performanceProfile as 'quality' | 'balanced',
        renderConfig: params.workerRenderConfig,
        renderInWorker: true,
      },
      { signal: params.abortSignal }
    );
    return { workerResult };
  } catch (error_) {
    if (params.isRunCancelled()) return { fallbackCanvas: null };
    log.warn('QR-Art animation frame worker failed; falling back to main thread', {
      frameIdx: params.frameIdx,
      error: error_,
    });
    const fallbackCanvas = await handleArtworkMainThreadFallbackForFrame({
      qartModule: params.qartModule,
      qartConfig: params.qartConfig,
      frameOverlayCanvas: params.frameOverlayCanvas,
      useAutoMask: params.useAutoMask,
      artworkState: params.artworkState,
      configMaskPattern: params.debouncedConfig.maskPattern as number,
      frameIdx: params.frameIdx,
      debouncedConfig: params.debouncedConfig,
      reuseLastSuccessfulFrame: params.reuseLastSuccessfulFrame,
      fallbackGenerate: params.fallbackGenerate,
      rememberSuccessfulFrame: params.rememberSuccessfulFrame,
    });
    return { fallbackCanvas };
  }
}
