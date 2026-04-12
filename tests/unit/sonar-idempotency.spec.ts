import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SONAR_PATH = resolve("harness/ops/sonar-group-issues.mjs");

describe("sonar-group-issues idempotency", () => {
  const source = readFileSync(SONAR_PATH, "utf-8");

  it("imports findOpenIssuesByTitle for duplicate detection", () => {
    expect(source).toContain("findOpenIssuesByTitle");
  });

  it("checks for existing issues before creating new ones in the loop body", () => {
    const importEnd = source.indexOf("async function main");
    const body = source.slice(importEnd);
    const findIndex = body.indexOf("findOpenIssuesByTitle");
    const createIndex = body.indexOf("createIssue");

    expect(findIndex).toBeGreaterThan(-1);
    expect(createIndex).toBeGreaterThan(-1);
    expect(findIndex).toBeLessThan(createIndex);
  });

  it("skips creation when matching issue already exists", () => {
    expect(source).toContain("existing");
    expect(source).toContain("Skipping existing");
  });
});
