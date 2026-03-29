import { describe, it, expect, beforeEach } from "vitest";
import { assignInTree } from "./dynamic-testid-assign";
import { JSDOM } from "jsdom";

describe("assignInTree", () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html><body></body>`);
    document = dom.window.document;
    global.document = document;
    const bag = globalThis as Record<string, unknown>;
    delete bag["__ANQR_DYNAMIC_TESTID_REGISTRY__"];
  });

  it("should assign testid to matching elements", () => {
    const button = document.createElement("button");
    button.textContent = "Click me";
    document.body.appendChild(button);

    assignInTree(document.body, "button");

    expect(button.dataset.testid).toBeTruthy();
  });

  it("should assign testid to multiple matching elements", () => {
    const button1 = document.createElement("button");
    const button2 = document.createElement("button");
    document.body.appendChild(button1);
    document.body.appendChild(button2);

    assignInTree(document.body, "button");

    expect(button1.dataset.testid).toBeTruthy();
    expect(button2.dataset.testid).toBeTruthy();
  });

  it("should not affect elements that already have testid", () => {
    const button = document.createElement("button");
    button.dataset.testid = "my-existing-id";
    document.body.appendChild(button);

    assignInTree(document.body, "button");

    expect(button.dataset.testid).toBe("my-existing-id");
  });

  it("should handle empty selector result", () => {
    expect(() => {
      assignInTree(document.body, "nonexistent-element");
    }).not.toThrow();
  });

  it("should work with complex selectors", () => {
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    document.body.appendChild(input);

    assignInTree(document.body, 'input[type="text"]');

    expect(input.dataset.testid).toBeTruthy();
  });

  it("should handle nested elements", () => {
    const div = document.createElement("div");
    const button = document.createElement("button");
    div.appendChild(button);
    document.body.appendChild(div);

    assignInTree(document.body, "button");

    expect(button.dataset.testid).toBeTruthy();
  });
});
