import { createLogger } from "../../../../packages/observability/logging/src/logger";
import { LANGUAGE_FONT_MAP } from "./language-font-map";

const log = createLogger("I18N");
const loadedFontScripts = new Set<string>(["latin"]);

export function loadFontForLanguage(lang: string): void {
  const fontFamily = LANGUAGE_FONT_MAP[lang];
  if (!fontFamily) return;
  if (loadedFontScripts.has(fontFamily)) return;
  loadedFontScripts.add(fontFamily);

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);

  log.debug("Loaded font", { fontFamily, lang });
}
