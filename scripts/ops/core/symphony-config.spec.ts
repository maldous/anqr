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
  // @ts-expect-error -- .mjs has no declaration file
} from "./symphony-config.mjs";

describe("symphony-config.mjs", () => {
  describe("queue targets", () => {
    it("should have TARGET_MIN = 1", () => {
      expect(TARGET_MIN).toBe(1);
    });
    it("should have TARGET_MAX = 8", () => {
      expect(TARGET_MAX).toBe(8);
    });
    it("should allow up to 8 concurrent agents", () => {
      expect(MAX_CONCURRENT_AGENTS).toBe(8);
    });
  });

  describe("timeouts and thresholds", () => {
    it("should have STALE_THRESHOLD_MS = 30 min", () => {
      expect(STALE_THRESHOLD_MS).toBe(30 * 60 * 1000);
    });
    it("should have TASK_TIMEOUT_MS = 25 min", () => {
      expect(TASK_TIMEOUT_MS).toBe(25 * 60 * 1000);
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
      expect(REQUIRED_LABEL_IDS.length).toBeGreaterThan(0);
      // REQUIRED_LABEL_IDS contains Linear label UUIDs (e.g. LABELS.harness)
      expect(typeof REQUIRED_LABEL_IDS[0]).toBe("string");
      expect(REQUIRED_LABEL_IDS[0].length).toBeGreaterThan(10);
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
      expect(RUNNER_OLLAMA_MODEL).toBe("qwen2.5-coder:3b-instruct");
    });
    it("should have multiple Ollama models", () => {
      expect(RUNNER_OLLAMA_MODELS).toContain("qwen2.5-coder:3b-instruct");
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
    it("should have auto push disabled (until stability restored)", () => {
      expect(RUNNER_AUTO_PUSH).toBe(false);
    });
    it("should have turn budget warning threshold", () => {
      expect(RUNNER_TURN_BUDGET_WARNING).toBe(5);
    });
    it("should have validation fix limits", () => {
      expect(RUNNER_MAX_VALIDATION_FIXES).toBe(3);
      expect(RUNNER_VALIDATION_FIX_TURNS).toBe(20);
    });
  });
});
