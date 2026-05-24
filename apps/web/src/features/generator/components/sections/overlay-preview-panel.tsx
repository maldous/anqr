import { Button, Label, Slider, Switch } from "@/ui/web";
import type { TFunction } from "i18next";
import { X } from "lucide-react";
import type React from "react";
import { DynamicTestId } from "../../../../lib/dynamic-testid";
import type { useQRStore } from "../../../../state/qr-store";
import { HighlightedLabel } from "../../search/search-context";
import { buildCropInteractionProps } from "./build-crop-interaction-props";
import { CropOverlayIndicator } from "./crop-overlay-indicator";
import type { CropOverlayStyle } from "./crop-overlay-style.types";
import { handlePreviewImageLoad } from "./handle-preview-image-load";
import type { PreviewImageSize } from "./preview-image-size.types";
import type { useOverlayCropDrag } from "./use-overlay-crop-drag";

export function OverlayPreviewPanel({
  overlay,
  imagePreview,
  previewContainerRef,
  cropDrag,
  cropOverlayStyle,
  setPreviewImageSize,
  setOverlayCrop,
  clearOverlay,
  t,
}: Readonly<{
  overlay: ReturnType<typeof useQRStore.getState>["overlay"];
  imagePreview: string | null;
  previewContainerRef: React.RefObject<HTMLDivElement | null>;
  cropDrag: ReturnType<typeof useOverlayCropDrag>;
  cropOverlayStyle: CropOverlayStyle;
  setPreviewImageSize: (v: PreviewImageSize | null) => void;
  setOverlayCrop: ReturnType<typeof useQRStore.getState>["setOverlayCrop"];
  clearOverlay: () => void;
  t: TFunction;
}>) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
        <span className="flex-1 text-sm truncate">
          {overlay.file?.name || (overlay.url ? t("overlay.loadedFromUrl") : t("overlay.noFile"))}
        </span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearOverlay}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      {overlay.url && !overlay.file?.name && (
        <div className="text-xs text-muted-foreground truncate px-2">{overlay.url}</div>
      )}
      {imagePreview && (
        <div
          ref={previewContainerRef}
          role={overlay.cropEnabled ? "application" : "img"}
          aria-label={
            overlay.cropEnabled
              ? t(
                  "overlay.previewWithCrop",
                  "Image preview with crop area selector. Drag to adjust crop position.",
                )
              : t("overlay.previewLabel", "Image preview")
          }
          {...(overlay.cropEnabled && buildCropInteractionProps(cropDrag))}
          className="relative w-full aspect-square bg-muted/30 rounded-lg overflow-hidden border cursor-crosshair touch-none focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <img
            src={imagePreview}
            alt={t("overlay.preview")}
            className="w-full h-full object-contain"
            onLoad={(e) => handlePreviewImageLoad(e, setPreviewImageSize)}
            draggable={false}
          />
          {overlay.cropEnabled && <CropOverlayIndicator cropOverlayStyle={cropOverlayStyle} />}
        </div>
      )}
      <div className="flex items-center justify-between">
        <Label className="text-sm">
          <HighlightedLabel>{t("overlay.enableCrop")}</HighlightedLabel>
        </Label>
        <Switch
          checked={overlay.cropEnabled}
          onCheckedChange={(checked) => setOverlayCrop({ enabled: checked })}
          data-testid={DynamicTestId.resolve("overlay-crop-switch", "overlay-crop-switch")}
        />
      </div>
      {overlay.cropEnabled && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">{t("overlay.cropSize")}</Label>
            <span className="text-sm text-muted-foreground">
              {t("qr.nPercent", { count: Math.round(cropDrag.activeCropRegion.size * 100) })}
            </span>
          </div>
          <Slider
            value={[cropDrag.activeCropRegion.size]}
            onValueChange={([v]) => {
              const { halfX, halfY } = cropDrag.getCropHalfExtents(v);
              setOverlayCrop({
                region: {
                  ...overlay.cropRegion,
                  size: v,
                  x: Math.max(halfX, Math.min(1 - halfX, overlay.cropRegion.x)),
                  y: Math.max(halfY, Math.min(1 - halfY, overlay.cropRegion.y)),
                },
              });
            }}
            min={0.1}
            max={1}
            step={0.05}
            data-testid={DynamicTestId.resolve("overlay-crop-slider", "overlay-crop-slider")}
          />
        </div>
      )}
    </div>
  );
}
