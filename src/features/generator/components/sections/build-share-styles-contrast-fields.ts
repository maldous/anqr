import type { StoreState } from "./share-config-store-state.type";

export function buildShareStylesContrastFields(render: StoreState["render"]) {
  return {
    contrastGuard: render.contrastGuard ? true : undefined,
    minContrastRatio:
      render.contrastGuard && render.minContrastRatio !== 4.5 ? render.minContrastRatio : undefined,
  };
}
