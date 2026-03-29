import { describe, it, expect, beforeEach, vi } from "vitest";
import { FakeProviderFailureSimulator } from "./fake-provider-failure-simulator";

describe("FakeProviderFailureSimulator", () => {
  let simulator: FakeProviderFailureSimulator;

  beforeEach(() => {
    vi.useFakeTimers();
    simulator = new FakeProviderFailureSimulator(360); // 360 second window
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("recordFailure", () => {
    it("should record provider failure", () => {
      simulator.recordFailure("provider1");
      expect(simulator.isFailed("provider1")).toBe(true);
    });

    it("should update failure timestamp on subsequent failures", () => {
      simulator.recordFailure("provider1");
      vi.advanceTimersByTime(100000); // 100 seconds
      simulator.recordFailure("provider1");
      expect(simulator.isFailed("provider1")).toBe(true);
    });
  });

  describe("isFailed", () => {
    it("should return false for provider with no failures", () => {
      expect(simulator.isFailed("unknown")).toBe(false);
    });

    it("should return true within failure window", () => {
      simulator.recordFailure("provider1");
      vi.advanceTimersByTime(100000); // 100 seconds (within 360s window)
      expect(simulator.isFailed("provider1")).toBe(true);
    });

    it("should return false after failure window expires", () => {
      simulator.recordFailure("provider1");
      vi.advanceTimersByTime(361000); // 361 seconds (beyond 360s window)
      expect(simulator.isFailed("provider1")).toBe(false);
    });

    it("should handle multiple providers independently", () => {
      simulator.recordFailure("provider1");
      vi.advanceTimersByTime(100000);
      simulator.recordFailure("provider2");
      expect(simulator.isFailed("provider1")).toBe(true);
      expect(simulator.isFailed("provider2")).toBe(true);
    });
  });

  describe("clearFailures", () => {
    it("should clear all provider failures", () => {
      simulator.recordFailure("provider1");
      simulator.recordFailure("provider2");
      simulator.clearFailures();
      expect(simulator.isFailed("provider1")).toBe(false);
      expect(simulator.isFailed("provider2")).toBe(false);
    });
  });

  describe("clearProviderFailure", () => {
    it("should clear specific provider failure", () => {
      simulator.recordFailure("provider1");
      simulator.recordFailure("provider2");
      simulator.clearProviderFailure("provider1");
      expect(simulator.isFailed("provider1")).toBe(false);
      expect(simulator.isFailed("provider2")).toBe(true);
    });

    it("should handle clearing non-existent provider", () => {
      simulator.clearProviderFailure("unknown");
      expect(simulator.isFailed("unknown")).toBe(false);
    });
  });

  describe("custom failure window", () => {
    it("should respect custom failure window", () => {
      const customSimulator = new FakeProviderFailureSimulator(10); // 10 second window
      customSimulator.recordFailure("provider1");
      vi.advanceTimersByTime(5000); // 5 seconds
      expect(customSimulator.isFailed("provider1")).toBe(true);
      vi.advanceTimersByTime(6000); // 11 seconds total
      expect(customSimulator.isFailed("provider1")).toBe(false);
    });
  });
});
