import type { StoreState } from './share-config-store-state.type';

export function buildShareColors(render: StoreState['render']) {
  return {
    fg: render.fgColor === '#000000' ? undefined : render.fgColor,
    bg: render.bgColor === '#ffffff' ? undefined : render.bgColor,
    transparent: render.bgTransparent || undefined,
  };
}
