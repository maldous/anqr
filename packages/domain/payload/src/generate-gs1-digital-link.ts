import type { GS1DigitalLinkParams } from "./payload-generators/types";

/** Generate GS1 Digital Link URI */
export function generateGS1DigitalLink(params: GS1DigitalLinkParams): string {
  const baseUrl = params.baseUrl || "https://id.gs1.org";
  let uri = `${baseUrl}/01/${params.gtin}`;

  const pathSegments: string[] = [];
  if (params.lot) pathSegments.push(`10/${params.lot}`);
  if (params.ser) pathSegments.push(`21/${params.ser}`);
  if (params.expiry) pathSegments.push(`17/${params.expiry}`);

  if (pathSegments.length > 0) {
    uri += `/${pathSegments.join("/")}`;
  }

  return uri;
}
