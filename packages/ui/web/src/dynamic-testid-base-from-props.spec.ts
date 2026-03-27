import { describe, it, expect } from "vitest";
import { baseFromProps } from "./dynamic-testid-base-from-props";

describe("baseFromProps", () => {
  it("should use explicit testId when provided", () => {
    const props = { testId: "my-button" };
    const result = baseFromProps(props, "btn", "react-1");
    expect(result).toBe("my-button");
  });

  it("should use label when no testId", () => {
    const props = { label: "Submit Form" };
    const result = baseFromProps(props, "btn", "react-1");
    expect(result).toBe("btn-submit-form");
  });

  it("should use aria-label when no testId or label", () => {
    const props = { "aria-label": "Close Dialog" };
    const result = baseFromProps(props, "btn", "react-1");
    expect(result).toBe("btn-close-dialog");
  });

  it("should use title when no other props available", () => {
    const props = { title: "Help" };
    const result = baseFromProps(props, "btn", "react-1");
    expect(result).toBe("btn-help");
  });

  it("should use name when available", () => {
    const props = { name: "username" };
    const result = baseFromProps(props, "input", "react-1");
    expect(result).toBe("input-username");
  });

  it("should use id when available", () => {
    const props = { id: "main-input" };
    const result = baseFromProps(props, "input", "react-1");
    expect(result).toBe("input-main-input");
  });

  it("should use reactId as last resort", () => {
    const props = {};
    const result = baseFromProps(props, "btn", "react-123");
    expect(result).toBe("btn-react-123");
  });

  it("should default to control if all are empty", () => {
    const props = { label: "", name: "" };
    const result = baseFromProps(props, "btn", "");
    expect(result).toBe("btn-control");
  });

  it("should trim whitespace from testId", () => {
    const props = { testId: "  my-button  " };
    const result = baseFromProps(props, "btn", "react-1");
    expect(result).toBe("my-button");
  });

  it("should normalize special characters in label", () => {
    const props = { label: "Save & Exit!" };
    const result = baseFromProps(props, "btn", "react-1");
    expect(result).toBe("btn-save-exit");
  });

  it("should prioritize testId over all other props", () => {
    const props = {
      testId: "custom",
      label: "Label",
      "aria-label": "AriaLabel",
      title: "Title",
    };
    const result = baseFromProps(props, "btn", "react-1");
    expect(result).toBe("custom");
  });
});
