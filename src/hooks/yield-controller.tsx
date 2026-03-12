import { YIELD_INTERVAL_MS } from './yield-interval-ms';
import { yieldToMainThread } from './yield-to-main-thread';

/**
 * Time-based yield checker for batched operations
 * Returns true if enough time has passed that we should yield
 */
export class YieldController {
  private lastYieldTime: number = 0;

  reset(): void {
    this.lastYieldTime = performance.now();
  }

  shouldYield(): boolean {
    const now = performance.now();
    if (now - this.lastYieldTime >= YIELD_INTERVAL_MS) {
      return true;
    }
    return false;
  }

  async yieldIfNeeded(): Promise<boolean> {
    if (this.shouldYield()) {
      await yieldToMainThread(8); // Short timeout for responsive yielding
      this.lastYieldTime = performance.now();
      return true;
    }
    return false;
  }
}
