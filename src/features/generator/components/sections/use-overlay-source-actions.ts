import { useCallback } from "react";
import {
  acquireCameraImage,
  classifyCameraError,
  classifyUrlLoadError,
  fetchImageFromUrl,
  getImageDimensionsFromFileStandalone,
} from "./overlay-image-utils";
import type { OverlaySourceActionsDeps } from "./overlay-source-actions-types";
import { overlayLog as log } from "./overlay-log";

export function useOverlaySourceActions(deps: OverlaySourceActionsDeps) {
  const {
    setOverlayEnabled,
    setOverlayFile,
    setOverlayUrl,
    setOverlayCrop,
    setPreviewImageSize,
    urlInput,
    setUrlInput,
    setUrlError,
    setIsLoadingUrl,
    setShowUrlInput,
    setCameraError,
    setCameraLoading,
    setGalleryLoading,
    setShowGalleryPicker,
    t,
  } = deps;

  const autoEnableSquareCropForNonSquareInput = useCallback(
    async (file: File): Promise<void> => {
      const dims = await getImageDimensionsFromFileStandalone(file);
      if (!dims) return;
      setPreviewImageSize(dims);
      if (Math.abs(dims.width - dims.height) > 1) {
        setOverlayCrop({ enabled: true, region: { x: 0.5, y: 0.5, size: 1 } });
      }
    },
    [setPreviewImageSize, setOverlayCrop],
  );

  const loadFromUrl = useCallback(async () => {
    if (!urlInput.trim()) {
      setUrlError(t("overlay.pleaseEnterUrl"));
      return;
    }
    setIsLoadingUrl(true);
    setUrlError(null);
    try {
      const file = await fetchImageFromUrl(urlInput);
      setOverlayUrl(urlInput);
      setOverlayFile(file);
      setOverlayEnabled(true);
      setShowUrlInput(false);
      void autoEnableSquareCropForNonSquareInput(file);
    } catch (err) {
      log.error("Failed to load image from URL", { error: err });
      setUrlError(classifyUrlLoadError(err));
    } finally {
      setIsLoadingUrl(false);
    }
  }, [
    autoEnableSquareCropForNonSquareInput,
    urlInput,
    setOverlayFile,
    setOverlayUrl,
    setOverlayEnabled,
    setUrlError,
    setIsLoadingUrl,
    setShowUrlInput,
    t,
  ]);

  const handleCameraCapture = useCallback(async () => {
    setCameraError(null);
    setCameraLoading(true);
    try {
      const file = await acquireCameraImage();
      setOverlayUrl("");
      setOverlayFile(file);
      setOverlayEnabled(true);
      void autoEnableSquareCropForNonSquareInput(file);
    } catch (error: unknown) {
      const errorMsg = classifyCameraError(error, t);
      if (errorMsg) setCameraError(errorMsg);
    } finally {
      setCameraLoading(false);
    }
  }, [
    autoEnableSquareCropForNonSquareInput,
    t,
    setOverlayEnabled,
    setOverlayFile,
    setOverlayUrl,
    setCameraError,
    setCameraLoading,
  ]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setOverlayUrl("");
        setOverlayFile(file);
        setOverlayEnabled(true);
        void autoEnableSquareCropForNonSquareInput(file);
      }
      e.target.value = "";
    },
    [autoEnableSquareCropForNonSquareInput, setOverlayFile, setOverlayUrl, setOverlayEnabled],
  );

  const clearOverlay = useCallback(() => {
    setOverlayFile(null);
    setOverlayUrl("");
    setUrlInput("");
    setUrlError(null);
  }, [setOverlayFile, setOverlayUrl, setUrlInput, setUrlError]);

  const loadGalleryImage = useCallback(
    async (imageUrl: string) => {
      setGalleryLoading(true);
      setShowGalleryPicker(false);
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Failed to load: ${response.status}`);
        const blob = await response.blob();
        const filename = imageUrl.split("/").pop() || "gallery-image";
        const file = new File([blob], filename, { type: blob.type });
        setOverlayUrl(imageUrl);
        setOverlayFile(file);
        setOverlayEnabled(true);
        void autoEnableSquareCropForNonSquareInput(file);
      } catch (err) {
        log.error("Failed to load gallery image", { error: err });
      } finally {
        setGalleryLoading(false);
      }
    },
    [
      autoEnableSquareCropForNonSquareInput,
      setOverlayFile,
      setOverlayUrl,
      setOverlayEnabled,
      setGalleryLoading,
      setShowGalleryPicker,
    ],
  );

  return { loadFromUrl, handleCameraCapture, handleFileSelect, clearOverlay, loadGalleryImage };
}
