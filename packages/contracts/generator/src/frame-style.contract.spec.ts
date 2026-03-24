import { describe, expect, it } from "vitest";
import type { FrameStyle } from "./frame-style.contract";

describe("FrameStyle", () => {
  it("should allow none", () => {
    const style: FrameStyle = "none";
    expect(style).toBe("none");
  });

  it("should allow rounded_frame", () => {
    const style: FrameStyle = "rounded_frame";
    expect(style).toBe("rounded_frame");
  });

  it("should allow sticker", () => {
    const style: FrameStyle = "sticker";
    expect(style).toBe("sticker");
  });

  it("should allow tag", () => {
    const style: FrameStyle = "tag";
    expect(style).toBe("tag");
  });
});
