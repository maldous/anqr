/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Class that manages yield timing for long-running operations.
 */

import { yieldToMainThread } from '@/features/generator/application/generation/generation-fn-yield';

const YIELD_INTERVAL_MS = 16;

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
