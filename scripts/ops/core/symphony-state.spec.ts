import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync, existsSync } from "node:fs";
import { resolve } from "node:path";
// @ts-expect-error - No type declarations for .mjs module
import {
  recordCompletion,
  getLatencyMetrics,
  checkLatencyBaseline,
  patchIssueState,
  getIssueState,
  setGlobalValue,
  getGlobalValue,
} from "./symphony-state.mjs";

const TEST_STATE_DIR = resolve(process.cwd(), "reports", "symphony-test");

describe("symphony-state.mjs latency tracking", () => {
  beforeEach(() => {
    // Use test-specific state directory
    process.env.ANQR_SYMPHONY_STATE_DIR = TEST_STATE_DIR;
    if (existsSync(TEST_STATE_DIR)) {
      rmSync(TEST_STATE_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_STATE_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_STATE_DIR)) {
      rmSync(TEST_STATE_DIR, { recursive: true, force: true });
    }
    delete process.env.ANQR_SYMPHONY_STATE_DIR;
  });

  describe("recordCompletion", () => {
    it("should record completion timestamp and latency", () => {
      const issueId = "ANQ-123";
      const latencyMs = 600000; // 10 minutes

      recordCompletion(issueId, { latencyMs });

      const state = getIssueState(issueId);
      expect(state.latency_ms).toBe(latencyMs);
      expect(state.completed_at).toBeTruthy();
    });

    it("should allow custom completion timestamp", () => {
      const issueId = "ANQ-124";
      const customTimestamp = "2026-03-27T12:00:00.000Z";

      recordCompletion(issueId, {
        latencyMs: 300000,
        completedAt: customTimestamp,
      });

      const state = getIssueState(issueId);
      expect(state.completed_at).toBe(customTimestamp);
    });
  });

  describe("getLatencyMetrics", () => {
    it("should return null metrics when no completed tasks", () => {
      const metrics = getLatencyMetrics();

      expect(metrics.count).toBe(0);
      expect(metrics.averageMs).toBeNull();
      expect(metrics.medianMs).toBeNull();
      expect(metrics.p95Ms).toBeNull();
    });

    it("should calculate average latency correctly", () => {
      recordCompletion("ANQ-101", { latencyMs: 600000 }); // 10 min
      recordCompletion("ANQ-102", { latencyMs: 1200000 }); // 20 min
      recordCompletion("ANQ-103", { latencyMs: 900000 }); // 15 min

      const metrics = getLatencyMetrics();

      expect(metrics.count).toBe(3);
      expect(metrics.averageMs).toBe(900000); // (10+20+15)/3 = 15 min
      expect(metrics.minMs).toBe(600000);
      expect(metrics.maxMs).toBe(1200000);
    });

    it("should calculate median correctly with odd count", () => {
      recordCompletion("ANQ-201", { latencyMs: 300000 }); // 5 min
      recordCompletion("ANQ-202", { latencyMs: 600000 }); // 10 min
      recordCompletion("ANQ-203", { latencyMs: 900000 }); // 15 min

      const metrics = getLatencyMetrics();

      expect(metrics.medianMs).toBe(600000); // Middle value
    });

    it("should calculate p95 correctly", () => {
      // Create 100 tasks with latencies from 1-100 minutes
      for (let i = 1; i <= 100; i++) {
        recordCompletion(`ANQ-${i}`, { latencyMs: i * 60000 });
      }

      const metrics = getLatencyMetrics();

      expect(metrics.count).toBe(100);
      expect(metrics.p95Ms).toBe(95 * 60000); // 95th percentile
    });

    it("should ignore incomplete tasks", () => {
      recordCompletion("ANQ-301", { latencyMs: 600000 });
      patchIssueState("ANQ-302", { latency_ms: 900000 }); // No completed_at

      const metrics = getLatencyMetrics();

      expect(metrics.count).toBe(1);
      expect(metrics.averageMs).toBe(600000);
    });
  });

  describe("checkLatencyBaseline", () => {
    it("should establish baseline on first check", () => {
      const currentAvg = 600000; // 10 min

      const result = checkLatencyBaseline(currentAvg);

      expect(result.alert).toBe(false);
      expect(result.increase).toBe(0);
      expect(result.baseline).toBe(currentAvg);
      expect(getGlobalValue("latency.baseline_ms")).toBe(currentAvg);
    });

    it("should not alert when latency within acceptable range", () => {
      setGlobalValue("latency.baseline_ms", 600000); // 10 min baseline

      const result = checkLatencyBaseline(750000); // 12.5 min (+25%)

      expect(result.alert).toBe(false);
      expect(result.increase).toBe(25);
    });

    it("should alert when latency increases >50%", () => {
      setGlobalValue("latency.baseline_ms", 600000); // 10 min baseline

      const result = checkLatencyBaseline(1000000); // 16.67 min (+66%)

      expect(result.alert).toBe(true);
      expect(result.increase).toBeGreaterThan(50);
      expect(result.current).toBe(1000000);
      expect(result.baseline).toBe(600000);
    });

    it("should alert at exactly 50% increase threshold", () => {
      setGlobalValue("latency.baseline_ms", 600000); // 10 min baseline

      const result = checkLatencyBaseline(900000); // 15 min (+50%)

      expect(result.alert).toBe(false); // Should be false at exactly 50%
    });

    it("should alert just above 50% threshold", () => {
      setGlobalValue("latency.baseline_ms", 600000); // 10 min baseline

      const result = checkLatencyBaseline(900001); // Just over 50%

      expect(result.alert).toBe(true);
    });
  });
});
