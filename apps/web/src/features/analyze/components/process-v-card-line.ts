import { extractTypePrefix } from "./extract-type-prefix";

export function processVCardLine(
  baseKey: string,
  keyPart: string,
  value: string,
  result: Record<string, string | string[] | null>,
  phones: string[],
  emails: string[],
  addresses: string[],
): void {
  switch (baseKey) {
    case "VERSION":
      result.version = value;
      break;
    case "FN":
      result.fullName = value;
      break;
    case "N":
      result.name = value.replaceAll(";", " ").trim();
      break;
    case "ORG":
      result.organization = value.replaceAll(";", ", ");
      break;
    case "TITLE":
      result.title = value;
      break;
    case "TEL":
      phones.push(`${extractTypePrefix(keyPart, "Phone")}: ${value}`);
      break;
    case "EMAIL":
      emails.push(`${extractTypePrefix(keyPart, "Email")}: ${value}`);
      break;
    case "ADR": {
      const addrParts = value.split(";").filter(Boolean);
      if (addrParts.length > 0) {
        addresses.push(`${extractTypePrefix(keyPart, "Address")}: ${addrParts.join(", ")}`);
      }
      break;
    }
    case "BDAY":
      result.birthday = value;
      break;
    case "URL":
      result.url = value;
      break;
    case "NOTE":
      result.note = value;
      break;
    case "PHOTO":
      result.hasPhoto = "true";
      break;
  }
}
