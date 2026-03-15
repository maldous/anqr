import type { QRGeneratorConfig } from '../domain/render/generator';
import { qrGenerator } from './qr-generator';
import { log } from './log';
import { runArtworkMainThreadFallback } from './run-artwork-main-thread-fallback';
import type { QArtModule } from './q-art-module';
import type { ArtworkFrameState } from './artwork-frame-state';

export async function handleArtworkMainThreadFallbackForFrame(params: {
  qartModule: QArtModule;
  qartConfig: Record<string, unknown>;
  frameOverlayCanvas: HTMLCanvasElement | OffscreenCanvas;
  useAutoMask: boolean;
  artworkState: ArtworkFrameState;
  configMaskPattern: number;
  frameIdx: number;
  debouncedConfig: Record<string, unknown>;
  reuseLastSuccessfulFrame: () => HTMLCanvasElement | null;
  fallbackGenerate: () => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
  rememberSuccessfulFrame: (f: HTMLCanvasElement | OffscreenCanvas, mp: number) => void;
}): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  const qartResult = await runArtworkMainThreadFallback({
    qartModule: params.qartModule,
    qartConfig: params.qartConfig,
    frameOverlayCanvas: params.frameOverlayCanvas,
    useAutoMask: params.useAutoMask,
    artworkLockedMask: params.artworkState.artworkLockedMask,
    configMaskPattern: params.configMaskPattern,
  });

  if (!qartResult.success || !qartResult.matrix) {
    log.warn('QR-Art failed for animation frame', { frameIdx: params.frameIdx });
    return params.reuseLastSuccessfulFrame() ?? (await params.fallbackGenerate());
  }

  if (params.frameIdx === 0) {
    params.artworkState.setLockedMask(qartResult.maskPattern ?? 0);
    params.artworkState.setLockedVersion(qartResult.version ?? 0);
  }
  const qrArtConfig = {
    ...params.debouncedConfig,
    typeNumber: qartResult.version ?? 0,
    overlayMode: undefined,
  } as QRGeneratorConfig;
  const rendered = await qrGenerator.renderFromMatrix(qartResult.matrix, qrArtConfig);
  params.rememberSuccessfulFrame(rendered, qartResult.matchPercentage);
  return rendered;
}
