import { describe, it, expect } from "vitest";
import { getDefaultExportConfig } from "./default-export-config";

describe("getDefaultExportConfig", () => {
  it("should return default export configuration", () => {
    const config = getDefaultExportConfig();
    expect(config).toBeDefined();
  });

  it("should set outputFormat to png", () => {
    const config = getDefaultExportConfig();
    expect(config.outputFormat).toBe("png");
  });

  it("should set default dimensions to 400x400", () => {
    const config = getDefaultExportConfig();
    expect(config.outputWidth).toBe(400);
    expect(config.outputHeight).toBe(400);
  });

  it("should set outputQuality to 0.9", () => {
    const config = getDefaultExportConfig();
    expect(config.outputQuality).toBe(0.9);
  });

  it("should set default filename", () => {
    const config = getDefaultExportConfig();
    expect(config.filename).toBe("anqr-qrcode");
  });

  it("should set animation defaults", () => {
    const config = getDefaultExportConfig();
    expect(config.animationSpeed).toBe(100);
    expect(config.loopAnimation).toBe(true);
  });

  it("should set transparentBackground to false", () => {
    const config = getDefaultExportConfig();
    expect(config.transparentBackground).toBe(false);
  });

  it("should set dpi to 72", () => {
    const config = getDefaultExportConfig();
    expect(config.dpi).toBe(72);
  });

  it("should set includeMetadata to false", () => {
    const config = getDefaultExportConfig();
    expect(config.includeMetadata).toBe(false);
  });

  it("should set includeQuietZone to true", () => {
    const config = getDefaultExportConfig();
    expect(config.includeQuietZone).toBe(true);
  });

  it("should set bgOverride to empty string", () => {
    const config = getDefaultExportConfig();
    expect(config.bgOverride).toBe("");
  });

  it("should set gifDisposal to keep", () => {
    const config = getDefaultExportConfig();
    expect(config.gifDisposal).toBe("keep");
  });

  it("should return a new object each time", () => {
    const config1 = getDefaultExportConfig();
    const config2 = getDefaultExportConfig();
    expect(config1).not.toBe(config2);
    expect(config1).toEqual(config2);
  });
});
