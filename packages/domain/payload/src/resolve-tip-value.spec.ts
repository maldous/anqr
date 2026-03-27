import { describe, it, expect } from "vitest";
import { resolveTipValue } from "./resolve-tip-value";

describe("resolveTipValue", () => {
  it("should return tipFixed when tipIndicator is 02", () => {
    const result = resolveTipValue({ tipIndicator: "02", tipFixed: 5.5 });
    expect(result).toBe(5.5);
  });

  it("should return tipPercentage when tipIndicator is 03", () => {
    const result = resolveTipValue({ tipIndicator: "03", tipPercentage: 15 });
    expect(result).toBe(15);
  });

  it("should return undefined when tipIndicator is neither 02 nor 03", () => {
    const result = resolveTipValue({ tipIndicator: "01" });
    expect(result).toBeUndefined();
  });

  it("should return undefined when no tipIndicator is provided", () => {
    const result = resolveTipValue({});
    expect(result).toBeUndefined();
  });

  it("should ignore tipFixed when tipIndicator is 03", () => {
    const result = resolveTipValue({
      tipIndicator: "03",
      tipFixed: 5.5,
      tipPercentage: 15,
    });
    expect(result).toBe(15);
  });

  it("should ignore tipPercentage when tipIndicator is 02", () => {
    const result = resolveTipValue({
      tipIndicator: "02",
      tipFixed: 5.5,
      tipPercentage: 15,
    });
    expect(result).toBe(5.5);
  });
});
