import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const TEST_STATE_DIR = path.resolve(PROJECT_ROOT, "reports", "adaptive-params-test");

// Set env before imports so modules pick up the test directory
process.env.ANQR_BRIDGE_STATE_DIR = TEST_STATE_DIR;

const { DEFAULT_ADAPTIVE_PARAMS } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/default-adaptive-params.mjs"
);

// Use module namespace objects for live bindings
const paramsMod = await import(
  "../../harness/ops/integrations/model/symphony-session-state/params-cache.mjs"
);

const { getAdaptiveParams } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/get-adaptive-params.mjs"
);

const { getProviderTurnLimit } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/get-provider-turn-limit.mjs"
);

const { shouldTriggerEvalCycle } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/should-trigger-eval-cycle.mjs"
);

afterAll(() => {
  try {
    if (fs.existsSync(TEST_STATE_DIR)) fs.rmSync(TEST_STATE_DIR, { recursive: true });
  } catch {
    // ignore
  }
  delete process.env.ANQR_BRIDGE_STATE_DIR;
});

describe("DEFAULT_ADAPTIVE_PARAMS", () => {
  it("has freeTurnLimit with base, min, and max", () => {
    expect(DEFAULT_ADAPTIVE_PARAMS.freeTurnLimit.base).toBeDefined();
    expect(DEFAULT_ADAPTIVE_PARAMS.freeTurnLimit.min).toBeDefined();
    expect(DEFAULT_ADAPTIVE_PARAMS.freeTurnLimit.max).toBeDefined();
  });

  it("has evalCycle with thresholds", () => {
    expect(DEFAULT_ADAPTIVE_PARAMS.evalCycle.requestThreshold).toBeDefined();
    expect(DEFAULT_ADAPTIVE_PARAMS.evalCycle.timeThreshold).toBeDefined();
  });

  it("min <= base <= max for freeTurnLimit", () => {
    const { min, base, max } = DEFAULT_ADAPTIVE_PARAMS.freeTurnLimit;
    expect(min).toBeLessThanOrEqual(base);
    expect(base).toBeLessThanOrEqual(max);
  });

  it("samplingRate has a base value", () => {
    expect(DEFAULT_ADAPTIVE_PARAMS.samplingRate.base).toBeGreaterThan(0);
  });

  it("tuningInterval is positive", () => {
    expect(DEFAULT_ADAPTIVE_PARAMS.tuningInterval).toBeGreaterThan(0);
  });
});

describe("getProviderTurnLimit", () => {
  beforeEach(() => {
    // Reset params cache to defaults before each test
    paramsMod.setParamsCache(null);
    // Ensure state dir exists
    if (!fs.existsSync(TEST_STATE_DIR)) {
      fs.mkdirSync(TEST_STATE_DIR, { recursive: true, mode: 0o700 });
    }
    // Remove any saved params
    const paramsFile = path.join(TEST_STATE_DIR, "adaptive-params.json");
    if (fs.existsSync(paramsFile)) fs.unlinkSync(paramsFile);
  });

  it("returns base turn limit when no provider-specific override", () => {
    const limit = getProviderTurnLimit("unknown-provider");
    expect(limit).toBe(DEFAULT_ADAPTIVE_PARAMS.freeTurnLimit.base);
  });

  it("returns provider-specific turn limit when set", () => {
    // Get params, set a per-provider override, save
    const params = getAdaptiveParams();
    params.freeTurnLimit.perProvider["test-provider"] = 15;
    paramsMod.setParamsCache(params);

    const limit = getProviderTurnLimit("test-provider");
    expect(limit).toBe(15);
  });

  it("falls back to base for provider not in perProvider map", () => {
    const params = getAdaptiveParams();
    params.freeTurnLimit.perProvider["other-provider"] = 20;
    paramsMod.setParamsCache(params);

    const limit = getProviderTurnLimit("missing-provider");
    expect(limit).toBe(DEFAULT_ADAPTIVE_PARAMS.freeTurnLimit.base);
  });
});

describe("shouldTriggerEvalCycle", () => {
  beforeEach(() => {
    // Reset params cache to a fresh copy of defaults before each test
    paramsMod.setParamsCache(structuredClone(DEFAULT_ADAPTIVE_PARAMS));
    // Ensure state dir exists
    if (!fs.existsSync(TEST_STATE_DIR)) {
      fs.mkdirSync(TEST_STATE_DIR, { recursive: true, mode: 0o700 });
    }
    // Remove any saved params
    const paramsFile = path.join(TEST_STATE_DIR, "adaptive-params.json");
    if (fs.existsSync(paramsFile)) fs.unlinkSync(paramsFile);
    const lockFile = `${paramsFile}.lock`;
    if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
  });

  it("returns false when below request threshold and time threshold", () => {
    const params = getAdaptiveParams();
    params.evalCycle.counter = 0;
    params.evalCycle.lastEval = Date.now();
    paramsMod.setParamsCache(params);

    expect(shouldTriggerEvalCycle()).toBe(false);
  });

  it("returns true when request threshold is reached", () => {
    const params = getAdaptiveParams();
    params.evalCycle.counter = params.evalCycle.requestThreshold - 1;
    params.evalCycle.lastEval = Date.now();
    paramsMod.setParamsCache(params);

    expect(shouldTriggerEvalCycle()).toBe(true);
  });

  it("returns true when time threshold has elapsed", () => {
    const params = getAdaptiveParams();
    params.evalCycle.counter = 0;
    params.evalCycle.lastEval = Date.now() - params.evalCycle.timeThreshold - 1000;
    paramsMod.setParamsCache(params);

    expect(shouldTriggerEvalCycle()).toBe(true);
  });

  it("resets counter and lastEval after triggering", () => {
    const params = getAdaptiveParams();
    params.evalCycle.counter = params.evalCycle.requestThreshold - 1;
    const oldLastEval = Date.now() - params.evalCycle.timeThreshold - 1000;
    params.evalCycle.lastEval = oldLastEval;
    paramsMod.setParamsCache(params);

    shouldTriggerEvalCycle();

    const updated = getAdaptiveParams();
    expect(updated.evalCycle.counter).toBe(0);
    expect(updated.evalCycle.lastEval).toBeGreaterThan(oldLastEval);
  });

  it("increments counter even when not triggering", () => {
    const params = getAdaptiveParams();
    params.evalCycle.counter = 5;
    params.evalCycle.lastEval = Date.now();
    paramsMod.setParamsCache(params);

    shouldTriggerEvalCycle();

    const updated = getAdaptiveParams();
    expect(updated.evalCycle.counter).toBe(6);
  });
});
