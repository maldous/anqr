import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { exportAnalysisJSON } from "./export-analysis-json";
import type { ExportAnalysisJSONParams } from "./analysis-runtime.types";
import { JSDOM } from "jsdom";

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
  },
}));

vi.mock("@/domain/analyze", () => ({
  buildAnalysisExportData: vi.fn((result) => ({
    analysis: {
      ...result,
      timing: result.timing,
    },
    diagnostics: {
      summary: {},
    },
  })),
}));

vi.mock("./analyze-platform-runtime", () => ({
  getAnalyzePlatformRuntime: vi.fn(() => ({
    saveFileNative: vi.fn(),
  })),
}));

describe("exportAnalysisJSON", () => {
  let dom: JSDOM;

  beforeEach(() => {
    vi.clearAllMocks();
    dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    global.document = dom.window.document as unknown as Document;
  });

  afterEach(() => {
    // Cleanup
  });

  it("returns early when result is not successful", () => {
    const params: ExportAnalysisJSONParams = {
      result: { success: false, error: "test error" } as any,
      uiTimings: {},
      analysisSource: "file",
      actualUsedVersion: null,
      setUiTimings: vi.fn(),
    };

    exportAnalysisJSON(params);

    expect(params.setUiTimings).not.toHaveBeenCalled();
  });

  it("exports analysis JSON successfully on web platform", () => {
    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL");
    const clickSpy = vi.fn();

    const params: ExportAnalysisJSONParams = {
      result: {
        success: true,
        payload: "test",
        timing: {
          decodeMs: 10,
          totalAnalysisMs: 20,
          encodeMs: null,
          renderMs: null,
          exportMs: null,
        },
      } as any,
      uiTimings: { encodeMs: 5, renderMs: 3 },
      analysisSource: "file",
      actualUsedVersion: 5,
      setUiTimings: vi.fn(),
    };

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === "a") {
        el.click = clickSpy;
      }
      return el;
    });

    exportAnalysisJSON(params);

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
    expect(params.setUiTimings).toHaveBeenCalled();

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
  });

  it("updates ui timings with export time", () => {
    const setUiTimings = vi.fn();
    const params: ExportAnalysisJSONParams = {
      result: {
        success: true,
        payload: "test",
        timing: {
          decodeMs: 10,
          totalAnalysisMs: 20,
          encodeMs: null,
          renderMs: null,
          exportMs: null,
        },
      } as any,
      uiTimings: {},
      analysisSource: "url",
      actualUsedVersion: null,
      setUiTimings,
    };

    exportAnalysisJSON(params);

    expect(setUiTimings).toHaveBeenCalledWith(expect.any(Function));
    const updateFn = setUiTimings.mock.calls[0][0];
    const result = updateFn({});
    expect(result).toHaveProperty("exportMs");
    expect(typeof result.exportMs).toBe("number");
  });

  it("creates download with timestamp filename", () => {
    const dateSpy = vi.spyOn(Date, "now").mockReturnValue(1234567890);
    let capturedFilename = "";

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === "a") {
        Object.defineProperty(el, "download", {
          set(value: string) {
            capturedFilename = value;
          },
          get() {
            return capturedFilename;
          },
        });
      }
      return el;
    });

    const params: ExportAnalysisJSONParams = {
      result: {
        success: true,
        payload: "test",
      } as any,
      uiTimings: {},
      analysisSource: "camera",
      actualUsedVersion: null,
      setUiTimings: vi.fn(),
    };

    exportAnalysisJSON(params);

    expect(capturedFilename).toBe("qr-analysis-1234567890.json");

    dateSpy.mockRestore();
  });

  it("merges ui timings into analysis timing", () => {
    const buildAnalysisExportData = vi.fn((result) => ({
      analysis: { ...result, timing: result.timing },
      diagnostics: { summary: {} },
    }));

    vi.doMock("@/domain/analyze", () => ({
      buildAnalysisExportData,
    }));

    const params: ExportAnalysisJSONParams = {
      result: {
        success: true,
        payload: "test",
        timing: {
          decodeMs: 10,
          totalAnalysisMs: 20,
          encodeMs: null,
          renderMs: null,
          exportMs: null,
        },
      } as any,
      uiTimings: { encodeMs: 15, renderMs: 25 },
      analysisSource: "generator",
      actualUsedVersion: 7,
      setUiTimings: vi.fn(),
    };

    exportAnalysisJSON(params);

    expect(params.setUiTimings).toHaveBeenCalled();
  });
});
