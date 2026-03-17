let _queue: Promise<void> = Promise.resolve();
export const animatedRenderQueue = {
  get(): Promise<void> {
    return _queue;
  },
  set(value: Promise<void>): void {
    _queue = value;
  },
};
