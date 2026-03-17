/** Generate app deep link (Android intent or iOS universal link) */
export function generateAppDeepLink(
  platform: "android" | "ios" | "universal",
  params: {
    scheme?: string;
    host?: string;
    path?: string;
    package?: string;
    fallbackUrl?: string;
  },
): string {
  if (platform === "android" && params.package) {
    let intent = `intent://${params.host || ""}${params.path || ""}#Intent;`;
    if (params.scheme) intent += `scheme=${params.scheme};`;
    intent += `package=${params.package};`;
    if (params.fallbackUrl) {
      intent += `S.browser_fallback_url=${encodeURIComponent(params.fallbackUrl)};`;
    }
    intent += "end";
    return intent;
  }

  if (params.scheme) {
    return `${params.scheme}://${params.host || ""}${params.path || ""}`;
  }

  return `https://${params.host || ""}${params.path || ""}`;
}
