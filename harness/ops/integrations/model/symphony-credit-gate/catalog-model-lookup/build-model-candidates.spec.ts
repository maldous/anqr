/// <reference types="vitest" />
import { describe, it, expect } from "vitest";

const { buildModelCandidates } = await import("./build-model-candidates.mjs");

describe("buildModelCandidates", () => {
  it("should return the model as-is", () => {
    expect(buildModelCandidates({ model: "gpt-4" })).toEqual(["gpt-4"]);
  });

  it("should normalize and lowercase the model", () => {
    expect(buildModelCandidates({ model: "  GPT-4  " })).toEqual(["gpt-4"]);
  });

  it("should add variant without :free suffix", () => {
    const candidates = buildModelCandidates({ model: "mistral:free" });
    expect(candidates).toContain("mistral:free");
    expect(candidates).toContain("mistral");
  });

  it("should add openai/ prefix for github-models", () => {
    const candidates = buildModelCandidates({ model: "gpt-4o", name: "github-models" });
    expect(candidates).toContain("openai/gpt-4o");
  });

  it("should replace dashes with spaces for sambanova", () => {
    const candidates = buildModelCandidates({ model: "llama-3", name: "sambanova" });
    expect(candidates).toContain("llama 3");
  });

  it("should return empty array when model is empty", () => {
    expect(buildModelCandidates({})).toEqual([]);
  });
});
