// ---------------------------------------------------------------------------
// 9. EPC/SEPA payment parser
// ---------------------------------------------------------------------------
export function parseEpcSepaPayload(payload: string): Record<string, string | null> {
  const result: Record<string, string | null> = {
    serviceTag: null,
    version: null,
    encoding: null,
    bic: null,
    beneficiaryName: null,
    iban: null,
    amount: null,
    currency: null,
    purposeCode: null,
    referenceType: null,
    reference: null,
    remittanceInfo: null,
    beneficiaryToOriginator: null,
  };

  const lines = payload.split("\n");
  if (lines.length < 4) return result;

  result.serviceTag = lines[0] || null; // Should be 'BCD'
  result.version = lines[1] || null;
  result.encoding = lines[2] || null;
  // Line 3 is identification code
  result.bic = lines[4] || null;
  result.beneficiaryName = lines[5] || null;
  result.iban = lines[6] || null;

  // Parse amount (format: EUR123.45)
  if (lines[7]) {
    const amountMatch = lines[7].match(/([A-Z]{3})([\d.]+)/);
    if (amountMatch) {
      result.currency = amountMatch[1];
      result.amount = amountMatch[2];
    }
  }

  result.purposeCode = lines[8] || null;
  result.referenceType = lines[9] || null;
  result.reference = lines[10] || null;
  result.remittanceInfo = lines[11] || null;
  result.beneficiaryToOriginator = lines[12] || null;

  // Format IBAN with spaces
  if (result.iban) {
    result.iban = result.iban.replaceAll(/(.{4})/g, "$1 ").trim();
  }

  return result;
}
