import { describe, it, expect } from "vitest";
import { qrGeneratePromptArgsSchema } from "./qr-generate-prompt.contract";

describe("qr-generate-prompt.contract", () => {
  describe("qrGeneratePromptArgsSchema", () => {
    it("should define intent as required enum", () => {
      const schema = qrGeneratePromptArgsSchema.intent;
      expect(schema).toBeDefined();

      // Test valid intent values
      expect(() => schema.parse("url")).not.toThrow();
      expect(() => schema.parse("wifi")).not.toThrow();
      expect(() => schema.parse("contact")).not.toThrow();
      expect(() => schema.parse("payment")).not.toThrow();
      expect(() => schema.parse("plain_text")).not.toThrow();
    });

    it("should define data as optional string", () => {
      const schema = qrGeneratePromptArgsSchema.data;
      expect(schema).toBeDefined();
      expect(schema.isOptional()).toBe(true);

      // Test valid data
      expect(() => schema.parse("https://example.com")).not.toThrow();
      expect(() => schema.parse(undefined)).not.toThrow();
    });

    it("should define format as optional enum of png or svg", () => {
      const schema = qrGeneratePromptArgsSchema.format;
      expect(schema).toBeDefined();
      expect(schema.isOptional()).toBe(true);

      // Test valid formats
      expect(() => schema.parse("png")).not.toThrow();
      expect(() => schema.parse("svg")).not.toThrow();
      expect(() => schema.parse(undefined)).not.toThrow();
    });

    it("should include helpful descriptions", () => {
      expect(qrGeneratePromptArgsSchema.intent.description).toContain("use case");
      expect(qrGeneratePromptArgsSchema.data.description).toContain("data");
      expect(qrGeneratePromptArgsSchema.format.description).toContain("format");
    });
  });
});
