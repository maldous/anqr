/**
 * Validate Lightning invoice (starts with lnbc, lntb, lnbcrt, etc.)
 */
export function isValidLightningInvoice(invoice: string): boolean {
  return /^ln(bc|tb|bcrt)[a-z0-9]+$/i.test(invoice.toLowerCase());
}
