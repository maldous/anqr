export class FakeProviderFailureSimulator {
  private failures: Map<string, number> = new Map();
  private failureWindowMs: number;

  constructor(failureWindowSeconds: number = 360) {
    this.failureWindowMs = failureWindowSeconds * 1000;
  }

  recordFailure(providerName: string): void {
    this.failures.set(providerName, Date.now());
  }

  isFailed(providerName: string): boolean {
    const lastFailure = this.failures.get(providerName);
    if (!lastFailure) return false;
    return Date.now() - lastFailure < this.failureWindowMs;
  }

  clearFailures(): void {
    this.failures.clear();
  }

  clearProviderFailure(providerName: string): void {
    this.failures.delete(providerName);
  }
}
