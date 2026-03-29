import { describe, it, expect, beforeEach } from "vitest";
import { getElementToken } from "./dynamic-testid-element-token";
import { JSDOM } from "jsdom";

describe("getElementToken", () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html><body></body>`);
    document = dom.window.document;
  });

  it("should use aria-label when available", () => {
    const button = document.createElement("button");
    button.setAttribute("aria-label", "Close Dialog");
    expect(getElementToken(button)).toBe("close-dialog");
  });

  it("should use title when aria-label not available", () => {
    const button = document.createElement("button");
    button.setAttribute("title", "Help Information");
    expect(getElementToken(button)).toBe("help-information");
  });

  it("should use name when aria-label and title not available", () => {
    const input = document.createElement("input");
    input.setAttribute("name", "username");
    expect(getElementToken(input)).toBe("username");
  });

  it("should use id when higher priority attrs not available", () => {
    const div = document.createElement("div");
    div.setAttribute("id", "main-content");
    expect(getElementToken(div)).toBe("main-content");
  });

  it("should use role when other attrs not available", () => {
    const div = document.createElement("div");
    div.setAttribute("role", "navigation");
    expect(getElementToken(div)).toBe("navigation");
  });

  it("should use text content when no attrs available", () => {
    const button = document.createElement("button");
    button.textContent = "Submit Form";
    expect(getElementToken(button)).toBe("submit-form");
  });

  it("should truncate text content to 40 chars", () => {
    const button = document.createElement("button");
    button.textContent = "This is a very long button text that should be truncated";
    const token = getElementToken(button);
    expect(token.length).toBeLessThanOrEqual(40);
  });

  it("should fall back to tag name when no text or attrs", () => {
    const button = document.createElement("button");
    expect(getElementToken(button)).toBe("button");
  });

  it("should normalize special characters", () => {
    const button = document.createElement("button");
    button.setAttribute("aria-label", "Save & Exit!");
    expect(getElementToken(button)).toBe("save-exit");
  });

  it("should prioritize aria-label over all other attributes", () => {
    const input = document.createElement("input");
    input.setAttribute("aria-label", "Email Address");
    input.setAttribute("title", "Enter Email");
    input.setAttribute("name", "email");
    input.setAttribute("id", "email-input");
    expect(getElementToken(input)).toBe("email-address");
  });
});
