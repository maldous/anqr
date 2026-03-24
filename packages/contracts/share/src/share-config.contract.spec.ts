import { describe, expect, it } from "vitest";
import type { ShareConfig } from "./share-config.contract";

describe("ShareConfig", () => {
  it("should allow empty object", () => {
    const config: ShareConfig = {};
    expect(config).toBeDefined();
  });

  it("should allow basic QR configuration", () => {
    const config: ShareConfig = {
      data: "https://example.com",
      ec: "M",
      version: 10,
      size: 300,
    };

    expect(config.data).toBe("https://example.com");
    expect(config.ec).toBe("M");
    expect(config.version).toBe(10);
    expect(config.size).toBe(300);
  });

  it("should allow color configuration", () => {
    const config: ShareConfig = {
      fg: "#000000",
      bg: "#ffffff",
      transparent: false,
    };

    expect(config.fg).toBe("#000000");
    expect(config.bg).toBe("#ffffff");
    expect(config.transparent).toBe(false);
  });

  it("should allow gradient configuration", () => {
    const config: ShareConfig = {
      gradientType: "linear",
      gradientStops: [
        { color: "#ff0000", pos: 0 },
        { color: "#00ff00", pos: 1 },
      ],
      gradientAngle: 45,
    };

    expect(config.gradientType).toBe("linear");
    expect(config.gradientStops).toHaveLength(2);
    expect(config.gradientAngle).toBe(45);
  });

  it("should allow overlay configuration", () => {
    const config: ShareConfig = {
      overlayUrl: "https://example.com/logo.png",
      overlayType: "image",
      mode: "blend",
      intensity: 50,
    };

    expect(config.overlayUrl).toBe("https://example.com/logo.png");
    expect(config.overlayType).toBe("image");
    expect(config.mode).toBe("blend");
    expect(config.intensity).toBe(50);
  });

  it("should allow animation configuration", () => {
    const config: ShareConfig = {
      animationPattern: "wave",
      animationTarget: "modules",
      animationWaveAxis: "x",
      animationFrames: 30,
      animationSpeed: 1.5,
      animationSeed: 42,
    };

    expect(config.animationPattern).toBe("wave");
    expect(config.animationTarget).toBe("modules");
    expect(config.animationWaveAxis).toBe("x");
    expect(config.animationFrames).toBe(30);
    expect(config.animationSpeed).toBe(1.5);
    expect(config.animationSeed).toBe(42);
  });

  it("should allow output format configuration", () => {
    const config: ShareConfig = {
      format: "png",
      quality: 90,
      width: 800,
      height: 800,
      dpi: 300,
    };

    expect(config.format).toBe("png");
    expect(config.quality).toBe(90);
    expect(config.width).toBe(800);
    expect(config.height).toBe(800);
    expect(config.dpi).toBe(300);
  });

  it("should allow comprehensive configuration", () => {
    const config: ShareConfig = {
      data: "https://example.com",
      ec: "H",
      version: 15,
      fg: "#000000",
      bg: "#ffffff",
      style: "rounded",
      finder: "rounded",
      overlayUrl: "https://example.com/logo.png",
      format: "svg",
      watermarkEnabled: true,
      watermarkText: "ANQR",
      metaTitle: "Example QR",
      metaAuthor: "ANQR",
    };

    expect(config.data).toBe("https://example.com");
    expect(config.ec).toBe("H");
    expect(config.version).toBe(15);
    expect(config.watermarkEnabled).toBe(true);
    expect(config.watermarkText).toBe("ANQR");
  });
});
