import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { AdUnit } from "./ad-unit";

// Mock Capacitor
vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
  },
}));

// Mock child components
vi.mock("./ad-placeholder", () => ({
  AdPlaceholder: ({ slot, width, height, className, format }: any) => (
    <div
      data-testid="ad-placeholder"
      data-slot={slot}
      data-width={width}
      data-height={height}
      data-className={className}
      data-format={format}
    >
      Placeholder: {slot}
    </div>
  ),
}));

vi.mock("./ad-sense", () => ({
  AdSense: ({ slot, format, responsive, className, width, height }: any) => (
    <div
      data-testid="ad-sense"
      data-slot={slot}
      data-format={format}
      data-responsive={String(responsive)}
      data-className={className}
      data-width={width}
      data-height={height}
    >
      AdSense: {slot}
    </div>
  ),
}));

describe("AdUnit", () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    Object.assign(import.meta.env, originalEnv);
  });

  // ── Native platform ────────────────────────────────────────────

  describe("Native platform", () => {
    it("renders null on native platform", async () => {
      const { Capacitor } = await import("@capacitor/core");
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);

      const { container } = render(<AdUnit slot="gallery-top" />);
      expect(container.firstChild).toBeNull();
    });
  });

  // ── Web platform - development ─────────────────────────────────

  describe("Web platform - development", () => {
    beforeEach(() => {
      import.meta.env.PROD = false;
    });

    it("renders placeholder in development", () => {
      const { getByTestId } = render(<AdUnit slot="gallery-top" />);
      expect(getByTestId("ad-placeholder")).toBeTruthy();
    });

    it("passes slot to placeholder", () => {
      const { getByTestId } = render(<AdUnit slot="gallery-top" />);
      const placeholder = getByTestId("ad-placeholder");
      expect(placeholder.getAttribute("data-slot")).toBe("gallery-top");
    });

    it("passes default width to placeholder", () => {
      const { getByTestId } = render(<AdUnit slot="test" />);
      const placeholder = getByTestId("ad-placeholder");
      expect(placeholder.getAttribute("data-width")).toBe("100%");
    });

    it("passes custom width to placeholder", () => {
      const { getByTestId } = render(<AdUnit slot="test" width={300} />);
      const placeholder = getByTestId("ad-placeholder");
      expect(placeholder.getAttribute("data-width")).toBe("300");
    });

    it("passes default height to placeholder", () => {
      const { getByTestId } = render(<AdUnit slot="test" />);
      const placeholder = getByTestId("ad-placeholder");
      expect(placeholder.getAttribute("data-height")).toBe("90");
    });

    it("passes custom height to placeholder", () => {
      const { getByTestId } = render(<AdUnit slot="test" height={250} />);
      const placeholder = getByTestId("ad-placeholder");
      expect(placeholder.getAttribute("data-height")).toBe("250");
    });

    it("passes className to placeholder", () => {
      const { getByTestId } = render(<AdUnit slot="test" className="custom-ad" />);
      const placeholder = getByTestId("ad-placeholder");
      expect(placeholder.getAttribute("data-className")).toBe("custom-ad");
    });

    it("passes format to placeholder", () => {
      const { getByTestId } = render(<AdUnit slot="test" format="rectangle" />);
      const placeholder = getByTestId("ad-placeholder");
      expect(placeholder.getAttribute("data-format")).toBe("rectangle");
    });
  });

  // ── Web platform - production test mode ───────────────────────

  describe("Web platform - production test mode", () => {
    beforeEach(() => {
      import.meta.env.PROD = true;
      import.meta.env.VITE_ADSENSE_TEST_MODE = "true";
    });

    it("renders placeholder in test mode", () => {
      const { getByTestId } = render(<AdUnit slot="gallery-top" />);
      expect(getByTestId("ad-placeholder")).toBeTruthy();
    });

    it("does not render AdSense in test mode", () => {
      const { queryByTestId } = render(<AdUnit slot="gallery-top" />);
      expect(queryByTestId("ad-sense")).toBeNull();
    });
  });

  // ── Web platform - production with slot ID ────────────────────

  describe("Web platform - production with slot ID", () => {
    beforeEach(() => {
      import.meta.env.PROD = true;
      import.meta.env.VITE_ADSENSE_TEST_MODE = "false";
      import.meta.env.VITE_ADSENSE_ENABLED = "true";
    });

    it("renders AdSense when numeric slot provided", () => {
      const { getByTestId } = render(<AdUnit slot="1234567890" />);
      expect(getByTestId("ad-sense")).toBeTruthy();
    });

    it("passes slot to AdSense", () => {
      const { getByTestId } = render(<AdUnit slot="1234567890" />);
      const adSense = getByTestId("ad-sense");
      expect(adSense.getAttribute("data-slot")).toBe("1234567890");
    });

    it("passes format to AdSense", () => {
      const { getByTestId } = render(<AdUnit slot="1234567890" format="rectangle" />);
      const adSense = getByTestId("ad-sense");
      expect(adSense.getAttribute("data-format")).toBe("rectangle");
    });

    it("passes responsive to AdSense", () => {
      const { getByTestId } = render(<AdUnit slot="1234567890" responsive={false} />);
      const adSense = getByTestId("ad-sense");
      expect(adSense.getAttribute("data-responsive")).toBe("false");
    });

    it("passes className to AdSense", () => {
      const { getByTestId } = render(<AdUnit slot="1234567890" className="custom-ad" />);
      const adSense = getByTestId("ad-sense");
      expect(adSense.getAttribute("data-className")).toBe("custom-ad");
    });

    it("passes numeric width to AdSense", () => {
      const { getByTestId } = render(<AdUnit slot="1234567890" width={300} />);
      const adSense = getByTestId("ad-sense");
      expect(adSense.getAttribute("data-width")).toBe("300");
    });

    it("does not pass string width to AdSense", () => {
      const { getByTestId } = render(<AdUnit slot="1234567890" width="100%" />);
      const adSense = getByTestId("ad-sense");
      expect(adSense.getAttribute("data-width")).toBe("undefined");
    });

    it("passes height to AdSense", () => {
      const { getByTestId } = render(<AdUnit slot="1234567890" height={250} />);
      const adSense = getByTestId("ad-sense");
      expect(adSense.getAttribute("data-height")).toBe("250");
    });

    it("renders placeholder when slot is not numeric", () => {
      const { getByTestId } = render(<AdUnit slot="gallery-top" />);
      expect(getByTestId("ad-placeholder")).toBeTruthy();
    });

    it("renders placeholder when slot is empty string", () => {
      const { getByTestId } = render(<AdUnit slot="" />);
      expect(getByTestId("ad-placeholder")).toBeTruthy();
    });
  });

  // ── Web platform - production with VITE_ADSENSE_ENABLED=false ─

  describe("Web platform - ADSENSE_ENABLED=false", () => {
    beforeEach(() => {
      import.meta.env.PROD = true;
      import.meta.env.VITE_ADSENSE_TEST_MODE = "false";
      import.meta.env.VITE_ADSENSE_ENABLED = "false";
    });

    it("renders placeholder when ads disabled", () => {
      const { getByTestId } = render(<AdUnit slot="1234567890" />);
      expect(getByTestId("ad-placeholder")).toBeTruthy();
    });
  });

  // ── Default props ──────────────────────────────────────────────

  describe("Default props", () => {
    beforeEach(() => {
      import.meta.env.PROD = false;
    });

    it("uses default format auto", () => {
      const { getByTestId } = render(<AdUnit slot="test" />);
      const placeholder = getByTestId("ad-placeholder");
      expect(placeholder.getAttribute("data-format")).toBe("auto");
    });

    it("uses default responsive true", () => {
      import.meta.env.PROD = true;
      import.meta.env.VITE_ADSENSE_ENABLED = "true";
      const { getByTestId } = render(<AdUnit slot="1234567890" />);
      const adSense = getByTestId("ad-sense");
      expect(adSense.getAttribute("data-responsive")).toBe("true");
    });

    it("uses default width 100%", () => {
      const { getByTestId } = render(<AdUnit slot="test" />);
      const placeholder = getByTestId("ad-placeholder");
      expect(placeholder.getAttribute("data-width")).toBe("100%");
    });

    it("uses default height 90", () => {
      const { getByTestId } = render(<AdUnit slot="test" />);
      const placeholder = getByTestId("ad-placeholder");
      expect(placeholder.getAttribute("data-height")).toBe("90");
    });

    it("uses default className empty string", () => {
      const { getByTestId } = render(<AdUnit slot="test" />);
      const placeholder = getByTestId("ad-placeholder");
      expect(placeholder.getAttribute("data-className")).toBe("");
    });
  });
});
