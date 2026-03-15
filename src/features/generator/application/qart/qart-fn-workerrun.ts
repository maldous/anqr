/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Run QArt generation via worker.
 */

import { createLogger } from '@/infra/logging/logger';
import type {
  FullQArtPipelineResult,
  QArtModule,
} from '@/features/generator/application/qart/qart-shared-types';
import type { QRGeneratorConfig } from '@/modules/qr-generator';
import { readCanvasImageData } from '@/features/generator/application/generation/generation-fn-readcanvas';
import { sanitizeQArtRenderConfig } from '@/features/generator/application/generation/generation-fn-sanitizeconfig';

const log = createLogger('QR');

export async function runQArtWorkerGeneration(params: {
  qartModule: QArtModule;
  qartConfig: {
    data: string;
    version: number;
    ecc: 'L' | 'M' | 'Q' | 'H';
    strictSuffix: boolean;
    targetControlPercent: number;
    searchAttempts: number;
    searchSeed: number;
    lockVersionToMinimum: boolean;
    performanceProfile: 'quality';
    onProgress: (stage: string, percent: number) => void;
  };
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas;
  debouncedConfig: Record<string, unknown>;
  useAutoMask: boolean;
  qartAbortSignal: AbortSignal;
}): Promise<{
  result: FullQArtPipelineResult;
  source: 'worker' | 'main';
  packedMatrix: Uint8Array | null;
  bitmap: ImageBitmap | null;
}> {
  try {
    const targetImage = readCanvasImageData(params.overlayCanvas);
    const workerRenderConfig = sanitizeQArtRenderConfig({
      ...params.debouncedConfig,
      typeNumber: params.qartConfig.version,
      overlayMode: undefined,
    } as QRGeneratorConfig);
    const workerResult = await params.qartModule.generateQArtInWorker(
      {
        data: params.qartConfig.data,
        targetImage,
        version: params.qartConfig.version,
        ecc: params.qartConfig.ecc,
        strictSuffix: params.qartConfig.strictSuffix,
        targetControlPercent: params.qartConfig.targetControlPercent,
        searchAttempts: params.qartConfig.searchAttempts,
        searchSeed: params.qartConfig.searchSeed,
        lockVersionToMinimum: params.qartConfig.lockVersionToMinimum,
        maskPattern: params.useAutoMask
          ? undefined
          : (params.debouncedConfig.maskPattern as number),
        performanceProfile: params.qartConfig.performanceProfile,
        renderConfig: workerRenderConfig,
        renderInWorker: true,
      },
      {
        onProgress: params.qartConfig.onProgress,
        signal: params.qartAbortSignal,
      }
    );

    const packedMatrix =
      workerResult.success && workerResult.matrix && workerResult.moduleCount > 0
        ? workerResult.matrix
        : null;
    const bitmap = workerResult.success && workerResult.bitmap ? workerResult.bitmap : null;
    const result: FullQArtPipelineResult = {
      success: workerResult.success,
      error: workerResult.error,
      matrix: [],
      moduleCount: workerResult.moduleCount,
      version: workerResult.version,
      maskPattern: workerResult.maskPattern,
      matchingPixels: workerResult.matchingPixels,
      totalControllable: workerResult.totalControllable,
      matchPercentage: workerResult.matchPercentage,
      encodedData:
        typeof workerResult.encodedData === 'string'
          ? new TextEncoder().encode(workerResult.encodedData)
          : (workerResult.encodedData ?? new Uint8Array(0)),
    };
    return { result, source: 'worker', packedMatrix, bitmap };
  } catch (error_) {
    if (params.qartAbortSignal.aborted) {
      throw error_;
    }
    log.warn('QArt worker failed, falling back to main thread generation', {
      error: error_,
    });
    const mainResult = params.useAutoMask
      ? await params.qartModule.generateFullQArtOptimal({
          ...params.qartConfig,
          targetImage: params.overlayCanvas,
        })
      : await params.qartModule.generateFullQArt({
          ...params.qartConfig,
          targetImage: params.overlayCanvas,
          maskPattern: params.debouncedConfig.maskPattern as number,
        });
    return {
      result: mainResult as unknown as FullQArtPipelineResult,
      source: 'main',
      packedMatrix: null,
      bitmap: null,
    };
  }
}
