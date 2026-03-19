import type { QrGeneratePromptArgs } from "@/contracts/mcp";

export function buildIntentGuidance(intent: QrGeneratePromptArgs["intent"]): string {
  switch (intent) {
    case "url":
      return "Prefer a short canonical URL and avoid tracking parameters if a cleaner redirect exists.";
    case "wifi":
      return "Use a valid WIFI payload and confirm the SSID, auth mode, and password are exact.";
    case "contact":
      return "Prefer a clean vCard payload with only the fields required by the recipient workflow.";
    case "payment":
      return "Use the payment payload format required by the target wallet or banking flow.";
    case "plain_text":
      return "Keep the text short and stable so the QR stays dense enough to scan reliably.";
  }
}
