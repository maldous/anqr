export interface AppLinkHelper {
  platform: "universal" | "android" | "ios" | "custom";
  scheme?: string;
  host?: string;
  path?: string;
  package?: string;
  fallbackUrl?: string;
}
