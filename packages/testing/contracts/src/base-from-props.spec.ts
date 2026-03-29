import { describe, it, expect } from "vitest";
import { baseFromProps } from "./base-from-props";

describe("baseFromProps", () => {
  it("should use data-testid if provided", () => {
    const result = baseFromProps({ "data-testid": "custom-id" }, "fallback", "react-1");
    expect(result).toBe("custom-id");
  });

  it("should use id if data-testid not provided", () => {
    const result = baseFromProps({ id: "my-id" }, "fallback", "react-1");
    expect(result).toBe("my-id");
  });

  it("should use name if data-testid and id not provided", () => {
    const result = baseFromProps({ name: "my-name" }, "fallback", "react-1");
    expect(result).toBe("my-name");
  });

  it("should use aria-label with fallback prefix if other props not provided", () => {
    const result = baseFromProps({ "aria-label": "Close Button" }, "btn", "react-1");
    expect(result).toBe("btn-close-button");
  });

  it("should use title with fallback prefix if other props not provided", () => {
    const result = baseFromProps({ title: "Submit Form" }, "btn", "react-1");
    expect(result).toBe("btn-submit-form");
  });

  it("should use placeholder with fallback prefix if other props not provided", () => {
    const result = baseFromProps({ placeholder: "Enter name" }, "input", "react-1");
    expect(result).toBe("input-enter-name");
  });

  it("should ignore empty placeholder", () => {
    const result = baseFromProps({ placeholder: "   " }, "input", "react-1");
    expect(result).toBe("input-react-1");
  });

  it("should use react id with fallback prefix as last resort", () => {
    const result = baseFromProps({}, "component", ":r1:");
    expect(result).toBe("component--r1-");
  });

  it("should normalize react id colons to dashes", () => {
    const result = baseFromProps({}, "elem", ":r5:a:b:");
    expect(result).toBe("elem--r5-a-b-");
  });

  it("should prioritize data-testid over all other props", () => {
    const result = baseFromProps(
      {
        "data-testid": "explicit-id",
        id: "my-id",
        name: "my-name",
        "aria-label": "label",
      },
      "fallback",
      "react-1",
    );
    expect(result).toBe("explicit-id");
  });
});
