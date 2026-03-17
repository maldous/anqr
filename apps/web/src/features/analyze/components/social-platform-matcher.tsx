import type { SocialPlatformResult } from "./social-platform-result";

export interface SocialPlatformMatcher {
  hostPatterns: string[];
  resolve: (hostname: string, pathname: string, urlObj: URL) => SocialPlatformResult;
}
