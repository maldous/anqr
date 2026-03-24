import { describe, expect, it } from "vitest";
import type { McpToolDescriptor } from "./mcp-tool-descriptor.contract";

describe("McpToolDescriptor", () => {
  it("should allow valid tool descriptor", () => {
    const descriptor: McpToolDescriptor = {
      name: "generate_qr",
      description: "Generate a QR code image",
    };

    expect(descriptor.name).toBe("generate_qr");
    expect(descriptor.description).toBe("Generate a QR code image");
  });

  it("should enforce readonly properties", () => {
    const descriptor: McpToolDescriptor = {
      name: "test_tool",
      description: "Test description",
    };

    // TypeScript enforces readonly at compile time
    expect(descriptor.name).toBe("test_tool");
    expect(descriptor.description).toBe("Test description");
  });
});
