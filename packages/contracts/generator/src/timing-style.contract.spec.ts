import { describe, expect, it } from "vitest";
import type { TimingStyle } from "./timing-style.contract";

describe("TimingStyle", () => {
  it("should allow match_module", () => {
    const style: TimingStyle = "match_module";
    expect(style).toBe("match_module");
  });

  it("should allow solid", () => {
    const style: TimingStyle = "solid";
    expect(style).toBe("solid");
  });

  it("should allow dashed", () => {
    const style: TimingStyle = "dashed";
    expect(style).toBe("dashed");
  });
});
