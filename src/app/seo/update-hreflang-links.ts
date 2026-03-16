import { languages } from "@/app/i18n";

export function updateHreflangLinks(showEditor: boolean, currentPage: string): void {
  const staticPageTypes = ["learn", "examples", "guide", "about", "privacy", "terms", "contact"];
  const isStaticPage = staticPageTypes.includes(currentPage);
  const shouldAddHreflang = isStaticPage || showEditor;

  // Remove existing hreflang links (including static ones from index.html)
  for (const el of document.querySelectorAll('link[rel="alternate"][hreflang]')) {
    el.remove();
  }

  if (!shouldAddHreflang) return;

  const baseUrl = "https://anqr.link";
  const pagePath = showEditor ? "/" : `/${currentPage}`;

  const xDefaultLink = document.createElement("link");
  xDefaultLink.rel = "alternate";
  xDefaultLink.hreflang = "x-default";
  xDefaultLink.href = `${baseUrl}${pagePath}`;
  document.head.appendChild(xDefaultLink);

  for (const lang of languages) {
    const link = document.createElement("link");
    link.rel = "alternate";
    link.hreflang = lang.code === "en-GB" ? "en" : lang.code.toLowerCase();
    link.href =
      lang.code === "en-GB" ? `${baseUrl}${pagePath}` : `${baseUrl}${pagePath}?lang=${lang.code}`;
    document.head.appendChild(link);
  }
}
