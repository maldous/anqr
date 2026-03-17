import { lookup as dnsLookup } from "node:dns/promises";
import { isPrivateOrReservedIP } from "./is-private-or-reserved-ip";
import { IS_TEST_RUNTIME } from "./is-test-runtime.const";
import { overlayHostnameSafetyCache } from "./overlay-hostname-safety-cache.const";
import { OVERLAY_HOST_LOOKUP_TTL_MS } from "./overlay-host-lookup-ttl-ms.const";
import { OVERLAY_HOST_LOOKUP_NEGATIVE_TTL_MS } from "./overlay-host-lookup-negative-ttl-ms.const";

export async function _isPrivateHostname(hostname: string): Promise<boolean> {
  let normalizedHostname = String(hostname || "")
    .trim()
    .toLowerCase();
  while (normalizedHostname.endsWith(".")) normalizedHostname = normalizedHostname.slice(0, -1);

  if (!normalizedHostname) {
    return true;
  }

  // First check if it's already a literal IP
  if (isPrivateOrReservedIP(normalizedHostname)) {
    return true;
  }

  // Check for common bypass patterns
  if (
    normalizedHostname === "localhost" ||
    normalizedHostname.endsWith(".local") ||
    normalizedHostname.endsWith(".localhost") ||
    normalizedHostname.endsWith(".internal") ||
    normalizedHostname.includes("127.0.0.1") ||
    normalizedHostname.includes("0.0.0.0")
  ) {
    return true;
  }

  // Keep tests deterministic and offline-friendly while preserving heuristic checks.
  if (IS_TEST_RUNTIME) {
    return false;
  }

  const now = Date.now();
  const cached = overlayHostnameSafetyCache.get(normalizedHostname);
  if (cached && cached.expiresAt > now) {
    return cached.isPrivate;
  }

  try {
    const resolved = await dnsLookup(normalizedHostname, { all: true, verbatim: true });
    const isPrivate =
      resolved.length === 0 || resolved.some((entry) => isPrivateOrReservedIP(entry.address));
    overlayHostnameSafetyCache.set(normalizedHostname, {
      isPrivate,
      expiresAt: now + OVERLAY_HOST_LOOKUP_TTL_MS,
    });
    return isPrivate;
  } catch {
    // Fail closed when DNS lookup fails.
    overlayHostnameSafetyCache.set(normalizedHostname, {
      isPrivate: true,
      expiresAt: now + OVERLAY_HOST_LOOKUP_NEGATIVE_TTL_MS,
    });
    return true;
  }
}
