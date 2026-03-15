import { generationCountState } from './generation-count-state';

export function getGenerationCount(): number {
  return generationCountState.value;
}
