export function addLink(
  id: string,
  attrs: {
    rel: string;
    href: string;
    as?: string;
    crossOrigin?: string;
  },
): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.id = id;
  link.rel = attrs.rel;
  link.href = attrs.href;
  if (attrs.as) link.as = attrs.as;
  if (attrs.crossOrigin) link.crossOrigin = attrs.crossOrigin;
  document.head.appendChild(link);
}
