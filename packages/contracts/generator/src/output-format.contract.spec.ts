import { describe, it, expect } from "vitest";
import type { OutputFormat } from "./output-format.contract";

describe("contracts/generator/output-format", () => {
  describe("OutputFormat", () => {
    it("accepts all output format values", () => {
      const formats: OutputFormat[] = ["png", "webp", "gif", "svg"];
      expect(new Set(formats).size).toBe(4);
    });
  });
});
