import type { OverlayDitherOptions } from "./processor.types";

export const STORE_DEFAULT_DITHER: OverlayDitherOptions = {
  enabled: false,
  kind: "none",
  strength: 1,
  levels: 2,
  serpentine: false,
};
