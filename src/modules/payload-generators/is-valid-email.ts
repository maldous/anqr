/**
 * Validate email for vCard compatibility.
 * Android requires EMAIL to contain @.
 */
export function isValidEmail(email: string): boolean {
  return email.includes('@') && email.length >= 3;
}
