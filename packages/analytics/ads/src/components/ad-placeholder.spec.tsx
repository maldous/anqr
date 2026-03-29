import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { AdPlaceholder } from "./ad-placeholder";

describe("AdPlaceholder", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should render with default props", () => {
    const { container } = render(<AdPlaceholder slot="test-slot" />);
    expect(container.querySelector(".ad-placeholder")).toBeTruthy();
  });

  it("should render slot name in development", () => {
    vi.stubEnv("PROD", false);
    const { getByText } = render(<AdPlaceholder slot="my-slot" />);
    expect(getByText("Ad: my-slot")).toBeTruthy();
  });

  it("should apply custom width", () => {
    const { container } = render(<AdPlaceholder slot="test" width={300} />);
    const element = container.querySelector(".ad-placeholder");
    expect(element?.getAttribute("style")).toContain("width: 300px");
  });

  it("should apply percentage width", () => {
    const { container } = render(<AdPlaceholder slot="test" width="50%" />);
    const element = container.querySelector(".ad-placeholder");
    expect(element?.getAttribute("style")).toContain("width: 50%");
  });

  it("should apply custom height", () => {
    const { container } = render(<AdPlaceholder slot="test" height={200} />);
    const element = container.querySelector(".ad-placeholder");
    expect(element?.getAttribute("style")).toContain("height: 200px");
  });

  it("should apply custom className", () => {
    const { container } = render(<AdPlaceholder slot="test" className="custom-class" />);
    const element = container.querySelector(".ad-placeholder");
    expect(element?.className).toContain("custom-class");
  });

  it("should include data-ad-slot attribute", () => {
    const { container } = render(<AdPlaceholder slot="my-slot" />);
    const element = container.querySelector(".ad-placeholder");
    expect(element?.getAttribute("data-ad-slot")).toBe("my-slot");
  });

  it("should include data-ad-format attribute", () => {
    const { container } = render(<AdPlaceholder slot="test" format="rectangle" />);
    const element = container.querySelector(".ad-placeholder");
    expect(element?.getAttribute("data-ad-format")).toBe("rectangle");
  });

  it("should use default format of auto", () => {
    const { container } = render(<AdPlaceholder slot="test" />);
    const element = container.querySelector(".ad-placeholder");
    expect(element?.getAttribute("data-ad-format")).toBe("auto");
  });

  it("should render polished placeholder in production test mode", () => {
    vi.stubEnv("PROD", true);
    vi.stubEnv("VITE_ADSENSE_TEST_MODE", "true");
    const { getByText } = render(<AdPlaceholder slot="test" />);
    expect(getByText("Advertisement")).toBeTruthy();
    expect(getByText("(Test Mode)")).toBeTruthy();
  });

  it("should not show slot name in production test mode", () => {
    vi.stubEnv("PROD", true);
    vi.stubEnv("VITE_ADSENSE_TEST_MODE", "true");
    const { queryByText } = render(<AdPlaceholder slot="my-slot" />);
    expect(queryByText("Ad: my-slot")).toBeNull();
  });

  it("should apply minHeight equal to height", () => {
    const { container } = render(<AdPlaceholder slot="test" height={150} />);
    const element = container.querySelector(".ad-placeholder");
    expect(element?.getAttribute("style")).toContain("min-height: 150px");
  });
});
