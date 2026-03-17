export function parseGifBackgroundColor(backgroundColor: string): [number, number, number] {
  const normalized = String(backgroundColor || "#ffffff")
    .trim()
    .replace(/^#/, "");

  if (/^[0-9a-fA-F]{3}$/.test(normalized)) {
    const r = normalized[0] + normalized[0];
    const g = normalized[1] + normalized[1];
    const b = normalized[2] + normalized[2];
    return [Number.parseInt(r, 16), Number.parseInt(g, 16), Number.parseInt(b, 16)];
  }

  if (/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return [
      Number.parseInt(normalized.slice(0, 2), 16),
      Number.parseInt(normalized.slice(2, 4), 16),
      Number.parseInt(normalized.slice(4, 6), 16),
    ];
  }

  return [255, 255, 255];
}
