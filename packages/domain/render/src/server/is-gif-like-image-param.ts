export function isGifLikeImageParam(value: string | null | undefined): boolean {
  const raw = String(value || "").trim();
  if (!raw) return false;
  try {
    return new URL(raw).pathname.toLowerCase().endsWith(".gif");
  } catch {
    return raw.toLowerCase().split("?")[0].endsWith(".gif");
  }
}
