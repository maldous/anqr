import { describe, it, expect } from "vitest";
import { autoDetectTypeNumber } from "./auto-detect-type-number";
import { qr8BitByte } from "./data-modes";
import { QRErrorCorrectionLevel } from "./types";

describe("autoDetectTypeNumber", () => {
  it("returns version 1 for very short data", () => {
    const dataList = [qr8BitByte("Hi")];
    const version = autoDetectTypeNumber(QRErrorCorrectionLevel.L, dataList);
    expect(version).toBe(1);
  });

  it("returns higher version for longer data", () => {
    const longData = "A".repeat(100);
    const dataList = [qr8BitByte(longData)];
    const version = autoDetectTypeNumber(QRErrorCorrectionLevel.L, dataList);
    expect(version).toBeGreaterThan(1);
  });

  it("returns version 40 for data that exceeds capacity", () => {
    const veryLongData = "A".repeat(10000);
    const dataList = [qr8BitByte(veryLongData)];
    const version = autoDetectTypeNumber(QRErrorCorrectionLevel.L, dataList);
    expect(version).toBe(40);
  });

  it("selects smaller version for higher error correction levels", () => {
    const data = "Test";
    const dataList = [qr8BitByte(data)];
    const versionL = autoDetectTypeNumber(QRErrorCorrectionLevel.L, dataList);
    const versionH = autoDetectTypeNumber(QRErrorCorrectionLevel.H, dataList);
    expect(versionL).toBeLessThanOrEqual(versionH);
  });

  it("handles empty data list", () => {
    const version = autoDetectTypeNumber(QRErrorCorrectionLevel.M, []);
    expect(version).toBeGreaterThanOrEqual(1);
    expect(version).toBeLessThanOrEqual(40);
  });

  it("returns consistent results for same input", () => {
    const dataList = [qr8BitByte("test data")];
    const v1 = autoDetectTypeNumber(QRErrorCorrectionLevel.M, dataList);
    const v2 = autoDetectTypeNumber(QRErrorCorrectionLevel.M, dataList);
    expect(v1).toBe(v2);
  });
});
