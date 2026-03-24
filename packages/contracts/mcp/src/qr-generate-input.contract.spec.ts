import { describe, expect, it } from "vitest";
import type { QrGenerateInput } from "./qr-generate-input.contract";

describe("QrGenerateInput", () => {
  it("should allow minimal input with only data", () => {
    const input: QrGenerateInput = {
      data: "https://example.com",
    };

    expect(input.data).toBe("https://example.com");
  });

  it("should allow all optional parameters", () => {
    const input: QrGenerateInput = {
      data: "Hello World",
      size: 400,
      errorCorrection: "H",
      foreground: "000000",
      background: "ffffff",
      format: "png",
      margin: 4,
    };

    expect(input.data).toBe("Hello World");
    expect(input.size).toBe(400);
    expect(input.errorCorrection).toBe("H");
    expect(input.foreground).toBe("000000");
    expect(input.background).toBe("ffffff");
    expect(input.format).toBe("png");
    expect(input.margin).toBe(4);
  });

  it("should allow SVG format", () => {
    const input: QrGenerateInput = {
      data: "test",
      format: "svg",
    };

    expect(input.format).toBe("svg");
  });

  it("should enforce readonly properties", () => {
    const input: QrGenerateInput = {
      data: "readonly test",
      size: 300,
    };

    expect(input.data).toBe("readonly test");
  });
});
