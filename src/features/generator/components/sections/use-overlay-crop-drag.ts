import { useCallback, useState } from 'react';
import type React from 'react';
import { getContainedImageRect, type ContainedImageRect } from './overlay-image-utils';
import { computeResizedCropRegion } from './overlay-crop-utils';
import type { CropDragMode } from './overlay-crop-types';
import type { useQRStore } from '@/store/qr-store';

export function useOverlayCropDrag(
  overlay: ReturnType<typeof useQRStore.getState>['overlay'],
  previewImageSize: { width: number; height: number } | null,
  previewContainerRef: React.RefObject<HTMLDivElement | null>,
  setOverlayCrop: ReturnType<typeof useQRStore.getState>['setOverlayCrop']
) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<CropDragMode>(null);
  const [draftCropRegion, setDraftCropRegion] = useState<{
    x: number;
    y: number;
    size: number;
  } | null>(null);

  const getCropHalfExtents = useCallback(
    (size: number): { halfX: number; halfY: number } => {
      if (!previewImageSize || previewImageSize.width <= 0 || previewImageSize.height <= 0) {
        const half = size / 2;
        return { halfX: half, halfY: half };
      }
      const minEdge = Math.min(previewImageSize.width, previewImageSize.height);
      const cropSizePx = Math.max(1, minEdge * size);
      return {
        halfX: Math.min(0.5, cropSizePx / (2 * previewImageSize.width)),
        halfY: Math.min(0.5, cropSizePx / (2 * previewImageSize.height)),
      };
    },
    [previewImageSize]
  );

  const activeCropRegion = isDragging && draftCropRegion ? draftCropRegion : overlay.cropRegion;

  const commitCropRegionIfChanged = useCallback(
    (nextRegion: { x: number; y: number; size: number }) => {
      const eps = 0.0001;
      if (
        Math.abs(nextRegion.x - overlay.cropRegion.x) < eps &&
        Math.abs(nextRegion.y - overlay.cropRegion.y) < eps &&
        Math.abs(nextRegion.size - overlay.cropRegion.size) < eps
      ) {
        return;
      }
      setOverlayCrop({ region: nextRegion });
    },
    [overlay.cropRegion, setOverlayCrop]
  );

  const mapPointerToImageSpace = useCallback(
    (
      clientX: number,
      clientY: number
    ): { x: number; y: number; imageRect: ContainedImageRect } | null => {
      const container = previewContainerRef.current;
      if (!container) return null;
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;

      const imageRect =
        previewImageSize && previewImageSize.width > 0 && previewImageSize.height > 0
          ? getContainedImageRect(
              rect.width,
              rect.height,
              previewImageSize.width,
              previewImageSize.height
            )
          : { x: 0, y: 0, width: rect.width, height: rect.height };
      if (imageRect.width <= 0 || imageRect.height <= 0) return null;

      const relativeX = (clientX - rect.left - imageRect.x) / imageRect.width;
      const relativeY = (clientY - rect.top - imageRect.y) / imageRect.height;

      return {
        x: Math.max(0, Math.min(1, relativeX)),
        y: Math.max(0, Math.min(1, relativeY)),
        imageRect,
      };
    },
    [previewImageSize, previewContainerRef]
  );

  const beginDragAtPoint = useCallback(
    (clientX: number, clientY: number): void => {
      if (!overlay.cropEnabled) return;
      const mapped = mapPointerToImageSpace(clientX, clientY);
      if (!mapped) return;

      const currentRegion = overlay.cropRegion;
      const { halfX, halfY } = getCropHalfExtents(currentRegion.size);
      const left = currentRegion.x - halfX;
      const right = currentRegion.x + halfX;
      const top = currentRegion.y - halfY;
      const bottom = currentRegion.y + halfY;
      const insideCrop =
        mapped.x >= left && mapped.x <= right && mapped.y >= top && mapped.y <= bottom;

      const corners = [
        { x: left, y: top },
        { x: right, y: top },
        { x: left, y: bottom },
        { x: right, y: bottom },
      ];
      const cornerThresholdPx = 18;
      const nearCorner = corners.some((corner) => {
        const dxPx = (mapped.x - corner.x) * mapped.imageRect.width;
        const dyPx = (mapped.y - corner.y) * mapped.imageRect.height;
        return Math.hypot(dxPx, dyPx) <= cornerThresholdPx;
      });

      if (!insideCrop && !nearCorner) {
        return;
      }

      setDraftCropRegion(currentRegion);
      setDragMode(nearCorner ? 'resize' : 'move');
      setIsDragging(true);
    },
    [overlay.cropEnabled, overlay.cropRegion, mapPointerToImageSpace, getCropHalfExtents]
  );

  const handleCropDrag = useCallback(
    (clientX: number, clientY: number) => {
      const currentRegion = draftCropRegion ?? overlay.cropRegion;
      const mapped = mapPointerToImageSpace(clientX, clientY);
      if (!mapped) return;

      if (dragMode === 'resize') {
        const newSize = computeResizedCropRegion(mapped, currentRegion, previewImageSize);
        setDraftCropRegion({ ...currentRegion, size: newSize });
        return;
      }

      const { halfX, halfY } = getCropHalfExtents(currentRegion.size);
      const clampedX = Math.max(halfX, Math.min(1 - halfX, mapped.x));
      const clampedY = Math.max(halfY, Math.min(1 - halfY, mapped.y));
      setDraftCropRegion({ ...currentRegion, x: clampedX, y: clampedY });
    },
    [
      dragMode,
      previewImageSize,
      mapPointerToImageSpace,
      getCropHalfExtents,
      draftCropRegion,
      overlay.cropRegion,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!(isDragging && previewContainerRef.current)) return;
      e.preventDefault();
      handleCropDrag(e.clientX, e.clientY);
    },
    [isDragging, previewContainerRef, handleCropDrag]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!overlay.cropEnabled || e.touches.length === 0) return;
      e.preventDefault();
      const touch = e.touches[0];
      beginDragAtPoint(touch.clientX, touch.clientY);
    },
    [overlay.cropEnabled, beginDragAtPoint]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!(isDragging && previewContainerRef.current) || e.touches.length === 0) return;
      e.preventDefault();

      const touch = e.touches[0];
      handleCropDrag(touch.clientX, touch.clientY);
    },
    [isDragging, previewContainerRef, handleCropDrag]
  );

  const finishDrag = useCallback(() => {
    if (!isDragging) return;
    if (draftCropRegion) {
      commitCropRegionIfChanged(draftCropRegion);
    }
    setDraftCropRegion(null);
    setDragMode(null);
    setIsDragging(false);
  }, [isDragging, draftCropRegion, commitCropRegionIfChanged]);

  const handleTouchEnd = useCallback(() => {
    finishDrag();
  }, [finishDrag]);

  return {
    activeCropRegion,
    getCropHalfExtents,
    beginDragAtPoint,
    handleCropDrag: handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    finishDrag,
  };
}
