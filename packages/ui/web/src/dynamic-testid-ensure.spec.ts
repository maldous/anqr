import { describe, it, expect, beforeEach } from "vitest";
import { ensureElementTestId } from "./dynamic-testid-ensure";
import { JSDOM } from "jsdom";

describe("ensureElementTestId", () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html><body></body>`);
    document = dom.window.document;
    const bag = globalThis as Record<string, unknown>;
    delete bag["__ANQR_DYNAMIC_TESTID_REGISTRY__"];
  });

  it("should assign testid to element without one", () => {
    const button = document.createElement("button");
    ensureElementTestId(button);
    expect(button.dataset.testid).toBeTruthy();
  });

  it("should not overwrite existing testid", () => {
    const button = document.createElement("button");
    button.dataset.testid = "my-button";
    ensureElementTestId(button);
    expect(button.dataset.testid).toBe("my-button");
  });

  it("should assign auto-testid-key if not present", () => {
    const button = document.createElement("button");
    ensureElementTestId(button);
    expect(button.getAttribute("data-auto-testid-key")).toBeTruthy();
  });

  it("should reuse existing auto-testid-key", () => {
    const button = document.createElement("button");
    button.setAttribute("data-auto-testid-key", "my-key");
    ensureElementTestId(button);
    expect(button.getAttribute("data-auto-testid-key")).toBe("my-key");
  });

  it("should generate unique testids for different elements", () => {
    const button1 = document.createElement("button");
    const button2 = document.createElement("button");
    ensureElementTestId(button1);
    ensureElementTestId(button2);
    expect(button1.dataset.testid).not.toBe(button2.dataset.testid);
  });

  it("should include tag name in testid", () => {
    const button = document.createElement("button");
    ensureElementTestId(button);
    expect(button.dataset.testid).toContain("button");
  });

  it("should include element token in testid", () => {
    const button = document.createElement("button");
    button.setAttribute("aria-label", "Submit");
    ensureElementTestId(button);
    expect(button.dataset.testid).toContain("submit");
  });

  it("should handle elements with no distinguishing features", () => {
    const div = document.createElement("div");
    ensureElementTestId(div);
    expect(div.dataset.testid).toBeTruthy();
    expect(div.dataset.testid).toContain("div");
  });

  it("should generate same testid when called multiple times on same element", () => {
    const button = document.createElement("button");
    ensureElementTestId(button);
    const firstId = button.dataset.testid;
    ensureElementTestId(button);
    expect(button.dataset.testid).toBe(firstId);
  });
});
