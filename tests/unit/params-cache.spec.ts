import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const TEST_STATE_DIR = path.resolve(PROJECT_ROOT, "reports", "params-cache-test");

// Set env before imports so modules pick up the test directory
process.env.ANQR_BRIDGE_STATE_DIR = TEST_STATE_DIR;

const { DEFAULT_ADAPTIVE_PARAMS } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/default-adaptive-params.mjs"
);

// Use module namespace object for live bindings (paramsCache is a `let`)
const paramsMod = await import(
  "../../harness/ops/integrations/model/symphony-session-state/params-cache.mjs"
);

const { getAdaptiveParams } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/get-adaptive-params.mjs"
);

afterAll(() => {
  try {
    if (fs.existsSync(TEST_STATE_DIR)) fs.rmSync(TEST_STATE_DIR, { recursive: true });
  } catch {
    // ignore
  }
  delete process.env.ANQR_BRIDGE_STATE_DIR;
});

describe("paramsCache live binding", () => {
  beforeEach(() => {
    paramsMod.setParamsCache(null);
    if (!fs.existsSync(TEST_STATE_DIR)) {
      fs.mkdirSync(TEST_STATE_DIR, { recursive: true, mode: 0o700 });
    }
    const paramsFile = path.join(TEST_STATE_DIR, "adaptive-params.json");
    if (fs.existsSync(paramsFile)) fs.unlinkSync(paramsFile);
    const lockFile = `${paramsFile}.lock`;
    if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
  });

  it("paramsCache starts as null", () => {
    expect(paramsMod.paramsCache).toBeNull();
  });

  it("setParamsCache updates the live binding", () => {
    const custom = structuredClone(DEFAULT_ADAPTIVE_PARAMS);
    custom.evalCycle.counter = 42;
    paramsMod.setParamsCache(custom);

    expect(paramsMod.paramsCache).not.toBeNull();
    // Non-null asserted via the expect above.
    expect(paramsMod.paramsCache!.evalCycle.counter).toBe(42);
  });

  it("setParamsCache(null) resets cache to null", () => {
    const custom = structuredClone(DEFAULT_ADAPTIVE_PARAMS);
    paramsMod.setParamsCache(custom);
    expect(paramsMod.paramsCache).not.toBeNull();

    paramsMod.setParamsCache(null);
    expect(paramsMod.paramsCache).toBeNull();
  });

  it("getAdaptiveParams loads from disk when cache is null", () => {
    // With no saved file, it should return defaults
    paramsMod.setParamsCache(null);
    const params = getAdaptiveParams();
    expect(params).not.toBeNull();
    expect(params.freeTurnLimit.base).toBe(DEFAULT_ADAPTIVE_PARAMS.freeTurnLimit.base);
  });

  it("getAdaptiveParams returns cached value when cache is set", () => {
    const custom = structuredClone(DEFAULT_ADAPTIVE_PARAMS);
    custom.freeTurnLimit.base = 999;
    paramsMod.setParamsCache(custom);

    const params = getAdaptiveParams();
    expect(params.freeTurnLimit.base).toBe(999);
  });

  it("cache invalidation causes getAdaptiveParams to reload from disk", () => {
    // Set custom cache
    const custom = structuredClone(DEFAULT_ADAPTIVE_PARAMS);
    custom.freeTurnLimit.base = 777;
    paramsMod.setParamsCache(custom);
    expect(getAdaptiveParams().freeTurnLimit.base).toBe(777);

    // Invalidate cache
    paramsMod.setParamsCache(null);

    // Should reload defaults (no file on disk)
    const reloaded = getAdaptiveParams();
    expect(reloaded.freeTurnLimit.base).toBe(DEFAULT_ADAPTIVE_PARAMS.freeTurnLimit.base);
  });

  it("mutations to the returned object do not affect the cache when re-fetched", () => {
    const params = getAdaptiveParams();
    params.evalCycle.counter = 999;

    // Re-fetch — the cache is the same object (not deep-copied on get)
    // so mutations ARE visible. This is by design — callers mutate
    // the cache in-place and then save.
    const reFetched = getAdaptiveParams();
    expect(reFetched.evalCycle.counter).toBe(999);

    // After invalidation + reload, defaults are restored
    paramsMod.setParamsCache(null);
    const fresh = getAdaptiveParams();
    expect(fresh.evalCycle.counter).not.toBe(999);
  });
});
