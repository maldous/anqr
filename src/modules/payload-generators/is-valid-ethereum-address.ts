/**
 * Validate Ethereum address (0x + 40 hex chars)
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
