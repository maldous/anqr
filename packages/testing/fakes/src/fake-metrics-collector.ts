export class FakeMetricsCollector {
  private metrics: Map<string, number[]> = new Map();

  recordMetric(name: string, value: number): void {
    const existing = this.metrics.get(name) || [];
    existing.push(value);
    this.metrics.set(name, existing);
  }

  getMetrics(name: string): number[] {
    return this.metrics.get(name) || [];
  }

  getAverage(name: string): number {
    const values = this.getMetrics(name);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  getSum(name: string): number {
    const values = this.getMetrics(name);
    return values.reduce((a, b) => a + b, 0);
  }

  reset(): void {
    this.metrics.clear();
  }
}
