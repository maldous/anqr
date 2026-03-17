import type { HeaderPage } from "./header-page.types";
export type { HeaderPage } from "./header-page.types";

export function resolveHeaderPage(
  activePage: HeaderPage | undefined,
  showGallery: boolean,
): HeaderPage {
  if (activePage) return activePage;
  return showGallery ? "gallery" : "editor";
}
