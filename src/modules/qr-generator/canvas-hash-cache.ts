// WeakMap for canvas hash caching (avoids re-hashing same canvas)
export const canvasHashCache = new WeakMap<HTMLCanvasElement, string>();
