import { describe, it, expect } from "vitest";
import {
  TARGET_MIN,
  TARGET_MAX,
  MAX_CONCURRENT_AGENTS,
  STALE_THRESHOLD_MS,
  TASK_TIMEOUT_MS,
  TITLE_PREFIX,
  REQUIRED_LABEL_IDS,
  QUEUE_STATES,
  RUNNER_MAX_TURNS,
  RUNNER_MAX_EXECUTION_MS,
  RUNNER_MAX_RETRIES,
  RUNNER_OLLAMA_MODEL,
  RUNNER_OLLAMA_MODELS,
  RUNNER_OLLAMA_BASE_URL,
  RUNNER_MAX_OUTPUT_TOKENS,
  RUNNER_PROVIDER_FAILURE_WINDOW_SECS,
  RUNNER_PAID_PROVIDER_FAILURE_WINDOW_SECS,
  RUNNER_AUTO_PUSH,
  RUNNER_STUCK_THRESHOLD_MS,
  RUNNER_TURN_BUDGET_WARNING,
  RUNNER_MAX_VALIDATION_FIXES,
  RUNNER_VALIDATION_FIX_TURNS,
  RUNNER_ISSUE_COOLDOWN_MS,
} from "./symphony-config.mjs";

describe("symphony-config.mjs", () => {
  describe("queue targets", () => {
    it("should have TARGET_MIN = 1", () => {
      expect(TARGET_MIN).toBe(1);
    });
    it("should have TARGET_MAX = 2", () => {
      expect(TARGET_MAX).toBe(2);
    });
    it("should allow only one concurrent agent", () => {
      expect(MAX_CONCURRENT_AGENTS).toBe(1);
    });
  });

  describe("timeouts and thresholds", () => {
    it("should have STALE_THRESHOLD_MS = 30 min", () => {
      expect(STALE_THRESHOLD_MS).toBe(30 * 60 * 1000);
    });
    it("should have TASK_TIMEOUT_MS = 20 min", () => {
      expect(TASK_TIMEOUT_MS).toBe(20 * 60 * 1000);
    });
    it("should have RUNNER_STUCK_THRESHOLD_MS = 15 min", () => {
      expect(RUNNER_STUCK_THRESHOLD_MS).toBe(15 * 60 * 1000);
    });
    it("should have RUNNER_ISSUE_COOLDOWN_MS = 10 min", () => {
      expect(RUNNER_ISSUE_COOLDOWN_MS).toBe(10 * 60 * 1000);
    });
  });

  describe("linear integration", () => {
    it("should have TITLE_PREFIX = 'Harness'", () => {
      expect(TITLE_PREFIX).toBe("Harness");
    });
    it("should require harness label", () => {
      expect(REQUIRED_LABEL_IDS).toContain("harness");
    });
    it("should define QUEUE_STATES with expected keys", () => {
      expect(QUEUE_STATES).toHaveProperty("feedSource");
      expect(QUEUE_STATES).toHaveProperty("activeStates");
      expect(QUEUE_STATES).toHaveProperty("readyStates");
      expect(Array.isArray(QUEUE_STATES.feedSource)).toBe(true);
      expect(Array.isArray(QUEUE_STATES.activeStates)).toBe(true);
      expect(Array.isArray(QUEUE_STATES.readyStates)).toBe(true);
    });
  });

  describe("runner configuration", () => {
    it("should have RUNNER_MAX_TURNS = 600", () => {
      expect(RUNNER_MAX_TURNS).toBe(600);
    });
    it("should have RUNNER_MAX_EXECUTION_MS = 120 min", () => {
      expect(RUNNER_MAX_EXECUTION_MS).toBe(7_200_000);
    });
    it("should have RUNNER_MAX_RETRIES = 2", () => {
      expect(RUNNER_MAX_RETRIES).toBe(2);
    });
    it("should have default Ollama model defined", () => {
      expect(RUNNER_OLLAMA_MODEL).toBe("qwen3-coder-next:latest");
    });
    it("should have multiple Ollama models", () => {
      expect(RUNNER_OLLAMA_MODELS).toContain("qwen3-coder-next:latest");
      expect(RUNNER_OLLAMA_MODELS.length).toBeGreaterThanOrEqual(2);
    });
    it("should have Ollama base URL", () => {
      expect(RUNNER_OLLAMA_BASE_URL).toBe("http://localhost:11434/v1");
    });
    it("should have token limit", () => {
      expect(RUNNER_MAX_OUTPUT_TOKENS).toBe(4096);
    });
    it("should have provider failure windows", () => {
      expect(RUNNER_PROVIDER_FAILURE_WINDOW_SECS).toBe(360);
      expect(RUNNER_PAID_PROVIDER_FAILURE_WINDOW_SECS).toBe(120);
    });
    it("should have auto push enabled", () => {
      expect(RUNNER_AUTO_PUSH).toBe(true);
    });
    it("should have turn budget warning threshold", () => {
      expect(RUNNER_TURN_BUDGET_WARNING).toBe(5);
    });
    it("should have validation fix limits", () => {
      expect(RUNNER_MAX_VALIDATION_FIXES).toBe(2);
      expect(RUNNER_VALIDATION_FIX_TURNS).toBe(20);
    });
  });
});
