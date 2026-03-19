import type { OverlayFilterOptions } from "./overlay-filter-options.types";

export function hasActiveOverlayFilters(f: OverlayFilterOptions): boolean {
  return (
    f.brightness !== 0 ||
    f.contrast !== 0 ||
    f.gamma !== 1 ||
    f.saturation !== 0 ||
    f.hue !== 0 ||
    f.invert ||
    f.blur > 0 ||
    f.sharpen > 0 ||
    f.posterize > 1 ||
    f.edge !== "off"
  );
}
