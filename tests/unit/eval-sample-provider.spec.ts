import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const TEST_STATE_DIR = path.resolve(PROJECT_ROOT, "reports", "eval-sample-provider-test");

// Set env before imports so modules pick up the test directory
process.env.ANQR_BRIDGE_STATE_DIR = TEST_STATE_DIR;

const { DEFAULT_ADAPTIVE_PARAMS } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/default-adaptive-params.mjs"
);

const paramsMod = await import(
  "../../harness/ops/integrations/model/symphony-session-state/params-cache.mjs"
);

const { getAdaptiveParams } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/get-adaptive-params.mjs"
);

const { getEvaluationSampleProvider } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/get-evaluation-sample-provider.mjs"
);

afterAll(() => {
  try {
    if (fs.existsSync(TEST_STATE_DIR)) fs.rmSync(TEST_STATE_DIR, { recursive: true });
  } catch {
    // ignore
  }
  delete process.env.ANQR_BRIDGE_STATE_DIR;
});

describe("getEvaluationSampleProvider", () => {
  beforeEach(() => {
    paramsMod.setParamsCache(structuredClone(DEFAULT_ADAPTIVE_PARAMS));
    if (!fs.existsSync(TEST_STATE_DIR)) {
      fs.mkdirSync(TEST_STATE_DIR, { recursive: true, mode: 0o700 });
    }
    const paramsFile = path.join(TEST_STATE_DIR, "adaptive-params.json");
    if (fs.existsSync(paramsFile)) fs.unlinkSync(paramsFile);
    const lockFile = `${paramsFile}.lock`;
    if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
  });

  it("returns null when eval cycle should not trigger", () => {
    const params = getAdaptiveParams();
    params.evalCycle.counter = 0;
    params.evalCycle.lastEval = Date.now();
    paramsMod.setParamsCache(params);

    const result = getEvaluationSampleProvider(["provider-a"], {});
    expect(result).toBeNull();
  });

  it("returns undefined when eval cycle triggers but provider list is empty", () => {
    const params = getAdaptiveParams();
    params.evalCycle.counter = params.evalCycle.requestThreshold;
    params.evalCycle.lastEval = Date.now();
    paramsMod.setParamsCache(params);

    const result = getEvaluationSampleProvider([], {});
    expect(result).toBeUndefined();
  });

  it("returns undefined when eval cycle triggers but provider list is null", () => {
    const params = getAdaptiveParams();
    params.evalCycle.counter = params.evalCycle.requestThreshold;
    params.evalCycle.lastEval = Date.now();
    paramsMod.setParamsCache(params);

    const result = getEvaluationSampleProvider(null, {});
    expect(result).toBeUndefined();
  });

  it("selects the most underused provider by score", () => {
    const params = getAdaptiveParams();
    params.evalCycle.counter = params.evalCycle.requestThreshold;
    params.evalCycle.lastEval = Date.now();
    paramsMod.setParamsCache(params);

    const providerStats = {
      "used-provider": { selections: 100, lastUsed: Date.now() - 5000 },
      "unused-provider": { selections: 0, lastUsed: 0 },
    };

    const result = getEvaluationSampleProvider(
      ["used-provider", "unused-provider"],
      providerStats
    );
    expect(result).toBe("unused-provider");
  });

  it("prefers provider with more time since last use", () => {
    const params = getAdaptiveParams();
    params.evalCycle.counter = params.evalCycle.requestThreshold;
    params.evalCycle.lastEval = Date.now();
    paramsMod.setParamsCache(params);

    const now = Date.now();
    const providerStats = {
      "recently-used": { selections: 5, lastUsed: now - 1000 },
      "long-unused": { selections: 5, lastUsed: now - 100000 },
    };

    const result = getEvaluationSampleProvider(
      ["recently-used", "long-unused"],
      providerStats
    );
    expect(result).toBe("long-unused");
  });

  it("prefers provider with fewer selections when time since use is similar", () => {
    const params = getAdaptiveParams();
    params.evalCycle.counter = params.evalCycle.requestThreshold;
    params.evalCycle.lastEval = Date.now();
    paramsMod.setParamsCache(params);

    const now = Date.now();
    const providerStats = {
      "many-selections": { selections: 50, lastUsed: now - 50000 },
      "few-selections": { selections: 2, lastUsed: now - 50000 },
    };

    const result = getEvaluationSampleProvider(
      ["many-selections", "few-selections"],
      providerStats
    );
    expect(result).toBe("few-selections");
  });

  it("treats providers with no stats as zero selections and lastUsed=0", () => {
    const params = getAdaptiveParams();
    params.evalCycle.counter = params.evalCycle.requestThreshold;
    params.evalCycle.lastEval = Date.now();
    paramsMod.setParamsCache(params);

    const providerStats = {
      "known-provider": { selections: 10, lastUsed: Date.now() - 1000 },
    };

    const result = getEvaluationSampleProvider(
      ["known-provider", "unknown-provider"],
      providerStats
    );
    // unknown-provider has score = Date.now()/1000 - 0*1000 (very high)
    // known-provider has score = 1/1000 - 10*1000 (very low)
    expect(result).toBe("unknown-provider");
  });

  it("resets eval cycle counter and lastEval after triggering", () => {
    const params = getAdaptiveParams();
    params.evalCycle.counter = params.evalCycle.requestThreshold;
    const oldLastEval = Date.now() - params.evalCycle.timeThreshold - 1000;
    params.evalCycle.lastEval = oldLastEval;
    paramsMod.setParamsCache(params);

    getEvaluationSampleProvider(["provider-a"], {});

    const updated = getAdaptiveParams();
    expect(updated.evalCycle.counter).toBe(0);
    expect(updated.evalCycle.lastEval).toBeGreaterThan(oldLastEval);
  });

  it("triggers on time threshold even when counter is low", () => {
    const params = getAdaptiveParams();
    params.evalCycle.counter = 0;
    params.evalCycle.lastEval = Date.now() - params.evalCycle.timeThreshold - 1000;
    paramsMod.setParamsCache(params);

    const result = getEvaluationSampleProvider(["provider-a"], {});
    expect(result).toBe("provider-a");
  });
});
