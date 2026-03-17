import { MAX_CONTEXT_DEPTH } from "./logger-state";

export function maxDepthRedaction(depth: number): null | string {
  return depth > MAX_CONTEXT_DEPTH ? "[MAX_DEPTH]" : null;
}
