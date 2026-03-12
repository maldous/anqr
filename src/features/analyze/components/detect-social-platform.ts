import { SOCIAL_PLATFORM_MATCHERS } from './content-type-renderers._internal';

// ---------------------------------------------------------------------------
// detectSocialPlatform
// ---------------------------------------------------------------------------
export function detectSocialPlatform(
  url: string
): { name: string; badge: React.ReactNode; extractedInfo?: React.ReactNode } | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;
    const matcher = SOCIAL_PLATFORM_MATCHERS.find((m) =>
      m.hostPatterns.some((p) => hostname.includes(p))
    );
    return matcher ? matcher.resolve(hostname, pathname, urlObj) : null;
  } catch {
    return null;
  }
}
