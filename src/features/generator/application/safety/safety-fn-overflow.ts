/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Handle QR content overflow with ECC fallback.
 */

import { createLogger } from '@/infra/logging/logger';
import type { QRGeneratorConfig } from '@/modules/qr-generator';
import { buildEccFallbackSequence } from '@/features/generator/application/safety/safety-fn-eccfallback';
import { tryEccFallbackGeneration } from '@/features/generator/application/safety/safety-fn-tryeccfallback';

const log = createLogger('QR');

export async function handleOverflowError(params: {
  effectiveConfig: Record<string, unknown>;
  debouncedConfigTypeNumber: number;
  runGeneratorWithStatus: (
    cfg: QRGeneratorConfig,
    overlaySource: HTMLCanvasElement | OffscreenCanvas | null
  ) => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
  yieldForResponsiveness: () => Promise<boolean>;
  overlayEnabled: boolean;
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null;
  lastOverflowContentRef: { current: string | null };
  isOverflowBlockedRef: { current: boolean };
  setHasOverflowError: (v: boolean) => void;
  setError: (v: string | null) => void;
  setIsRendering: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  clearGenerationProgress: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
}): Promise<{ result: HTMLCanvasElement | OffscreenCanvas | null; succeeded: boolean }> {
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
