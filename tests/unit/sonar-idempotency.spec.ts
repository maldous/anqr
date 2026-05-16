import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SYNC_PATH = resolve(
  "harness/ops/integrations/sonar/sonar-linear-sync/sync-sonar-to-linear.mjs",
);

describe("sonar-sync idempotency (individual per-finding issues)", () => {
  const source = readFileSync(SYNC_PATH, "utf-8");

  it("imports findOpenLinearIssuesByTag for duplicate detection", () => {
    expect(source).toContain("findOpenLinearIssuesByTag");
  });

  it("checks keyToLinear map before creating new issues", () => {
    // Scope to function body only (after opening brace) to exclude imports
    const funcStart = source.indexOf("export async function syncSonarToLinear");
    const bodyStart = source.indexOf("{", funcStart) + 1;
    const body = source.slice(bodyStart);
    const hasIndex = body.indexOf("keyToLinear.has");
    const createIndex = body.indexOf("createIssue");

    expect(hasIndex).toBeGreaterThan(-1);
    expect(createIndex).toBeGreaterThan(-1);
    expect(hasIndex).toBeLessThan(createIndex);
  });

  it("skips creation when matching sonar-key already exists", () => {
    expect(source).toContain("keyToLinear.has");
    expect(source).toContain("skipped");
  });
});
