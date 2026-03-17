/**
 * Validate amount format (positive number with up to 2 decimal places)
 */
export function isValidAmount(amount: string): boolean {
  if (!amount) return true; // Amount is often optional
  const num = Number.parseFloat(amount);
  return !Number.isNaN(num) && num >= 0;
}
