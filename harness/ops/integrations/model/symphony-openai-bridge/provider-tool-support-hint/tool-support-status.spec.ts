/// <reference types="vitest" />
import { describe, it, expect } from "vitest";

const { toolSupportStatus } = await import("./tool-support-status.mjs");

describe("toolSupportStatus", () => {
  it("should detect explicit function_calling=false", () => {
    const result = toolSupportStatus({ function_calling: false }, []);
    expect(result.status).toBe("unsupported");
  });

  it("should detect explicit function_calling=true", () => {
    const result = toolSupportStatus({ function_calling: true }, []);
    expect(result.status).toBe("supported");
  });

  it("should check supported_parameters for tools/tool_choice", () => {
    const result = toolSupportStatus({}, ["tools", "temperature"]);
    expect(result.status).toBe("supported");
  });

  it("should return unsupported when params don't include tools", () => {
    const result = toolSupportStatus({}, ["temperature", "top_p"]);
    expect(result.status).toBe("unsupported");
  });

  it("should return unknown when no metadata available", () => {
    const result = toolSupportStatus({}, []);
    expect(result.status).toBe("unknown");
  });

  it("should case-insensitively match supported_parameters", () => {
    const result = toolSupportStatus({}, ["Tool_Choice"]);
    expect(result.status).toBe("supported");
  });
});
