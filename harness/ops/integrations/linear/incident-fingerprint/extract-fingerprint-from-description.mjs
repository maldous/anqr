export function extractFingerprintFromDescription(description) {
  if (!description) return null;

  // Look for fingerprint marker in description
  const match = description.match(/<!-- incident-fingerprint: ([a-f0-9]{16}) -->/);
  return match ? match[1] : null;
}
