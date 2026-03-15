import { generationCountState } from './generation-count-state';

export function resetGenerationCount(): void {
  generationCountState.value = 0;
}
