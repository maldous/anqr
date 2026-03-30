import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Input } from "./input";

describe("Input", () => {
  // ── Rendering ──────────────────────────────────────────────────
  
  it("renders as input element", () => {
    render(<Input />);
    const input = document.querySelector("input");
    expect(input).toBeTruthy();
    expect(input?.tagName).toBe("INPUT");
  });

  it("applies default classes", () => {
    render(<Input />);
    const input = document.querySelector("input");
    expect(input?.className).toContain("rounded-md");
    expect(input?.className).toContain("border");
  });

  // ── Type ───────────────────────────────────────────────────────

  it("applies text type by default", () => {
    render(<Input />);
    const input = document.querySelector("input");
    expect(input?.getAttribute("type")).toBeNull();
  });

  it("applies password type", () => {
    render(<Input type="password" />);
    const input = document.querySelector("input");
    expect(input?.getAttribute("type")).toBe("password");
  });

  it("applies email type", () => {
    render(<Input type="email" />);
    const input = document.querySelector("input");
    expect(input?.getAttribute("type")).toBe("email");
  });

  it("applies number type", () => {
    render(<Input type="number" />);
    const input = document.querySelector("input");
    expect(input?.getAttribute("type")).toBe("number");
  });

  // ── Props ──────────────────────────────────────────────────────

  it("forwards className prop", () => {
    render(<Input className="custom-input" />);
    const input = document.querySelector("input");
    expect(input?.className).toContain("custom-input");
  });

  it("forwards placeholder prop", () => {
    const { container } = render(<Input placeholder="Enter text" />);
    const input = container.querySelector("input");
    expect(input?.getAttribute("placeholder")).toBe("Enter text");
  });

  it("forwards value prop", () => {
    render(<Input value="test value" readOnly />);
    const input = document.querySelector("input");
    expect(input?.value).toBe("test value");
  });

  it("forwards disabled prop", () => {
    render(<Input disabled />);
    const input = document.querySelector("input");
    expect(input?.disabled).toBe(true);
  });

  it("forwards readOnly prop", () => {
    render(<Input readOnly />);
    const input = document.querySelector("input");
    expect(input?.readOnly).toBe(true);
  });

  it("forwards name prop", () => {
    render(<Input name="username" />);
    const input = document.querySelector("input");
    expect(input?.getAttribute("name")).toBe("username");
  });

  it("forwards id prop", () => {
    render(<Input id="email-field" />);
    const input = document.querySelector("input");
    expect(input?.getAttribute("id")).toBe("email-field");
  });

  it("forwards onChange handler", () => {
    let changed = false;
    render(<Input onChange={() => { changed = true; }} />);
    const input = document.querySelector("input");
    input?.dispatchEvent(new Event("change", { bubbles: true }));
    expect(changed).toBe(true);
  });

  it("forwards onFocus handler", () => {
    let focused = false;
    render(<Input onFocus={() => { focused = true; }} />);
    const input = document.querySelector("input");
    input?.focus();
    expect(focused).toBe(true);
  });

  it("forwards onBlur handler", () => {
    let blurred = false;
    render(<Input onBlur={() => { blurred = true; }} />);
    const input = document.querySelector("input");
    input?.focus();
    input?.blur();
    expect(blurred).toBe(true);
  });

  // ── TestID ─────────────────────────────────────────────────────

  it("assigns dynamic testid", () => {
    render(<Input />);
    const input = document.querySelector("input");
    expect(input?.getAttribute("data-testid")).toBeTruthy();
  });

  it("uses name in testid when provided", () => {
    render(<Input name="email" />);
    const input = document.querySelector("input");
    const testid = input?.getAttribute("data-testid");
    expect(testid).toContain("email");
  });

  it("uses title in testid when provided", () => {
    render(<Input title="Search Field" />);
    const input = document.querySelector("input");
    const testid = input?.getAttribute("data-testid");
    expect(testid).toContain("search-field");
  });

  it("uses aria-label in testid when provided", () => {
    render(<Input aria-label="Password Input" />);
    const input = document.querySelector("input");
    const testid = input?.getAttribute("data-testid");
    expect(testid).toContain("password-input");
  });

  // ── Ref Forwarding ─────────────────────────────────────────────

  it("forwards ref", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
