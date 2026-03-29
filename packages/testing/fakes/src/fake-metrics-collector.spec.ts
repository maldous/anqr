import { describe, it, expect, beforeEach } from "vitest";
import { FakeMetricsCollector } from "./fake-metrics-collector";

describe("FakeMetricsCollector", () => {
  let collector: FakeMetricsCollector;

  beforeEach(() => {
    collector = new FakeMetricsCollector();
  });

  describe("recordMetric", () => {
    it("should record single metric", () => {
      collector.recordMetric("test", 100);
      expect(collector.getMetrics("test")).toEqual([100]);
    });

    it("should record multiple values for same metric", () => {
      collector.recordMetric("test", 100);
      collector.recordMetric("test", 200);
      collector.recordMetric("test", 300);
      expect(collector.getMetrics("test")).toEqual([100, 200, 300]);
    });

    it("should keep metrics separate by name", () => {
      collector.recordMetric("metric1", 100);
      collector.recordMetric("metric2", 200);
      expect(collector.getMetrics("metric1")).toEqual([100]);
      expect(collector.getMetrics("metric2")).toEqual([200]);
    });
  });

  describe("getMetrics", () => {
    it("should return empty array for unknown metric", () => {
      expect(collector.getMetrics("unknown")).toEqual([]);
    });

    it("should return all recorded values", () => {
      collector.recordMetric("response_time", 100);
      collector.recordMetric("response_time", 150);
      collector.recordMetric("response_time", 200);
      expect(collector.getMetrics("response_time")).toEqual([100, 150, 200]);
    });
  });

  describe("getAverage", () => {
    it("should calculate average of recorded values", () => {
      collector.recordMetric("test", 100);
      collector.recordMetric("test", 200);
      collector.recordMetric("test", 300);
      expect(collector.getAverage("test")).toBe(200);
    });

    it("should return 0 for unknown metric", () => {
      expect(collector.getAverage("unknown")).toBe(0);
    });

    it("should return 0 for empty metrics", () => {
      expect(collector.getAverage("test")).toBe(0);
    });

    it("should handle single value", () => {
      collector.recordMetric("test", 42);
      expect(collector.getAverage("test")).toBe(42);
    });
  });

  describe("getSum", () => {
    it("should calculate sum of recorded values", () => {
      collector.recordMetric("test", 10);
      collector.recordMetric("test", 20);
      collector.recordMetric("test", 30);
      expect(collector.getSum("test")).toBe(60);
    });

    it("should return 0 for unknown metric", () => {
      expect(collector.getSum("unknown")).toBe(0);
    });

    it("should handle single value", () => {
      collector.recordMetric("test", 100);
      expect(collector.getSum("test")).toBe(100);
    });
  });

  describe("reset", () => {
    it("should clear all metrics", () => {
      collector.recordMetric("metric1", 100);
      collector.recordMetric("metric2", 200);
      collector.reset();
      expect(collector.getMetrics("metric1")).toEqual([]);
      expect(collector.getMetrics("metric2")).toEqual([]);
    });

    it("should allow recording after reset", () => {
      collector.recordMetric("test", 100);
      collector.reset();
      collector.recordMetric("test", 200);
      expect(collector.getMetrics("test")).toEqual([200]);
    });
  });
});
