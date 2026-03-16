export function updateCanonicalUrl(
  showEditor: boolean,
  currentPage: string,
  currentLang: string,
): void {
  let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement("link");
    canonicalLink.rel = "canonical";
    document.head.appendChild(canonicalLink);
  }
  const basePath = showEditor ? "/" : `/${currentPage}`;
  canonicalLink.href =
    currentLang === "en-GB"
      ? `https://anqr.link${basePath}`
      : `https://anqr.link${basePath}?lang=${currentLang}`;
}
