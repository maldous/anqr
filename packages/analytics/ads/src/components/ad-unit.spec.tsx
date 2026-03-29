import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { AdUnit } from "./ad-unit";
import * as CapacitorCore from "@capacitor/core";

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
  },
}));

describe("AdUnit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("should render null on native platforms", () => {
    vi.mocked(CapacitorCore.Capacitor.isNativePlatform).mockReturnValue(true);
    const { container } = render(<AdUnit slot="123456" />);
    expect(container.firstChild).toBeNull();
  });

  it("should render placeholder in development", () => {
    vi.stubEnv("PROD", false);
    vi.mocked(CapacitorCore.Capacitor.isNativePlatform).mockReturnValue(false);
    const { container } = render(<AdUnit slot="123456" />);
    expect(container.querySelector(".ad-placeholder")).toBeTruthy();
  });

  it("should render placeholder when test mode enabled", () => {
    vi.stubEnv("PROD", true);
    vi.stubEnv("VITE_ADSENSE_TEST_MODE", "true");
    vi.mocked(CapacitorCore.Capacitor.isNativePlatform).mockReturnValue(false);
    const { container } = render(<AdUnit slot="123456" />);
    expect(container.querySelector(".ad-placeholder")).toBeTruthy();
  });

  it("should render placeholder when slot not configured", () => {
    vi.stubEnv("PROD", true);
    vi.stubEnv("VITE_ADSENSE_ENABLED", "true");
    vi.stubEnv("VITE_ADSENSE_TEST_MODE", "false");
    vi.mocked(CapacitorCore.Capacitor.isNativePlatform).mockReturnValue(false);
    const { container } = render(<AdUnit slot="invalid-slot" />);
    expect(container.querySelector(".ad-placeholder")).toBeTruthy();
  });

  it("should render AdSense in production with valid config", () => {
    vi.stubEnv("PROD", true);
    vi.stubEnv("VITE_ADSENSE_ENABLED", "true");
    vi.stubEnv("VITE_ADSENSE_TEST_MODE", "false");
    vi.mocked(CapacitorCore.Capacitor.isNativePlatform).mockReturnValue(false);
    const { container } = render(<AdUnit slot="123456" />);
    expect(container.querySelector(".adsbygoogle")).toBeTruthy();
  });

  it("should pass width to AdSense when numeric", () => {
    vi.stubEnv("PROD", true);
    vi.stubEnv("VITE_ADSENSE_ENABLED", "true");
    vi.stubEnv("VITE_ADSENSE_TEST_MODE", "false");
    vi.mocked(CapacitorCore.Capacitor.isNativePlatform).mockReturnValue(false);
    const { container } = render(<AdUnit slot="123456" width={300} />);
    const ins = container.querySelector(".adsbygoogle");
    expect(ins?.getAttribute("style")).toContain("width");
  });

  it("should pass height to components", () => {
    vi.stubEnv("PROD", false);
    vi.mocked(CapacitorCore.Capacitor.isNativePlatform).mockReturnValue(false);
    const { container } = render(<AdUnit slot="123456" height={250} />);
    const placeholder = container.querySelector(".ad-placeholder");
    expect(placeholder?.getAttribute("style")).toContain("250px");
  });

  it("should pass className to components", () => {
    vi.stubEnv("PROD", false);
    vi.mocked(CapacitorCore.Capacitor.isNativePlatform).mockReturnValue(false);
    const { container } = render(<AdUnit slot="123456" className="my-ad" />);
    const placeholder = container.querySelector(".ad-placeholder");
    expect(placeholder?.className).toContain("my-ad");
  });

  it("should pass format to components", () => {
    vi.stubEnv("PROD", false);
    vi.mocked(CapacitorCore.Capacitor.isNativePlatform).mockReturnValue(false);
    const { container } = render(<AdUnit slot="123456" format="rectangle" />);
    const placeholder = container.querySelector(".ad-placeholder");
    expect(placeholder?.getAttribute("data-ad-format")).toBe("rectangle");
  });

  it("should use auto format by default", () => {
    vi.stubEnv("PROD", false);
    vi.mocked(CapacitorCore.Capacitor.isNativePlatform).mockReturnValue(false);
    const { container } = render(<AdUnit slot="123456" />);
    const placeholder = container.querySelector(".ad-placeholder");
    expect(placeholder?.getAttribute("data-ad-format")).toBe("auto");
  });

  it("should handle responsive prop", () => {
    vi.stubEnv("PROD", true);
    vi.stubEnv("VITE_ADSENSE_ENABLED", "true");
    vi.stubEnv("VITE_ADSENSE_TEST_MODE", "false");
    vi.mocked(CapacitorCore.Capacitor.isNativePlatform).mockReturnValue(false);
    const { container } = render(<AdUnit slot="123456" responsive={false} />);
    const ins = container.querySelector(".adsbygoogle");
    expect(ins?.getAttribute("data-full-width-responsive")).toBe("false");
  });

  it("should render placeholder when VITE_ADSENSE_ENABLED is false", () => {
    vi.stubEnv("PROD", true);
    vi.stubEnv("VITE_ADSENSE_ENABLED", "false");
    vi.stubEnv("VITE_ADSENSE_TEST_MODE", "false");
    vi.mocked(CapacitorCore.Capacitor.isNativePlatform).mockReturnValue(false);
    const { container } = render(<AdUnit slot="123456" />);
    expect(container.querySelector(".ad-placeholder")).toBeTruthy();
  });
});
