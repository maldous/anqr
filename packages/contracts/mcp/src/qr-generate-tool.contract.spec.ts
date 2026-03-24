import { describe, it, expect } from "vitest";
import { qrGenerateInputSchema } from "./qr-generate-tool.contract";

describe("qr-generate-tool.contract", () => {
  describe("qrGenerateInputSchema", () => {
    it("should define data field as required string", () => {
      expect(qrGenerateInputSchema.data).toBeDefined();
      expect(qrGenerateInputSchema.data._def.typeName).toBe("ZodString");
    });

    it("should define size as optional integer between 50 and 4096", () => {
      const schema = qrGenerateInputSchema.size;
      expect(schema).toBeDefined();
      expect(schema.isOptional()).toBe(true);
      
      // Test valid sizes
      expect(() => schema.parse(400)).not.toThrow();
      expect(() => schema.parse(50)).not.toThrow();
      expect(() => schema.parse(4096)).not.toThrow();
    });

    it("should define errorCorrection as optional enum", () => {
      const schema = qrGenerateInputSchema.errorCorrection;
      expect(schema).toBeDefined();
      expect(schema.isOptional()).toBe(true);
      
      // Test valid values
      expect(() => schema.parse("L")).not.toThrow();
      expect(() => schema.parse("M")).not.toThrow();
      expect(() => schema.parse("Q")).not.toThrow();
      expect(() => schema.parse("H")).not.toThrow();
    });

    it("should define foreground as optional hex color without #", () => {
      const schema = qrGenerateInputSchema.foreground;
      expect(schema).toBeDefined();
      expect(schema.isOptional()).toBe(true);
      
      // Test valid hex colors
      expect(() => schema.parse("000000")).not.toThrow();
      expect(() => schema.parse("FFFFFF")).not.toThrow();
      expect(() => schema.parse("ff5733")).not.toThrow();
    });

    it("should define background as optional hex color without #", () => {
      const schema = qrGenerateInputSchema.background;
      expect(schema).toBeDefined();
      expect(schema.isOptional()).toBe(true);
      
      // Test valid hex colors
      expect(() => schema.parse("ffffff")).not.toThrow();
      expect(() => schema.parse("000000")).not.toThrow();
    });

    it("should define format as optional enum of png or svg", () => {
      const schema = qrGenerateInputSchema.format;
      expect(schema).toBeDefined();
      expect(schema.isOptional()).toBe(true);
      
      // Test valid formats
      expect(() => schema.parse("png")).not.toThrow();
      expect(() => schema.parse("svg")).not.toThrow();
    });

    it("should define margin as optional integer between 0 and 20", () => {
      const schema = qrGenerateInputSchema.margin;
      expect(schema).toBeDefined();
      expect(schema.isOptional()).toBe(true);
      
      // Test valid margins
      expect(() => schema.parse(0)).not.toThrow();
      expect(() => schema.parse(4)).not.toThrow();
      expect(() => schema.parse(20)).not.toThrow();
    });

    it("should include helpful descriptions for all fields", () => {
      expect(qrGenerateInputSchema.data.description).toContain("content to encode");
      expect(qrGenerateInputSchema.size.description).toContain("size in pixels");
      expect(qrGenerateInputSchema.errorCorrection.description).toContain("Error correction");
      expect(qrGenerateInputSchema.foreground.description).toContain("Foreground color");
      expect(qrGenerateInputSchema.background.description).toContain("Background color");
      expect(qrGenerateInputSchema.format.description).toContain("format");
      expect(qrGenerateInputSchema.margin.description).toContain("margin");
    });
  });
});
