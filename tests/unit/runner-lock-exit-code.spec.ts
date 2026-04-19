import { describe, it, expect } from "vitest";

import { isStaleQuotaExhausted } from "../../harness/ops/integrations/model/symphony-credit-gate/is-stale-quota-exhausted.mjs";
import { classifyProviderFailure } from "../../harness/ops/orchestration/symphony-runner/classify-provider-failure.mjs";
import { EXIT_LOCK_CONTENTION } from "../../harness/ops/orchestration/symphony-runner/exit-codes.mjs";

describe("EXIT_LOCK_CONTENTION constant", () => {
  it("is 2 (matches process.exit in main.mjs and err.code check in executor)", () => {
    expect(EXIT_LOCK_CONTENTION).toBe(2);
  });
});

describe("isStaleQuotaExhausted", () => {
  it("returns false for providers with no probe results", () => {
    expect(isStaleQuotaExhausted("__nonexistent_provider__")).toBe(false);
  });

  it("returns false for providers with non-quota status", async () => {
    // Load the probe results and check that a healthy provider is not stale
    const { loadProbeResults } = await import(
      "../../harness/ops/integrations/model/symphony-credit-gate/load-probe-results.mjs"
    );
    const results = loadProbeResults();
    // Any provider with a non-quota_exhausted status should not be stale
    for (const [name, entry] of Object.entries(results)) {
      if (entry.status !== "quota_exhausted") {
        expect(isStaleQuotaExhausted(name)).toBe(false);
      }
    }
  });

  it("STALE_QUOTA_SECS is 2 hours (7200s), down from the old 24h default", async () => {
    const { STALE_QUOTA_SECS } = await import(
      "../../harness/ops/integrations/model/symphony-credit-gate/is-stale-quota-exhausted.mjs"
    );
    expect(STALE_QUOTA_SECS).toBe(2 * 60 * 60); // 7200s = 2h
  });
});

describe("classifyProviderFailure", () => {
  it("classifies 'Too Many Requests' as quota error", () => {
    expect(classifyProviderFailure("Too Many Requests from OpenRouter")).toBe("quota");
  });

  it("classifies '429' as quota error", () => {
    expect(classifyProviderFailure("HTTP 429 rate limited")).toBe("quota");
  });

  it("classifies 'quota' as quota error", () => {
    expect(classifyProviderFailure("insufficient_quota for model")).toBe("quota");
  });

  it("classifies 'RESOURCE_EXHAUSTED' as quota error", () => {
    expect(classifyProviderFailure("RESOURCE_EXHAUSTED")).toBe("quota");
  });

  it("classifies 'accounts exhausted' as quota error", () => {
    expect(classifyProviderFailure("All accounts exhausted")).toBe("quota");
  });

  it("classifies 'All codebuff' as quota error", () => {
    expect(classifyProviderFailure("All codebuff credits used")).toBe("quota");
  });

  it("classifies LOCAL_BUSY as local_busy", () => {
    expect(classifyProviderFailure("LOCAL_BUSY")).toBe("local_busy");
  });

  it("classifies 'local_busy' as local_busy", () => {
    expect(classifyProviderFailure("local_busy detected")).toBe("local_busy");
  });

  it("classifies LLM call failures as provider error", () => {
    expect(classifyProviderFailure("LLM call failed: no response")).toBe("provider");
  });

  it("classifies 'No choices' as provider error", () => {
    expect(classifyProviderFailure("No choices returned")).toBe("provider");
  });

  it("classifies unknown errors as other", () => {
    expect(classifyProviderFailure("Something unexpected happened")).toBe("other");
  });

  it("handles null/undefined gracefully", () => {
    expect(classifyProviderFailure(null as unknown as string)).toBe("other");
    expect(classifyProviderFailure(undefined as unknown as string)).toBe("other");
  });
});

describe("runner lock exit code contract", () => {
  it("execFileAsync sets err.code (not err.status) for EXIT_LOCK_CONTENTION", async () => {
    const { execFile } = await import("node:child_process");
    const { promisify } = await import("node:util");
    const execFileAsync = promisify(execFile);

    try {
      await execFileAsync(process.execPath, ["-e", `process.exit(${EXIT_LOCK_CONTENTION})`]);
    } catch (err: unknown) {
      expect((err as { code?: number }).code).toBe(EXIT_LOCK_CONTENTION);
      expect((err as { status?: number }).status).toBeUndefined();
    }
  });

  it("execFileAsync throws with err.code=1 for process.exit(1)", async () => {
    const { execFile } = await import("node:child_process");
    const { promisify } = await import("node:util");
    const execFileAsync = promisify(execFile);

    try {
      await execFileAsync(process.execPath, ["-e", "process.exit(1)"]);
      expect.unreachable("Should have thrown");
    } catch (err: unknown) {
      expect((err as { code?: number }).code).toBe(1);
    }
  });
});
