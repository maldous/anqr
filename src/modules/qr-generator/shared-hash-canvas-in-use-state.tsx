let sharedHashCanvasInUse = false;

export function getSharedHashCanvasInUseState() {
  return sharedHashCanvasInUse;
}

export function setSharedHashCanvasInUseState(value: boolean) {
  sharedHashCanvasInUse = value;
}
