import { describe, expect, it } from "vitest";
import {
  qrCapabilitiesResourceSchema,
  qrCapabilitiesResourceUri,
  type QrCapabilitiesResource,
} from "./qr-capabilities-resource.contract";

describe("qrCapabilitiesResourceSchema", () => {
  it("should validate a complete capabilities resource", () => {
    const valid: QrCapabilitiesResource = {
      tools: ["generate_qr", "generate_qr_advanced"],
      formats: ["png", "svg", "webp", "gif"],
      errorCorrectionLevels: ["L", "M", "Q", "H"],
      size: { min: 50, max: 4096, default: 400 },
      margin: { min: 0, max: 20, default: 4 },
      overlay: {
        httpsOnly: true,
        privateNetworkBlocked: true,
        redirectsRevalidated: true,
        maxBytes: 10485760,
        timeoutMs: 5000,
      },
      safety: [
        "HTTPS-only overlay fetching",
        "Private network blocking",
        "Redirect validation",
      ],
    };

    expect(() => qrCapabilitiesResourceSchema.parse(valid)).not.toThrow();
  });

  it("should have correct URI constant", () => {
    expect(qrCapabilitiesResourceUri).toBe("anqr://qr/capabilities");
  });

  it("should reject invalid tool names", () => {
    const invalid = {
      tools: ["invalid_tool"],
      formats: ["png"],
      errorCorrectionLevels: ["H"],
      size: { min: 50, max: 4096, default: 400 },
      margin: { min: 0, max: 20, default: 4 },
      overlay: {
        httpsOnly: true,
        privateNetworkBlocked: true,
        redirectsRevalidated: true,
        maxBytes: 1024,
        timeoutMs: 5000,
      },
      safety: [],
    };

    expect(() => qrCapabilitiesResourceSchema.parse(invalid)).toThrow();
  });

  it("should reject invalid formats", () => {
    const invalid = {
      tools: ["generate_qr"],
      formats: ["jpeg"],
      errorCorrectionLevels: ["H"],
      size: { min: 50, max: 4096, default: 400 },
      margin: { min: 0, max: 20, default: 4 },
      overlay: {
        httpsOnly: true,
        privateNetworkBlocked: true,
        redirectsRevalidated: true,
        maxBytes: 1024,
        timeoutMs: 5000,
      },
      safety: [],
    };

    expect(() => qrCapabilitiesResourceSchema.parse(invalid)).toThrow();
  });

  it("should reject negative size values", () => {
    const invalid = {
      tools: ["generate_qr"],
      formats: ["png"],
      errorCorrectionLevels: ["H"],
      size: { min: -1, max: 4096, default: 400 },
      margin: { min: 0, max: 20, default: 4 },
      overlay: {
        httpsOnly: true,
        privateNetworkBlocked: true,
        redirectsRevalidated: true,
        maxBytes: 1024,
        timeoutMs: 5000,
      },
      safety: [],
    };

    expect(() => qrCapabilitiesResourceSchema.parse(invalid)).toThrow();
  });
});
