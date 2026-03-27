import { describe, it, expect, vi } from "vitest";
import { resetAnalysisState } from "./reset-analysis-state";
import type { AnalysisStateSetters } from "./analysis-state-setters.types";

describe("resetAnalysisState", () => {
  it("calls all setter functions with correct reset values", () => {
    const setters: AnalysisStateSetters = {
      setError: vi.fn(),
      setResult: vi.fn(),
      setImported: vi.fn(),
      setUiTimings: vi.fn(),
      setIsLoading: vi.fn(),
      setLoadingSource: vi.fn(),
      setAnalysisSource: vi.fn(),
      setOriginalImageUrl: vi.fn(),
    };

    resetAnalysisState(setters);

    expect(setters.setError).toHaveBeenCalledWith(null);
    expect(setters.setResult).toHaveBeenCalledWith(null);
    expect(setters.setImported).toHaveBeenCalledWith(false);
    expect(setters.setUiTimings).toHaveBeenCalledWith({});
  });

  it("calls setters exactly once", () => {
    const setters: AnalysisStateSetters = {
      setError: vi.fn(),
      setResult: vi.fn(),
      setImported: vi.fn(),
      setUiTimings: vi.fn(),
      setIsLoading: vi.fn(),
      setLoadingSource: vi.fn(),
      setAnalysisSource: vi.fn(),
      setOriginalImageUrl: vi.fn(),
    };

    resetAnalysisState(setters);

    expect(setters.setError).toHaveBeenCalledTimes(1);
    expect(setters.setResult).toHaveBeenCalledTimes(1);
    expect(setters.setImported).toHaveBeenCalledTimes(1);
    expect(setters.setUiTimings).toHaveBeenCalledTimes(1);
  });

  it("does not call other setters", () => {
    const setters: AnalysisStateSetters = {
      setError: vi.fn(),
      setResult: vi.fn(),
      setImported: vi.fn(),
      setUiTimings: vi.fn(),
      setIsLoading: vi.fn(),
      setLoadingSource: vi.fn(),
      setAnalysisSource: vi.fn(),
      setOriginalImageUrl: vi.fn(),
    };

    resetAnalysisState(setters);

    expect(setters.setIsLoading).not.toHaveBeenCalled();
    expect(setters.setLoadingSource).not.toHaveBeenCalled();
    expect(setters.setAnalysisSource).not.toHaveBeenCalled();
    expect(setters.setOriginalImageUrl).not.toHaveBeenCalled();
  });
});
