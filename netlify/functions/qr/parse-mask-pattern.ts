export function parseMaskPattern(param: string | null): "auto" | number {
  if (!param || param === "auto") return "auto";
  const parsed = Number.parseInt(param, 10);
  if (Number.isNaN(parsed)) return "auto";
  return Math.min(7, Math.max(0, parsed));
}
