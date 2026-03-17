// ---------------------------------------------------------------------------
// 2. vCard parser – parses BEGIN:VCARD...END:VCARD
// ---------------------------------------------------------------------------
export function extractTypePrefix(keyPart: string, fallback: string): string {
  const typeMatch = /TYPE=([^;:]+)/i.exec(keyPart);
  return typeMatch ? typeMatch[1] : fallback;
}
