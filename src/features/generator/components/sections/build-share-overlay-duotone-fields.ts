import type { StoreState } from "./share-config-store-state.type";

export function buildShareOverlayDuotoneFields(overlay: StoreState["overlay"]) {
  const isDuotone = overlay.mode === "duotone";
  return {
    duotoneColor1:
      isDuotone && overlay.duotoneColors[0] !== "#000000" ? overlay.duotoneColors[0] : undefined,
    duotoneColor2:
      isDuotone && overlay.duotoneColors[1] !== "#ffffff" ? overlay.duotoneColors[1] : undefined,
  };
}
