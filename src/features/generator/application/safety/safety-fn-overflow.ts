/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Handle QR content overflow with ECC fallback.
 */

import { createLogger } from '@/infra/logging/logger';
import { buildEccFallbackSequence } from '@/features/generator/application/safety/safety-fn-eccfallback';
import { tryEccFallbackGeneration } from '@/features/generator/application/safety/safety-fn-tryeccfallback';
import type { OverflowResult } from './overflow-result';
import type { SafetyRunnerParams } from './safety-runner-params';

const log = createLogger('QR');

export async function handleOverflowError(
  params: SafetyRunnerParams & {
    debouncedConfigTypeNumber: number;
  }
): Promise<OverflowResult> {
  const currentEcc = (params.effectiveConfig.errorCorrection as string) || 'H';
  const eccToTry = buildEccFallbackSequence(currentEcc, params.debouncedConfigTypeNumber);

  log.debug('Trying ECC fallback sequence', { eccToTry, currentEcc });
  const fallbackResult = await tryEccFallbackGeneration({
    effectiveConfig: params.effectiveConfig,
    eccToTry,
    runGeneratorWithStatus: params.runGeneratorWithStatus,
    yieldForResponsiveness: params.yieldForResponsiveness,
    overlayEnabled: params.overlayEnabled,
    overlayCanvas: params.overlayCanvas,
    currentEcc,
  });

  if (fallbackResult.succeeded) {
    return { result: fallbackResult.result, succeeded: true };
  }

  log.debug('All ECC levels failed', {
    contentLength: (params.effectiveConfig.content as string)?.length,
    contentPreview: (params.effectiveConfig.content as string)?.substring(0, 100),
    triedEccLevels: eccToTry,
  });
  params.lastOverflowContentRef.current = params.effectiveConfig.content as string;
  params.isOverflowBlockedRef.current = true;
  params.setHasOverflowError(true);
  params.setError(
    params.t(
      'errors.contentTooLongForQr',
      'Content too long for QR code. Please shorten your content or use a URL shortener.'
    )
  );
  params.setIsRendering(false);
  params.setIsLoading(false);
  params.clearGenerationProgress();
  return { result: null, succeeded: false };
}
