import type { StoreState } from "./store-state.type";

export function buildHeaderColors(render: StoreState["render"]) {
  return {
    fg: render.fgColor === "#000000" ? undefined : render.fgColor,
    bg: render.bgColor === "#ffffff" ? undefined : render.bgColor,
    transparent: render.bgTransparent || undefined,
  };
}
