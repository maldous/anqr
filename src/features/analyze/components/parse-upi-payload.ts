// ---------------------------------------------------------------------------
// 10. UPI payment parser
// ---------------------------------------------------------------------------
export function parseUpiPayload(payload: string): Record<string, string | null> {
  const result: Record<string, string | null> = {
    vpa: null,
    payeeName: null,
    amount: null,
    currency: 'INR',
    transactionRef: null,
    transactionNote: null,
    merchantCode: null,
    minAmount: null,
    url: null,
  };

  if (!payload.toLowerCase().startsWith('upi://')) return result;

  try {
    const url = new URL(payload);
    result.vpa = url.searchParams.get('pa');
    result.payeeName = url.searchParams.get('pn');
    result.amount = url.searchParams.get('am');
    result.currency = url.searchParams.get('cu') || 'INR';
    result.transactionRef = url.searchParams.get('tr');
    result.transactionNote = url.searchParams.get('tn');
    result.merchantCode = url.searchParams.get('mc');
    result.minAmount = url.searchParams.get('mam');
    result.url = url.searchParams.get('url');
  } catch {
    // Invalid URL format
  }

  return result;
}
