/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Handle main thread fallback for artwork frame.
 */

import { createLogger } from "@/infra/logging/logger";
import type { QRGeneratorConfig } from "@/modules/qr-generator";
import type {
  FullQArtPipelineResult,
  QArtModule,
} from "@/features/generator/application/qart/qart-shared-types";
import type { ArtworkFrameState } from "@/features/generator/application/frames/frames-artworkstate.types";
import { qrGenerator } from "@/features/generator/application/generation/generation-singleton";
import { runArtworkMainThreadFallback } from "@/features/generator/application/safety/run-artwork-main-thread-fallback.service";

const log = createLogger("QR");

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
    log.warn("QR-Art failed for animation frame", { frameIdx: params.frameIdx });
    return params.reuseLastSuccessfulFrame() ?? (await params.fallbackGenerate());
  }

  const fullResult = qartResult as unknown as FullQArtPipelineResult;
  if (params.frameIdx === 0) {
    params.artworkState.setLockedMask(fullResult.maskPattern ?? 0);
    params.artworkState.setLockedVersion(fullResult.version ?? 0);
  }
  const qrArtConfig = {
    ...params.debouncedConfig,
    typeNumber: fullResult.version ?? 0,
    overlayMode: undefined,
  } as QRGeneratorConfig;
  const rendered = await qrGenerator.renderFromMatrix(qartResult.matrix, qrArtConfig);
  params.rememberSuccessfulFrame(rendered, qartResult.matchPercentage);
  return rendered;
}
