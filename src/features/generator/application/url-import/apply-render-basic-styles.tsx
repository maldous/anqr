import type { ShareConfig } from "@/modules/share-links";
import { type AlignmentStyle, type FinderStyle, type TimingStyle } from "@/store/qr-store";
import type { StoreState } from "@/features/generator/model/mobile-split";
import type { ModuleStyleOption } from "@/domain/render/module-style-option.types";
import type { GradientUpdate } from "./apply-render-params.types";

export function applyRenderBasicStyles(params: Partial<ShareConfig>, store: StoreState): void {
  if (params.fg) store.setRenderFgColor(params.fg);
  if (params.bg) store.setRenderBgColor(params.bg);
  if (params.transparent) store.setRenderBgTransparent(true);
  if (params.style) store.setRenderModuleStyle(params.style as ModuleStyleOption);
  if (params.finder) store.setRenderFinderStyle(params.finder as FinderStyle);
  if (params.alignmentStyle) store.setRenderAlignmentStyle(params.alignmentStyle as AlignmentStyle);
  if (params.timingStyle) store.setRenderTimingStyle(params.timingStyle as TimingStyle);
  if (params.moduleGap !== undefined) store.setRenderModuleGap(params.moduleGap);
  if (params.gapMode)
    store.setRenderGapMode(params.gapMode as "none" | "inset" | "stroke" | "negative_space");
  if (params.cornerRadius !== undefined) store.setRenderCornerRadius(params.cornerRadius);
  if (params.gradientType) {
    const gradientUpdate: GradientUpdate = {
      type: params.gradientType as "none" | "linear" | "radial" | "conic",
    };
    if (params.gradientStops && params.gradientStops.length > 0) {
      gradientUpdate.stops = params.gradientStops;
    }
    store.setRenderGradient(gradientUpdate);
  }
}
