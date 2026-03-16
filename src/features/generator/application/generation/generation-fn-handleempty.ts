/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Handle empty content edge case.
 */

import { clearDisplayCanvas } from "@/features/generator/application/generation/generation-fn-cleardisplay";

export function handleEmptyContent(params: {
  trimmedContent: string;
  isStaleRequest: () => boolean;
  setCanvas: (c: HTMLCanvasElement | OffscreenCanvas | null) => void;
  setError: (v: string | null) => void;
  setIsLoading: (v: boolean) => void;
  setIsRendering: (v: boolean) => void;
  clearGenerationProgress: () => void;
  canvasRef: { current: HTMLCanvasElement | null };
}): { handled: boolean } {
  if (params.trimmedContent) return { handled: false };
  if (params.isStaleRequest()) return { handled: true };
  params.setCanvas(null);
  params.setError(null);
  params.setIsLoading(false);
  params.setIsRendering(false);
  params.clearGenerationProgress();
  clearDisplayCanvas(params.canvasRef.current);
  return { handled: true };
}
