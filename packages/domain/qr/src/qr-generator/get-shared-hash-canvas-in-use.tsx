import { sharedHashCanvasInUseState } from "./shared-hash-canvas-in-use-state";

export function getSharedHashCanvasInUse() {
  return sharedHashCanvasInUseState.current;
}
