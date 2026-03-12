// ---------------------------------------------------------------------------
// 3. MeCard parser – parses MECARD:N:Last,First;...;;
// ---------------------------------------------------------------------------
export function parseMeCardPayload(payload: string): Record<string, string | null> {
  const result: Record<string, string | null> = {
    name: null,
    organization: null,
    phone: null,
    email: null,
    address: null,
    birthday: null,
    url: null,
    note: null,
  };

  if (!payload.toUpperCase().startsWith('MECARD:')) return result;

  const content = payload.slice(7).replace(/;;\s*$/, '');
  const parts = content.split(';');

  for (const part of parts) {
    const colonIdx = part.indexOf(':');
    if (colonIdx === -1) continue;
    const key = part.slice(0, colonIdx).toUpperCase();
    const value = part.slice(colonIdx + 1);

    switch (key) {
      case 'N':
        result.name = value.replaceAll(',', ' ');
        break;
      case 'ORG':
        result.organization = value;
        break;
      case 'TEL':
        result.phone = value;
        break;
      case 'EMAIL':
        result.email = value;
        break;
      case 'ADR':
        result.address = value.replaceAll(',', ', ');
        break;
      case 'BDAY':
        result.birthday = value;
        break;
      case 'URL':
        result.url = value;
        break;
      case 'NOTE':
        result.note = value;
        break;
    }
  }

  return result;
}
