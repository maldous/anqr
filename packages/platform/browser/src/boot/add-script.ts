export function addScript(
  id: string,
  src: string,
  options: {
    async?: boolean;
    crossOrigin?: string;
    charset?: string;
  } = {},
): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;

  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = options.async ?? true;
  if (options.crossOrigin) script.crossOrigin = options.crossOrigin;
  if (options.charset) script.setAttribute("charset", options.charset);
  document.head.appendChild(script);
}
