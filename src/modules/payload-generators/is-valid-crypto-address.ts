/**
 * Validate crypto wallet address based on type
 */
export function isValidCryptoAddress(address: string, type: string): boolean {
  if (!address || address.length < 10) return false;

  switch (type.toLowerCase()) {
    case 'bitcoin':
      // Legacy (1...), P2SH (3...), Bech32 (bc1...)
      return (
        /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || /^bc1[a-z0-9]{39,59}$/i.test(address)
      );
    case 'ethereum':
      // 0x followed by 40 hex characters
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    case 'litecoin':
      // Legacy (L..., M...), Bech32 (ltc1...)
      return (
        /^[LM][a-km-zA-HJ-NP-Z1-9]{26,33}$/.test(address) || /^ltc1[a-z0-9]{39,59}$/i.test(address)
      );
    default:
      // Generic: at least 20 alphanumeric characters
      return /^[a-zA-Z0-9]{20,}$/.test(address);
  }
}
