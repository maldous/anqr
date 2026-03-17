import { parsePrefixedPayload } from "./parse-prefixed-payload";

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

  const parsed = parsePrefixedPayload(payload, "MECARD:");
  if (!parsed) return result;

  for (const [key, value] of Object.entries(parsed)) {
    switch (key) {
      case "N":
        result.name = value.replaceAll(",", " ");
        break;
      case "ORG":
        result.organization = value;
        break;
      case "TEL":
        result.phone = value;
        break;
      case "EMAIL":
        result.email = value;
        break;
      case "ADR":
        result.address = value.replaceAll(",", ", ");
        break;
      case "BDAY":
        result.birthday = value;
        break;
      case "URL":
        result.url = value;
        break;
      case "NOTE":
        result.note = value;
        break;
    }
  }

  return result;
}
