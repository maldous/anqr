import type { EPCSepaParams } from "./payload-generators/types";

/**
 * Generate EPC/SEPA payment QR code (EU bank transfer)
 */
export function generateEPCSepa(params: EPCSepaParams): string {
  const lines: string[] = [
    "BCD",
    "002",
    "1",
    "SCT",
    params.bic || "",
    params.name.substring(0, 70),
    params.iban.replaceAll(/\s/g, "").toUpperCase(),
  ];

  if (params.amount !== undefined && params.amount > 0) {
    lines.push(`EUR${params.amount.toFixed(2)}`);
  } else {
    lines.push("");
  }

  lines.push(
    "",
    params.reference?.substring(0, 35) || "",
    params.text?.substring(0, 140) || "",
    "",
  );

  return lines.join("\n");
}
