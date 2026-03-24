import { describe, expect, it } from "vitest";
import type { EmbedOptions } from "./embed-options.contract";

describe("EmbedOptions", () => {
  it("should allow all optional fields", () => {
    const options: EmbedOptions = {
      width: 400,
      height: 400,
      responsive: true,
      showBorder: false,
      includeLink: true,
    };

    expect(options.width).toBe(400);
    expect(options.height).toBe(400);
    expect(options.responsive).toBe(true);
    expect(options.showBorder).toBe(false);
    expect(options.includeLink).toBe(true);
  });

  it("should allow empty object", () => {
    const options: EmbedOptions = {};
    expect(options).toBeDefined();
  });

  it("should allow partial options", () => {
    const options: EmbedOptions = {
      width: 300,
      responsive: true,
    };

    expect(options.width).toBe(300);
    expect(options.responsive).toBe(true);
  });

  it("should allow responsive without dimensions", () => {
    const options: EmbedOptions = {
      responsive: true,
    };

    expect(options.responsive).toBe(true);
  });

  it("should allow fixed dimensions", () => {
    const options: EmbedOptions = {
      width: 500,
      height: 500,
      responsive: false,
    };

    expect(options.width).toBe(500);
    expect(options.height).toBe(500);
    expect(options.responsive).toBe(false);
  });
});
