import type { MeCardHelper } from "../../modules/payload-generators/types";

/** Generate MeCard string (Japanese format, more compact than vCard) */
export function generateMeCard(params: MeCardHelper): string {
  const escapeMeCard = (s: string) => s.replaceAll(/[\\";,:]/g, String.raw`\$&`);

  let mecard = "MECARD:";

  if (params.n) mecard += `N:${escapeMeCard(params.n)};`;
  if (params.nickname) mecard += `NICKNAME:${escapeMeCard(params.nickname)};`;
  if (params.org) mecard += `ORG:${escapeMeCard(params.org)};`;
  if (params.tel) mecard += `TEL:${params.tel};`;
  if (params.email) mecard += `EMAIL:${params.email};`;
  if (params.url) mecard += `URL:${params.url};`;
  if (params.adr) mecard += `ADR:${escapeMeCard(params.adr)};`;
  if (params.bday) mecard += `BDAY:${params.bday.replaceAll("-", "")};`;
  if (params.note) mecard += `NOTE:${escapeMeCard(params.note)};`;

  mecard += ";";
  return mecard;
}
