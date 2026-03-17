import { getAnimatedRenderQueue, setAnimatedRenderQueue } from "./animated-render-queue.const";

export async function acquireAnimatedRenderLock(): Promise<() => void> {
  let release: (() => void) | null = null;
  const waitTurn = getAnimatedRenderQueue();
  setAnimatedRenderQueue(
    new Promise<void>((resolve) => {
      release = resolve;
    }),
  );
  await waitTurn;
  return () => {
    if (release) {
      release();
      release = null;
    }
  };
}
