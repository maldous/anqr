import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Button, buttonVariants } from "./button";

describe("Button", () => {
  // ── Rendering ──────────────────────────────────────────────────
  
  it("renders as button element by default", () => {
    const { container } = render(<Button>Click me</Button>);
    const button = container.querySelector("button");
    expect(button?.tagName).toBe("BUTTON");
  });

  it("renders children", () => {
    const { container } = render(<Button>Save</Button>);
    const button = container.querySelector("button");
    expect(button?.textContent).toBe("Save");
  });

  it("applies default variant classes", () => {
    const { container } = render(<Button>Default</Button>);
    const button = container.querySelector("button");
    expect(button?.className).toContain("bg-primary");
  });

  // ── Variants ───────────────────────────────────────────────────

  it("applies destructive variant", () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    const button = container.querySelector("button");
    expect(button?.className).toContain("bg-destructive");
  });

  it("applies outline variant", () => {
    const { container } = render(<Button variant="outline">Outline</Button>);
    const button = container.querySelector("button");
    expect(button?.className).toContain("border");
  });

  it("applies secondary variant", () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>);
    const button = container.querySelector("button");
    expect(button?.className).toContain("bg-secondary");
  });

  it("applies ghost variant", () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>);
    const button = container.querySelector("button");
    expect(button?.className).toContain("hover:bg-accent");
  });

  it("applies link variant", () => {
    const { container } = render(<Button variant="link">Link</Button>);
    const button = container.querySelector("button");
    expect(button?.className).toContain("underline-offset-4");
  });

  // ── Sizes ──────────────────────────────────────────────────────

  it("applies default size", () => {
    const { container } = render(<Button>Default</Button>);
    const button = container.querySelector("button");
    expect(button?.className).toContain("h-10");
  });

  it("applies small size", () => {
    const { container } = render(<Button size="sm">Small</Button>);
    const button = container.querySelector("button");
    expect(button?.className).toContain("h-9");
  });

  it("applies large size", () => {
    const { container } = render(<Button size="lg">Large</Button>);
    const button = container.querySelector("button");
    expect(button?.className).toContain("h-11");
  });

  it("applies icon size", () => {
    const { container } = render(<Button size="icon">🔍</Button>);
    const button = container.querySelector("button");
    expect(button?.className).toContain("h-10");
    expect(button?.className).toContain("w-10");
  });

  // ── Props ──────────────────────────────────────────────────────

  it("forwards className prop", () => {
    const { container } = render(<Button className="custom-class">Button</Button>);
    const button = container.querySelector("button");
    expect(button?.className).toContain("custom-class");
  });

  it("forwards onClick handler", () => {
    let clicked = false;
    const { container } = render(<Button onClick={() => { clicked = true; }}>Click</Button>);
    const button = container.querySelector("button");
    button?.click();
    expect(clicked).toBe(true);
  });

  it("forwards disabled prop", () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const button = container.querySelector("button") as HTMLButtonElement;
    expect(button?.disabled).toBe(true);
  });

  it("forwards type prop", () => {
    const { container } = render(<Button type="submit">Submit</Button>);
    const button = container.querySelector("button");
    expect(button?.getAttribute("type")).toBe("submit");
  });

  // ── TestID ─────────────────────────────────────────────────────

  it("assigns dynamic testid", () => {
    const { container } = render(<Button>Test</Button>);
    const button = container.querySelector("button");
    expect(button?.getAttribute("data-testid")).toBeTruthy();
  });

  it("uses title in testid when provided", () => {
    const { container } = render(<Button title="Save Document">Save</Button>);
    const button = container.querySelector("button");
    const testid = button?.getAttribute("data-testid");
    expect(testid).toContain("save-document");
  });

  it("uses aria-label in testid when provided", () => {
    const { container } = render(<Button aria-label="Close Dialog">×</Button>);
    const button = container.querySelector("button");
    const testid = button?.getAttribute("data-testid");
    expect(testid).toContain("close-dialog");
  });

  // ── buttonVariants ─────────────────────────────────────────────

  it("buttonVariants generates default classes", () => {
    const classes = buttonVariants();
    expect(classes).toContain("bg-primary");
    expect(classes).toContain("h-10");
  });

  it("buttonVariants accepts variant option", () => {
    const classes = buttonVariants({ variant: "destructive" });
    expect(classes).toContain("bg-destructive");
  });

  it("buttonVariants accepts size option", () => {
    const classes = buttonVariants({ size: "sm" });
    expect(classes).toContain("h-9");
  });

  it("buttonVariants accepts className option", () => {
    const classes = buttonVariants({ className: "custom" });
    expect(classes).toContain("custom");
  });
});
