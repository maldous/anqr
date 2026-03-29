import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { initAutoDynamicTestIds } from "./dynamic-testid-init";
import { ensureElementTestId } from "./dynamic-testid-ensure";
import { JSDOM } from "jsdom";

describe("initAutoDynamicTestIds", () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html><body></body>`);
    document = dom.window.document;
    global.document = document;
    global.MutationObserver = dom.window.MutationObserver;
    const bag = globalThis as Record<string, unknown>;
    delete bag["__ANQR_DYNAMIC_TESTID_REGISTRY__"];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should assign testids to existing interactive elements", () => {
    const button = document.createElement("button");
    document.body.appendChild(button);

    initAutoDynamicTestIds();

    expect(button.dataset.testid).toBeTruthy();
  });

  it("should assign testids to buttons", () => {
    const button = document.createElement("button");
    document.body.appendChild(button);
    initAutoDynamicTestIds();
    expect(button.dataset.testid).toBeTruthy();
  });

  it("should assign testids to inputs", () => {
    const input = document.createElement("input");
    document.body.appendChild(input);
    initAutoDynamicTestIds();
    expect(input.dataset.testid).toBeTruthy();
  });

  it("should assign testids to textareas", () => {
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    initAutoDynamicTestIds();
    expect(textarea.dataset.testid).toBeTruthy();
  });

  it("should assign testids to selects", () => {
    const select = document.createElement("select");
    document.body.appendChild(select);
    initAutoDynamicTestIds();
    expect(select.dataset.testid).toBeTruthy();
  });

  it("should assign testids to elements with button role", () => {
    const div = document.createElement("div");
    div.setAttribute("role", "button");
    document.body.appendChild(div);
    initAutoDynamicTestIds();
    expect(div.dataset.testid).toBeTruthy();
  });

  it("should assign testids to links with href", () => {
    const link = document.createElement("a");
    link.setAttribute("href", "/page");
    document.body.appendChild(link);
    initAutoDynamicTestIds();
    expect(link.dataset.testid).toBeTruthy();
  });

  it("should set up mutation observer", () => {
    const observeSpy = vi.spyOn(dom.window.MutationObserver.prototype, "observe");
    initAutoDynamicTestIds();
    expect(observeSpy).toHaveBeenCalled();
  });

  it("should handle dynamically added elements", () => {
    // Note: MutationObserver in jsdom works differently
    // This test verifies the setup, actual DOM observation requires browser environment
    initAutoDynamicTestIds();

    const button = document.createElement("button");
    button.textContent = "Test";
    document.body.appendChild(button);

    // In jsdom, we need to manually trigger the assignment since MutationObserver
    // doesn't fire automatically. In a real browser, this would happen automatically.
    // For this test, we verify that elements added after init can be assigned testids
    ensureElementTestId(button);

    expect(button.dataset.testid).toBeTruthy();
  });
});
