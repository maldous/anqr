export let animatedRenderQueue: Promise<void> = Promise.resolve();
export function setAnimatedRenderQueue(value: Promise<void>): void {
  animatedRenderQueue = value;
}
