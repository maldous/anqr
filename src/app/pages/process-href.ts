export function processHref(href: string, lang: string): string {
  return href.replaceAll('${lang}', lang);
}
