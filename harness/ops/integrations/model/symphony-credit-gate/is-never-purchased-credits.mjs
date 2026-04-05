export function isNeverPurchasedCredits(entry) {
  const haystack = [entry?.status, entry?.reason, entry?.detail, entry?.message]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes("never purchased credits");
}
