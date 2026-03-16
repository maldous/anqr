import { sharedHashCanvasInUseState } from "./shared-hash-canvas-in-use-state";

export function setSharedHashCanvasInUse(value: boolean) {
  sharedHashCanvasInUseState.current = value;
}
