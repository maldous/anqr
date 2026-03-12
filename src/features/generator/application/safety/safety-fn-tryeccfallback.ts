/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Try generating with fallback ECC levels.
 */

import { createLogger } from '@/infra/logging/logger';
import type { QRGeneratorConfig } from '@/modules/qr-generator';

const log = createLogger('QR');


export async function tryEccFallbackGeneration(params: {
  effectiveConfig: Record<string, unknown>;
  eccToTry: readonly ('H' | 'Q' | 'M' | 'L')[];
  runGeneratorWithStatus: (
    cfg: QRGeneratorConfig,
    overlaySource: HTMLCanvasElement | OffscreenCanvas | null
  ) => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
  yieldForResponsiveness: () => Promise<boolean>;
  overlayEnabled: boolean;
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null;
  currentEcc: string;
}): Promise<{ result: HTMLCanvasElement | OffscreenCanvas | null; succeeded: boolean }> {
  let result: HTMLCanvasElement | OffscreenCanvas | null = null;
  for (const ecc of params.eccToTry) {
    const fallbackConfig = {
      ...params.effectiveConfig,
      typeNumber: 0,
      errorCorrection: ecc,
    };
    try {
      log.debug('Trying ECC level', { ecc });
      if (await params.yieldForResponsiveness()) return { result: null, succeeded: false };
      result = await params.runGeneratorWithStatus(
        fallbackConfig as QRGeneratorConfig,
        params.overlayEnabled ? params.overlayCanvas : null
      );
      log.debug('ECC fallback succeeded', { ecc });
      if (ecc === params.currentEcc) {
        log.info('QR generated with auto-version retry');
      } else {
        log.info('QR generated with fallback ECC', { ecc, previousEcc: params.currentEcc });
      }
      return { result, succeeded: true };
    } catch (error_) {
      log.debug('ECC fallback failed', {
        ecc,
        error: error_ instanceof Error ? error_.message : error_,
      });
    }
  }
  return { result: null, succeeded: false };
}

