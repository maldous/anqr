export function parsePrefixedPayload(
  payload: string,
  prefix: string
): Record<string, string> | null {
  if (!payload.toUpperCase().startsWith(prefix.toUpperCase())) return null;

  const content = payload.slice(prefix.length).replace(/;;\s*$/, '');
  const parts = content.split(';');
  const result: Record<string, string> = {};

  for (const part of parts) {
    const colonIdx = part.indexOf(':');
    if (colonIdx === -1) continue;
    const key = part.slice(0, colonIdx).toUpperCase();
    result[key] = part.slice(colonIdx + 1);
  }

  return result;
}
