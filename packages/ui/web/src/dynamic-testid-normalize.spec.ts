import { describe, it, expect } from "vitest";
import { normalizeToken } from "./dynamic-testid-normalize";

describe("normalizeToken", () => {
  it("should convert to lowercase", () => {
    expect(normalizeToken("MyButton")).toBe("mybutton");
  });

  it("should replace spaces with dashes", () => {
    expect(normalizeToken("Save Button")).toBe("save-button");
  });

  it("should replace multiple spaces with single dash", () => {
    expect(normalizeToken("Save   Button")).toBe("save-button");
  });

  it("should remove special characters", () => {
    expect(normalizeToken("Save@Button!")).toBe("save-button");
  });

  it("should trim whitespace", () => {
    expect(normalizeToken("  Button  ")).toBe("button");
  });

  it("should remove trailing dash", () => {
    expect(normalizeToken("Button-")).toBe("button");
  });

  it("should handle multiple consecutive special chars", () => {
    expect(normalizeToken("Save!!!Button")).toBe("save-button");
  });

  it("should preserve numbers", () => {
    expect(normalizeToken("Button123")).toBe("button123");
  });

  it("should handle mixed alphanumeric with special chars", () => {
    expect(normalizeToken("Item-1: Name")).toBe("item-1-name");
  });

  it("should handle empty string", () => {
    expect(normalizeToken("")).toBe("");
  });

  it("should handle only special characters", () => {
    expect(normalizeToken("!!!")).toBe("");
  });

  it("should not add leading dash", () => {
    expect(normalizeToken("!!!Button")).toBe("button");
  });

  it("should handle camelCase", () => {
    expect(normalizeToken("submitButton")).toBe("submitbutton");
  });

  it("should handle PascalCase", () => {
    expect(normalizeToken("SubmitButton")).toBe("submitbutton");
  });
});
