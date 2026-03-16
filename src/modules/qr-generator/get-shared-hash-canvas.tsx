import { sharedHashCanvasState } from "./shared-hash-canvas-state";

export function getSharedHashCanvas() {
  return sharedHashCanvasState.current;
}
