import { MAX_CONTEXT_DEPTH } from './logger-state';

export function maxDepthRedaction(depth: number): unknown | null {
  return depth > MAX_CONTEXT_DEPTH ? '[MAX_DEPTH]' : null;
}
