import { describe, expect, it } from "vitest";
import type { AnimationTarget } from "./animation-target.contract";

describe("AnimationTarget", () => {
  it("should allow result", () => {
    const target: AnimationTarget = "result";
    expect(target).toBe("result");
  });

  it("should allow modules", () => {
    const target: AnimationTarget = "modules";
    expect(target).toBe("modules");
  });

  it("should allow both", () => {
    const target: AnimationTarget = "both";
    expect(target).toBe("both");
  });
});
