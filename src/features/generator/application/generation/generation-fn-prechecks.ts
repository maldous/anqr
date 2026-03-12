/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Pre-generation overflow and block checks.
 */

import { createLogger } from '@/infra/logging/logger';
import { checkOverflowContentChanged } from '@/features/generator/application/generation/generation-fn-checkoverflow';

const log = createLogger('QR');

export function handleGeneratePreChecks(params: {
  lastOverflowContentRef: { current: string | null };
  isOverflowBlockedRef: { current: boolean };
  content: string | undefined;
  setHasOverflowError: (v: boolean) => void;
  setError: (v: string | null) => void;
  clearGenerationProgress: () => void;
}): { shouldAbort: boolean } {
  if (checkOverflowContentChanged(params.lastOverflowContentRef.current, params.content)) {
    log.debug('Content changed from failed content, clearing block');
    params.lastOverflowContentRef.current = null;
    params.isOverflowBlockedRef.current = false;
    params.setHasOverflowError(false);
    params.setError(null);
  }
  if (params.isOverflowBlockedRef.current) {
    log.debug('generate BLOCKED by overflow ref');
    params.clearGenerationProgress();
    return { shouldAbort: true };
  }
  return { shouldAbort: false };
}
