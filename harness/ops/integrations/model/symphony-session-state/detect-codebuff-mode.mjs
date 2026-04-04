export function detectCodebuffMode(response) {
  // Check X-Codebuff-Mode header (to be added to codebuff-bridge)
  if (response?.headers?.["x-codebuff-mode"]) {
    return response.headers["x-codebuff-mode"];
  }

  // Detect from error messages
  if (response?.error || response?.message) {
    const errStr = String(response.error || response.message).toLowerCase();
    if (errStr.includes("free mode") || errStr.includes("free credits")) {
      return "free";
    }
    if (errStr.includes("paid mode") || errStr.includes("out of credits")) {
      return "paid"; // Was paid, now exhausted
    }
  }

  return null;
}
