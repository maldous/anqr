import { describe, it, expect } from "vitest";

const {
  OWNERSHIP_FILE_NAME,
  OWNERSHIP_TTL_MS,
} = await import(
  "../../harness/ops/core/symphony-shared-state/ownership-constants.mjs"
);

const {
  INFLIGHT_FILE_NAME,
  INFLIGHT_TTL_MS,
} = await import(
  "../../harness/ops/core/symphony-shared-state/rehydration-constants.mjs"
);

const { TIER_FREE } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/tier-free.mjs"
);

const { TIER_PAID } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/tier-paid.mjs"
);

const { TIER_LOCAL } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/tier-local.mjs"
);

const { SESSION_TTL_MS } = await import(
  "../../harness/ops/integrations/model/symphony-session-state/session-ttl-ms.mjs"
);

describe("ownership-constants", () => {
  it("OWNERSHIP_FILE_NAME is active-job-ownership.json", () => {
    expect(OWNERSHIP_FILE_NAME).toBe("active-job-ownership.json");
  });

  it("OWNERSHIP_TTL_MS is 5 minutes", () => {
    expect(OWNERSHIP_TTL_MS).toBe(5 * 60 * 1000);
  });

  it("OWNERSHIP_TTL_MS is positive", () => {
    expect(OWNERSHIP_TTL_MS).toBeGreaterThan(0);
  });
});

describe("rehydration-constants", () => {
  it("INFLIGHT_FILE_NAME is inflight-requests.json", () => {
    expect(INFLIGHT_FILE_NAME).toBe("inflight-requests.json");
  });

  it("INFLIGHT_TTL_MS is 10 minutes", () => {
    expect(INFLIGHT_TTL_MS).toBe(10 * 60 * 1000);
  });

  it("INFLIGHT_TTL_MS is longer than OWNERSHIP_TTL_MS", () => {
    expect(INFLIGHT_TTL_MS).toBeGreaterThan(OWNERSHIP_TTL_MS);
  });

  it("INFLIGHT_TTL_MS is positive", () => {
    expect(INFLIGHT_TTL_MS).toBeGreaterThan(0);
  });
});

describe("tier constants", () => {
  it("TIER_FREE is free-cloud", () => {
    expect(TIER_FREE).toBe("free-cloud");
  });

  it("TIER_PAID is paid", () => {
    expect(TIER_PAID).toBe("paid");
  });

  it("TIER_LOCAL is local-safety-net", () => {
    expect(TIER_LOCAL).toBe("local-safety-net");
  });

  it("all tier constants are distinct strings", () => {
    const tiers = new Set([TIER_FREE, TIER_PAID, TIER_LOCAL]);
    expect(tiers.size).toBe(3);
  });

  it("no tier is a substring of another", () => {
    expect(TIER_PAID.includes(TIER_FREE)).toBe(false);
    expect(TIER_FREE.includes(TIER_PAID)).toBe(false);
    expect(TIER_LOCAL.includes(TIER_FREE)).toBe(false);
    expect(TIER_FREE.includes(TIER_LOCAL)).toBe(false);
  });
});

describe("session-ttl-ms", () => {
  it("SESSION_TTL_MS is 1 hour", () => {
    expect(SESSION_TTL_MS).toBe(60 * 60 * 1000);
  });

  it("SESSION_TTL_MS is positive", () => {
    expect(SESSION_TTL_MS).toBeGreaterThan(0);
  });

  it("SESSION_TTL_MS is longer than OWNERSHIP_TTL_MS", () => {
    expect(SESSION_TTL_MS).toBeGreaterThan(OWNERSHIP_TTL_MS);
  });
});
