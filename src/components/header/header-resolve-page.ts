import type { HeaderPage } from "./header-page.type";
export type { HeaderPage } from "./header-page.type";

export function resolveHeaderPage(
  activePage: HeaderPage | undefined,
  showGallery: boolean,
): HeaderPage {
  if (activePage) return activePage;
  return showGallery ? "gallery" : "editor";
}
