export function isNeverPurchasedCredits(value) {
  const text = String(value || "").toLowerCase();
  return text.includes("never purchased credits");
}
