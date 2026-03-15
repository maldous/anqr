/**
 * Validate Japan store ID (non-empty)
 */
export function isValidStoreId(storeId: string): boolean {
  return storeId.trim().length >= 1;
}
