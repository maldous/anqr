import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Input } from "./input";

describe("Input", () => {
  // ── Rendering ──────────────────────────────────────────────────
  
  it("renders as input element", () => {
    const { container } = render(<Input />);
    const input = container.querySelector("input");
    expect(input).toBeTruthy();
    expect(input?.tagName).toBe("INPUT");
  });

  it("applies default classes", () => {
    const { container } = render(<Input />);
    const input = container.querySelector("input");
    expect(input?.className).toContain("rounded-md");
    expect(input?.className).toContain("border");
  });

  // ── Type ───────────────────────────────────────────────────────

  it("applies text type by default", () => {
    const { container } = render(<Input />);
    const input = container.querySelector("input");
    expect(input?.getAttribute("type")).toBeNull();
  });

  it("applies password type", () => {
    const { container } = render(<Input type="password" />);
    const input = container.querySelector("input");
    expect(input?.getAttribute("type")).toBe("password");
  });

  it("applies email type", () => {
    const { container } = render(<Input type="email" />);
    const input = container.querySelector("input");
    expect(input?.getAttribute("type")).toBe("email");
  });

  it("applies number type", () => {
    const { container } = render(<Input type="number" />);
    const input = container.querySelector("input");
    expect(input?.getAttribute("type")).toBe("number");
  });

  // ── Props ──────────────────────────────────────────────────────

  it("forwards className prop", () => {
    const { container } = render(<Input className="custom-input" />);
    const input = container.querySelector("input");
    expect(input?.className).toContain("custom-input");
  });

  it("forwards placeholder prop", () => {
    const { container } = render(<Input placeholder="Enter text" />);
    const input = container.querySelector("input");
    expect(input?.getAttribute("placeholder")).toBe("Enter text");
  });

  it("forwards value prop", () => {
    const { container } = render(<Input value="test value" readOnly />);
    const input = container.querySelector("input");
    expect(input?.value).toBe("test value");
  });

  it("forwards disabled prop", () => {
    const { container } = render(<Input disabled />);
    const input = container.querySelector("input");
    expect(input?.disabled).toBe(true);
  });

  it("forwards readOnly prop", () => {
    const { container } = render(<Input readOnly />);
    const input = container.querySelector("input");
    expect(input?.readOnly).toBe(true);
  });

  it("forwards name prop", () => {
    const { container } = render(<Input name="username" />);
    const input = container.querySelector("input");
    expect(input?.getAttribute("name")).toBe("username");
  });

  it("forwards id prop", () => {
    const { container } = render(<Input id="email-field" />);
    const input = container.querySelector("input");
    expect(input?.getAttribute("id")).toBe("email-field");
  });

  it("forwards onChange handler", () => {
    let changed = false;
    const { container } = render(<Input onChange={() => { changed = true; }} />);
    const input = container.querySelector("input")!;
    fireEvent.change(input, { target: { value: "new" } });
    expect(changed).toBe(true);
  });

  it("forwards onFocus handler", () => {
    let focused = false;
    const { container } = render(<Input onFocus={() => { focused = true; }} />);
    const input = container.querySelector("input");
    input?.focus();
    expect(focused).toBe(true);
  });

  it("forwards onBlur handler", () => {
    let blurred = false;
    const { container } = render(<Input onBlur={() => { blurred = true; }} />);
    const input = container.querySelector("input");
    input?.focus();
    input?.blur();
    expect(blurred).toBe(true);
  });

  // ── TestID ─────────────────────────────────────────────────────

  it("assigns dynamic testid", () => {
    const { container } = render(<Input />);
    const input = container.querySelector("input");
    expect(input?.getAttribute("data-testid")).toBeTruthy();
  });

  it("uses name in testid when provided", () => {
    const { container } = render(<Input name="email" />);
    const input = container.querySelector("input");
    const testid = input?.getAttribute("data-testid");
    expect(testid).toContain("email");
  });

  it("uses title in testid when provided", () => {
    const { container } = render(<Input title="Search Field" />);
    const input = container.querySelector("input");
    const testid = input?.getAttribute("data-testid");
    expect(testid).toContain("search-field");
  });

  it("uses aria-label in testid when provided", () => {
    const { container } = render(<Input aria-label="Password Input" />);
    const input = container.querySelector("input");
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
