import { describe, expect, it } from "vitest";
import type { WatermarkBlend } from "./watermark-blend.contract";

describe("WatermarkBlend", () => {
  it("should allow normal", () => {
    const blend: WatermarkBlend = "normal";
    expect(blend).toBe("normal");
  });

  it("should allow multiply", () => {
    const blend: WatermarkBlend = "multiply";
    expect(blend).toBe("multiply");
  });

  it("should allow screen", () => {
    const blend: WatermarkBlend = "screen";
    expect(blend).toBe("screen");
  });

  it("should allow overlay", () => {
    const blend: WatermarkBlend = "overlay";
    expect(blend).toBe("overlay");
  });

  it("should allow soft-light", () => {
    const blend: WatermarkBlend = "soft-light";
    expect(blend).toBe("soft-light");
  });
});
