/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Cleanup generation state after completion.
 */

import { dispatchRenderCompleteEvent } from '@/features/generator/application/generation/generation-fn-dispatchevent';

export function cleanupGenerateState(params: {
  activeQArtRequestAbortRef: { current: AbortController | null };
  qartAbortController: AbortController;
  isStaleRequest: () => boolean;
  setIsRendering: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  clearGenerationProgress: () => void;
  error: string | null;
}): void {
  if (params.activeQArtRequestAbortRef.current === params.qartAbortController) {
    params.activeQArtRequestAbortRef.current = null;
  }
  if (!params.isStaleRequest()) {
    params.setIsRendering(false);
    params.setIsLoading(false);
    params.clearGenerationProgress();
    if (!params.error) {
      dispatchRenderCompleteEvent(true);
    }
  }
}
