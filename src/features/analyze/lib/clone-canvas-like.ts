export function cloneCanvasLike(source: HTMLCanvasElement | OffscreenCanvas): HTMLCanvasElement {
  const snapshot = document.createElement('canvas');
  snapshot.width = source.width;
  snapshot.height = source.height;
  const ctx = snapshot.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to create canvas snapshot for analysis');
  }

  ctx.drawImage(source as CanvasImageSource, 0, 0);
  return snapshot;
}
