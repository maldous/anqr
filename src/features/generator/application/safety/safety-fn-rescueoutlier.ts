/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Rescue outlier artwork frame with quality retry.
 */

import { createLogger } from '@/infra/logging/logger';
import type { QArtModule, QArtWorkerResult } from '@/features/generator/application/qart/qart-shared-types';

const log = createLogger('QR');


export async function rescueOutlierArtworkFrame(params: {
  qartModule: QArtModule;
  qartConfig: Record<string, unknown>;
  workerRenderConfig: Record<string, unknown>;
  targetImage: ImageData;
  originalResult: QArtWorkerResult;
  searchAttempts: number;
  rescueSeed: number;
  maskPattern: number | undefined;
  signal: AbortSignal;
  isRunCancelled: () => boolean;
}): Promise<QArtWorkerResult> {
  try {
    const rescueResult = await params.qartModule.generateQArtInWorker(
      {
        ...params.qartConfig,
        targetImage: params.targetImage,
        searchAttempts: params.searchAttempts,
        searchSeed: params.rescueSeed,
        maskPattern: params.maskPattern,
        performanceProfile: 'quality',
        renderConfig: params.workerRenderConfig,
        renderInWorker: true,
      } as Parameters<QArtModule['generateQArtInWorker']>[0],
      { signal: params.signal }
    );
    if (
      rescueResult.success &&
      rescueResult.matchPercentage > params.originalResult.matchPercentage + 0.75
    ) {
      if (
        params.originalResult.bitmap &&
        typeof params.originalResult.bitmap.close === 'function'
      ) {
        params.originalResult.bitmap.close();
      }
      log.info('QR-Art frame quality rescue accepted', {
        initialMatch: params.originalResult.matchPercentage,
        rescuedMatch: rescueResult.matchPercentage,
      });
      return rescueResult;
    }
    if (rescueResult.bitmap && typeof rescueResult.bitmap.close === 'function') {
      rescueResult.bitmap.close();
    }
  } catch (error_) {
    if (params.isRunCancelled()) throw error_;
    log.warn('QR-Art frame quality rescue failed; keeping initial frame result', {
      error: error_,
    });
  }
  return params.originalResult;
}

