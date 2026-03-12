/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Setup post-generation validation runner.
 */

import { createLogger } from '@/infra/logging/logger';
import type { ValidationResult } from '@/domain/qr/analyze/scanner';
import { validateInWorker } from '@/modules/qr-analyzer';

const log = createLogger('QR');


export function setupValidationRunner(params: {
  requestId: number;
  animationFrameCount: number;
  hasMultipleSourceFramesRef: { current: boolean };
  animationPlaying: boolean;
  setIsValidating: (v: boolean) => void;
  setValidation: (v: ValidationResult | null) => void;
  generationRequestIdRef: { current: number };
}): (
  renderedCanvas: HTMLCanvasElement | OffscreenCanvas,
  expectedContent: string | undefined
) => void {
  return (
    renderedCanvas: HTMLCanvasElement | OffscreenCanvas,
    expectedContent: string | undefined
  ): void => {
    const isCurrentlyAnimating =
      (params.animationFrameCount > 1 || params.hasMultipleSourceFramesRef.current) &&
      params.animationPlaying;
    const shouldValidate = Boolean(expectedContent) && !isCurrentlyAnimating;
    if (!shouldValidate) return;

    const validationRequestId = params.requestId;
    params.setIsValidating(true);
    const validationDelay = 120;
    setTimeout(() => {
      if (params.generationRequestIdRef.current !== validationRequestId) {
        params.setIsValidating(false);
        return;
      }
      validateInWorker(renderedCanvas, expectedContent, 2)
        .then((validationResult) => {
          if (params.generationRequestIdRef.current === validationRequestId) {
            params.setValidation(validationResult);
          }
        })
        .catch((err) => {
          log.error('Validation error', { error: err });
          if (params.generationRequestIdRef.current === validationRequestId) {
            params.setValidation(null);
          }
        })
        .finally(() => {
          params.setIsValidating(false);
        });
    }, validationDelay);
  };
}

