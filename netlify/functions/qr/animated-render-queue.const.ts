let animatedRenderQueue: Promise<void> = Promise.resolve();
export function getAnimatedRenderQueue(): Promise<void> {
  return animatedRenderQueue;
}
export function setAnimatedRenderQueue(value: Promise<void>): void {
  animatedRenderQueue = value;
}
