import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureGeneratorRuntime } from "./configure-generator-runtime";
import { getGeneratorCanvasFactory } from "./get-generator-canvas-factory";
import { getDownloadRuntime } from "./get-download-runtime";
import { getInterstitialRuntime } from "./get-interstitial-runtime";
import { getQArtWorkerRuntime } from "./get-qart-worker-runtime";
import { getValidationWorkerRuntime } from "./get-validation-worker-runtime";
import { generatorRuntimeState } from "./generator-runtime-state";
import type { GeneratorRuntimeConfig } from "./generator-runtime.types";

describe("generator-runtime", () => {
  beforeEach(() => {
    generatorRuntimeState.current = null;
  });

  describe("configureGeneratorRuntime", () => {
    it("sets the runtime configuration", () => {
      const mockConfig: GeneratorRuntimeConfig = {
        canvasFactory: { createCanvas: vi.fn() },
        download: { downloadUrl: vi.fn() },
        interstitials: { prepareInterstitial: vi.fn(), showInterstitial: vi.fn() },
        qartWorker: { generateQArtInWorker: vi.fn(), terminateQArtWorker: vi.fn() },
        validationWorker: { validateInWorker: vi.fn(), terminateValidationWorker: vi.fn() },
      };

      configureGeneratorRuntime(mockConfig);

      expect(generatorRuntimeState.current).toBe(mockConfig);
    });

    it("overwrites previous configuration", () => {
      const firstConfig: GeneratorRuntimeConfig = {
        canvasFactory: { createCanvas: vi.fn() },
        download: { downloadUrl: vi.fn() },
        interstitials: { prepareInterstitial: vi.fn(), showInterstitial: vi.fn() },
        qartWorker: { generateQArtInWorker: vi.fn(), terminateQArtWorker: vi.fn() },
        validationWorker: { validateInWorker: vi.fn(), terminateValidationWorker: vi.fn() },
      };

      const secondConfig: GeneratorRuntimeConfig = {
        canvasFactory: { createCanvas: vi.fn() },
        download: { downloadUrl: vi.fn() },
        interstitials: { prepareInterstitial: vi.fn(), showInterstitial: vi.fn() },
        qartWorker: { generateQArtInWorker: vi.fn(), terminateQArtWorker: vi.fn() },
        validationWorker: { validateInWorker: vi.fn(), terminateValidationWorker: vi.fn() },
      };

      configureGeneratorRuntime(firstConfig);
      configureGeneratorRuntime(secondConfig);

      expect(generatorRuntimeState.current).toBe(secondConfig);
      expect(generatorRuntimeState.current).not.toBe(firstConfig);
    });
  });

  describe("getGeneratorCanvasFactory", () => {
    it("throws when runtime not configured", () => {
      expect(() => getGeneratorCanvasFactory()).toThrow(
        "Generator runtime has not been configured",
      );
    });

    it("returns canvas factory when configured", () => {
      const mockFactory = { createCanvas: vi.fn() };
      const mockConfig: GeneratorRuntimeConfig = {
        canvasFactory: mockFactory,
        download: { downloadUrl: vi.fn() },
        interstitials: { prepareInterstitial: vi.fn(), showInterstitial: vi.fn() },
        qartWorker: { generateQArtInWorker: vi.fn(), terminateQArtWorker: vi.fn() },
        validationWorker: { validateInWorker: vi.fn(), terminateValidationWorker: vi.fn() },
      };

      configureGeneratorRuntime(mockConfig);

      expect(getGeneratorCanvasFactory()).toBe(mockFactory);
    });
  });

  describe("getDownloadRuntime", () => {
    it("throws when runtime not configured", () => {
      expect(() => getDownloadRuntime()).toThrow("Generator runtime has not been configured");
    });

    it("returns download runtime when configured", () => {
      const mockDownload = { downloadUrl: vi.fn() };
      const mockConfig: GeneratorRuntimeConfig = {
        canvasFactory: { createCanvas: vi.fn() },
        download: mockDownload,
        interstitials: { prepareInterstitial: vi.fn(), showInterstitial: vi.fn() },
        qartWorker: { generateQArtInWorker: vi.fn(), terminateQArtWorker: vi.fn() },
        validationWorker: { validateInWorker: vi.fn(), terminateValidationWorker: vi.fn() },
      };

      configureGeneratorRuntime(mockConfig);

      expect(getDownloadRuntime()).toBe(mockDownload);
    });
  });

  describe("getInterstitialRuntime", () => {
    it("throws when runtime not configured", () => {
      expect(() => getInterstitialRuntime()).toThrow("Generator runtime has not been configured");
    });

    it("returns interstitial runtime when configured", () => {
      const mockInterstitials = { prepareInterstitial: vi.fn(), showInterstitial: vi.fn() };
      const mockConfig: GeneratorRuntimeConfig = {
        canvasFactory: { createCanvas: vi.fn() },
        download: { downloadUrl: vi.fn() },
        interstitials: mockInterstitials,
        qartWorker: { generateQArtInWorker: vi.fn(), terminateQArtWorker: vi.fn() },
        validationWorker: { validateInWorker: vi.fn(), terminateValidationWorker: vi.fn() },
      };

      configureGeneratorRuntime(mockConfig);

      expect(getInterstitialRuntime()).toBe(mockInterstitials);
    });
  });

  describe("getQArtWorkerRuntime", () => {
    it("throws when runtime not configured", () => {
      expect(() => getQArtWorkerRuntime()).toThrow("Generator runtime has not been configured");
    });

    it("returns QArt worker runtime when configured", () => {
      const mockQArtWorker = { generateQArtInWorker: vi.fn(), terminateQArtWorker: vi.fn() };
      const mockConfig: GeneratorRuntimeConfig = {
        canvasFactory: { createCanvas: vi.fn() },
        download: { downloadUrl: vi.fn() },
        interstitials: { prepareInterstitial: vi.fn(), showInterstitial: vi.fn() },
        qartWorker: mockQArtWorker,
        validationWorker: { validateInWorker: vi.fn(), terminateValidationWorker: vi.fn() },
      };

      configureGeneratorRuntime(mockConfig);

      expect(getQArtWorkerRuntime()).toBe(mockQArtWorker);
    });
  });

  describe("getValidationWorkerRuntime", () => {
    it("throws when runtime not configured", () => {
      expect(() => getValidationWorkerRuntime()).toThrow(
        "Generator runtime has not been configured",
      );
    });

    it("returns validation worker runtime when configured", () => {
      const mockValidationWorker = {
        validateInWorker: vi.fn(),
        terminateValidationWorker: vi.fn(),
      };
      const mockConfig: GeneratorRuntimeConfig = {
        canvasFactory: { createCanvas: vi.fn() },
        download: { downloadUrl: vi.fn() },
        interstitials: { prepareInterstitial: vi.fn(), showInterstitial: vi.fn() },
        qartWorker: { generateQArtInWorker: vi.fn(), terminateQArtWorker: vi.fn() },
        validationWorker: mockValidationWorker,
      };

      configureGeneratorRuntime(mockConfig);

      expect(getValidationWorkerRuntime()).toBe(mockValidationWorker);
    });
  });
});
