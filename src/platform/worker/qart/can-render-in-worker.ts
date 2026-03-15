export function canRenderInWorker(): boolean {
  return typeof OffscreenCanvas !== 'undefined';
}
