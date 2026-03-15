import type { RenderState } from './preview-types';

export function computeRenderingState(
  isPending: boolean,
  isRendering: boolean,
  isLoading: boolean,
  isPreparingAnimation: boolean
): RenderState {
  if (isPending) return 'pending';
  if (isRendering || isLoading || isPreparingAnimation) return 'rendering';
  return 'idle';
}
