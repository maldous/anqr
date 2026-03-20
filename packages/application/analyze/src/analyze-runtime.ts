import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { useCallback, useState } from "react";
import type React from "react";
import type { useTranslation } from "react-i18next";
import { analyzeQRCode, analyzeQRFromFile, analyzeQRFromUrl } from "@/domain/qr/analyze";
import type { QRAnalysisResult } from "@/contracts/analyze";
import { cloneCanvasLike } from "./canvas-analysis-helpers";
import { closeBitmapSource } from "./close-bitmap-source";
import { loadCameraImageFromBlob } from "./load-camera-image-from-blob";
import { resetAnalysisState } from "./reset-analysis-state";
import type { AnalysisStateSetters } from "./analysis-runtime.types";
export type {
  AnalysisSourceType,
  AnalysisStateSetters,
  ExportAnalysisJSONParams,
  ImportToGeneratorSetters,
} from "./analysis-runtime.types";
export { analyzeGeneratorCanvasRobustImpl } from "./analyze-generator-canvas-robust";
export { exportAnalysisJSON } from "./export-analysis-json";
export { importAnalysisToGenerator } from "./import-analysis-to-generator";

export function useAnalysisInputHandlers(
  t: ReturnType<typeof useTranslation>["t"],
  generatedCanvas: HTMLCanvasElement | OffscreenCanvas | null | undefined,
  setters: AnalysisStateSetters,
  analyzeGeneratorCanvasRobust: (
    sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  ) => Promise<QRAnalysisResult>,
) {
  const [urlInput, setUrlInput] = useState("");

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setters.setIsLoading(true);
      setters.setLoadingSource("file");
      setters.setAnalysisSource("file");
      resetAnalysisState(setters);
      const imageUrl = URL.createObjectURL(file);
      setters.setOriginalImageUrl(imageUrl);
      try {
        const analysisResult = await analyzeQRFromFile(file);
        setters.setResult(analysisResult);
        if (!analysisResult.success) {
          setters.setError(
            analysisResult.error || t("analyze.genericError", "Failed to analyze QR code"),
          );
        }
      } catch (err) {
        setters.setError(
          err instanceof Error
            ? err.message
            : t("analyze.genericError", "Failed to analyze QR code"),
        );
      } finally {
        setters.setIsLoading(false);
        setters.setLoadingSource(null);
        e.target.value = "";
      }
    },
    [t, setters],
  );

  const handleUrlSubmit = useCallback(async () => {
    if (!urlInput.trim()) {
      setters.setError(t("analyze.urlRequired", "Please enter a URL"));
      return;
    }
    setters.setIsLoading(true);
    setters.setLoadingSource("url");
    setters.setAnalysisSource("url");
    resetAnalysisState(setters);
    setters.setOriginalImageUrl(urlInput.trim());
    try {
      const analysisResult = await analyzeQRFromUrl(urlInput.trim());
      setters.setResult(analysisResult);
      if (!analysisResult.success) {
        setters.setError(
          analysisResult.error || t("analyze.genericError", "Failed to analyze QR code"),
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("analyze.loadFailed", "Failed to load image");
      setters.setError(message);
    } finally {
      setters.setIsLoading(false);
      setters.setLoadingSource(null);
    }
  }, [urlInput, t, setters]);

  const handleCameraCapture = useCallback(async () => {
    setters.setIsLoading(true);
    setters.setLoadingSource("camera");
    setters.setAnalysisSource("camera");
    resetAnalysisState(setters);
    try {
      const permissions = await Camera.checkPermissions();
      if (permissions.camera === "denied") {
        const requested = await Camera.requestPermissions();
        if (requested.camera === "denied") {
          setters.setError(t("camera.permissionDenied", "Camera permission denied"));
          return;
        }
      }
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });
      if (!image.webPath) {
        setters.setError(t("analyze.cameraLoadFailed", "Failed to load captured image"));
        return;
      }
      setters.setOriginalImageUrl(image.webPath);
      const response = await fetch(image.webPath);
      if (!response.ok) throw new Error(`Camera image fetch failed: ${response.status}`);
      const blob = await response.blob();
      const maxEdge = 1600;
      const { source, sourceWidth, sourceHeight } = await loadCameraImageFromBlob(blob);
      const sourceMaxEdge = Math.max(sourceWidth, sourceHeight);
      const scale = sourceMaxEdge > maxEdge ? maxEdge / sourceMaxEdge : 1;
      const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
      const targetHeight = Math.max(1, Math.round(sourceHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d", {
        willReadFrequently: true,
      } as CanvasRenderingContext2DSettings | undefined);
      if (!ctx) {
        closeBitmapSource(source);
        setters.setError(t("analyze.cameraProcessError", "Could not process image"));
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
      closeBitmapSource(source);
      const analysisResult = analyzeQRCode(canvas);
      setters.setResult(analysisResult);
      setters.setAnalysisSource("camera");
      if (!analysisResult.success) {
        setters.setError(
          analysisResult.error || t("analyze.noCodeDetected", "No QR code detected"),
        );
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (!(errorMessage.includes("cancelled") || errorMessage.includes("User cancelled"))) {
        setters.setError(t("analyze.cameraFailed", "Camera capture failed"));
      }
    } finally {
      setters.setIsLoading(false);
      setters.setLoadingSource(null);
    }
  }, [t, setters]);

  const handleAnalyzeGenerator = useCallback(async () => {
    if (!generatedCanvas) return;
    setters.setIsLoading(true);
    setters.setLoadingSource("generator");
    resetAnalysisState(setters);
    try {
      const canvasForDisplay =
        generatedCanvas instanceof HTMLCanvasElement
          ? generatedCanvas
          : cloneCanvasLike(generatedCanvas);
      if (typeof canvasForDisplay.toBlob === "function") {
        const blob = await new Promise<Blob | null>((resolve) => {
          canvasForDisplay.toBlob((nextBlob) => resolve(nextBlob), "image/png");
        });
        if (blob) {
          const objectUrl = URL.createObjectURL(blob);
          setters.setOriginalImageUrl((previous) => {
            if (typeof previous === "string" && previous.startsWith("blob:")) {
              URL.revokeObjectURL(previous);
            }
            return objectUrl;
          });
        } else {
          setters.setOriginalImageUrl(canvasForDisplay.toDataURL("image/png"));
        }
      } else {
        setters.setOriginalImageUrl(canvasForDisplay.toDataURL("image/png"));
      }
      const analysisResult = await analyzeGeneratorCanvasRobust(generatedCanvas);
      setters.setResult(analysisResult);
      setters.setAnalysisSource("generator");
      if (!analysisResult.success) {
        setters.setError(
          analysisResult.error || t("analyze.noCodeDetected", "No QR code detected"),
        );
      }
    } catch (err) {
      setters.setError(
        err instanceof Error ? err.message : t("analyze.genericError", "Failed to analyze QR code"),
      );
    } finally {
      setters.setIsLoading(false);
      setters.setLoadingSource(null);
    }
  }, [generatedCanvas, t, analyzeGeneratorCanvasRobust, setters]);

  return {
    handleFileUpload,
    handleUrlSubmit,
    handleCameraCapture,
    handleAnalyzeGenerator,
    urlInput,
    setUrlInput,
  };
}
