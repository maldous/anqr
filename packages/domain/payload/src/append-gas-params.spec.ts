import { describe, it, expect } from "vitest";
import { appendGasParams } from "./append-gas-params";

describe("appendGasParams", () => {
  it("should append gas parameter when provided", () => {
    const queryParams = new URLSearchParams();
    appendGasParams(queryParams, { gas: 21000 });
    expect(queryParams.get("gas")).toBe("21000");
  });

  it("should append gasLimit parameter when provided", () => {
    const queryParams = new URLSearchParams();
    appendGasParams(queryParams, { gasLimit: 50000 });
    expect(queryParams.get("gasLimit")).toBe("50000");
  });

  it("should append gasPrice parameter when provided", () => {
    const queryParams = new URLSearchParams();
    appendGasParams(queryParams, { gasPrice: "20000000000" });
    expect(queryParams.get("gasPrice")).toBe("20000000000");
  });

  it("should append all gas parameters when all provided", () => {
    const queryParams = new URLSearchParams();
    appendGasParams(queryParams, {
      gas: 21000,
      gasLimit: 50000,
      gasPrice: "20000000000",
    });
    expect(queryParams.get("gas")).toBe("21000");
    expect(queryParams.get("gasLimit")).toBe("50000");
    expect(queryParams.get("gasPrice")).toBe("20000000000");
  });

  it("should not append parameters when none provided", () => {
    const queryParams = new URLSearchParams();
    appendGasParams(queryParams, {});
    expect(queryParams.toString()).toBe("");
  });

  it("should handle partial parameters", () => {
    const queryParams = new URLSearchParams();
    appendGasParams(queryParams, { gas: 21000, gasPrice: "20000000000" });
    expect(queryParams.get("gas")).toBe("21000");
    expect(queryParams.get("gasLimit")).toBeNull();
    expect(queryParams.get("gasPrice")).toBe("20000000000");
  });
});
