import { describe, expect, it } from "vitest";
import type { OverlayType } from "./overlay-type.contract";

describe("OverlayType", () => {
  it("should allow static", () => {
    const type: OverlayType = "static";
    expect(type).toBe("static");
  });

  it("should allow gif", () => {
    const type: OverlayType = "gif";
    expect(type).toBe("gif");
  });

  it("should allow apng", () => {
    const type: OverlayType = "apng";
    expect(type).toBe("apng");
  });

  it("should allow webp_anim", () => {
    const type: OverlayType = "webp_anim";
    expect(type).toBe("webp_anim");
  });

  it("should allow video", () => {
    const type: OverlayType = "video";
    expect(type).toBe("video");
  });
});
