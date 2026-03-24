import { describe, it, expect } from "vitest";
import type { OutputFormat } from "./output-format.contract";

describe("contracts/generator/output-format", () => {
  describe("OutputFormat", () => {
    it("accepts all output format values", () => {
      const formats: OutputFormat[] = ["png", "webp", "gif", "svg"];
      expect(new Set(formats).size).toBe(4);
    });

    it("accepts png format", () => {
      const format: OutputFormat = "png";
      expect(format).toBe("png");
    });

    it("accepts webp format", () => {
      const format: OutputFormat = "webp";
      expect(format).toBe("webp");
    });

    it("accepts gif format", () => {
      const format: OutputFormat = "gif";
      expect(format).toBe("gif");
    });

    it("accepts svg format", () => {
      const format: OutputFormat = "svg";
      expect(format).toBe("svg");
    });
  });
});
