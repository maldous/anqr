/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Run QArt on main thread as worker fallback.
 */

import type {
  FullQArtPipelineResult,
  QArtModule,
} from '@/features/generator/application/qart/qart-shared-types';
import { toFullQArtPipelineResult } from './to-full-qart-pipeline-result';

export async function runArtworkMainThreadFallback(params: {
  qartModule: QArtModule;
  qartConfig: Record<string, unknown>;
  frameOverlayCanvas: HTMLCanvasElement | OffscreenCanvas;
  useAutoMask: boolean;
  artworkLockedMask: number;
  configMaskPattern: number;
}): Promise<FullQArtPipelineResult> {
  return params.useAutoMask && params.artworkLockedMask < 0
    ? toFullQArtPipelineResult(
        await params.qartModule.generateFullQArtOptimal({
          ...params.qartConfig,
          targetImage: params.frameOverlayCanvas,
        } as Parameters<QArtModule['generateFullQArtOptimal']>[0])
      )
    : toFullQArtPipelineResult(
        await params.qartModule.generateFullQArt({
          ...params.qartConfig,
          targetImage: params.frameOverlayCanvas,
          maskPattern:
            params.artworkLockedMask >= 0 ? params.artworkLockedMask : params.configMaskPattern,
        } as Parameters<QArtModule['generateFullQArt']>[0])
      );
}
