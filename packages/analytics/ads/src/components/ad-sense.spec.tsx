import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { AdSense } from "./ad-sense";

describe("AdSense", () => {
  beforeEach(() => {
    // Mock adsbygoogle
    (globalThis as any).adsbygoogle = [];
    // Mock ResizeObserver (not available in jsdom)
    (globalThis as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  afterEach(() => {
    delete (globalThis as any).adsbygoogle;
    delete (globalThis as any).ResizeObserver;
    vi.clearAllTimers();
  });

  it("should render ins element with adsbygoogle class", () => {
    const { container } = render(<AdSense slot="123456" />);
    const ins = container.querySelector("ins.adsbygoogle");
    expect(ins).toBeTruthy();
  });

  it("should set data-ad-client attribute", () => {
    const { container } = render(<AdSense slot="123456" />);
    const ins = container.querySelector("ins");
    expect(ins?.getAttribute("data-ad-client")).toBeTruthy();
    expect(ins?.getAttribute("data-ad-client")).toContain("ca-pub-");
  });

  it("should set data-ad-slot attribute", () => {
    const { container } = render(<AdSense slot="123456" />);
    const ins = container.querySelector("ins");
    expect(ins?.getAttribute("data-ad-slot")).toBe("123456");
  });

  it("should set data-ad-format attribute", () => {
    const { container } = render(<AdSense slot="123456" format="rectangle" />);
    const ins = container.querySelector("ins");
    expect(ins?.getAttribute("data-ad-format")).toBe("rectangle");
  });

  it("should use auto format by default", () => {
    const { container } = render(<AdSense slot="123456" />);
    const ins = container.querySelector("ins");
    expect(ins?.getAttribute("data-ad-format")).toBe("auto");
  });

  it("should set responsive attribute to true by default", () => {
    const { container } = render(<AdSense slot="123456" />);
    const ins = container.querySelector("ins");
    expect(ins?.getAttribute("data-full-width-responsive")).toBe("true");
  });

  it("should set responsive attribute to false when specified", () => {
    const { container } = render(<AdSense slot="123456" responsive={false} />);
    const ins = container.querySelector("ins");
    expect(ins?.getAttribute("data-full-width-responsive")).toBe("false");
  });

  it("should apply custom className to wrapper", () => {
    const { container } = render(<AdSense slot="123456" className="custom-ad" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toBe("custom-ad");
  });

  it("should apply width to ins element when specified", () => {
    const { container } = render(<AdSense slot="123456" width={300} />);
    const ins = container.querySelector("ins");
    expect(ins?.getAttribute("style")).toContain("width");
  });

  it("should apply height to ins element", () => {
    const { container } = render(<AdSense slot="123456" height={250} />);
    const ins = container.querySelector("ins");
    expect(ins?.getAttribute("style")).toContain("height");
  });

  it("should use default height of 90px in wrapper", () => {
    const { container } = render(<AdSense slot="123456" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.getAttribute("style")).toContain("height: 90px");
  });

  it("should apply custom height to wrapper", () => {
    const { container } = render(<AdSense slot="123456" height={200} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.getAttribute("style")).toContain("height: 200px");
  });

  it("should set wrapper overflow to hidden", () => {
    const { container } = render(<AdSense slot="123456" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.getAttribute("style")).toContain("overflow: hidden");
  });

  it("should set ins display to block", () => {
    const { container } = render(<AdSense slot="123456" />);
    const ins = container.querySelector("ins");
    expect(ins?.getAttribute("style")).toContain("display: block");
  });

  it("should use 100% width for wrapper by default", () => {
    const { container } = render(<AdSense slot="123456" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.getAttribute("style")).toContain("width: 100%");
  });

  it("should apply custom width to wrapper", () => {
    const { container } = render(<AdSense slot="123456" width={300} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.getAttribute("style")).toContain("width: 300px");
  });
});
