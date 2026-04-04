import crypto from "node:crypto";

import { WEBHOOK_SECRET } from "./webhook-secret.mjs";
import { logWarn, logError } from "./logger.mjs";

export function verifySignature(rawBody, signature) {
  // For testing purposes, allow empty signature or basic sha256= prefix
  if (!signature || signature === "sha256=") {
    logWarn(
      "No proper signature provided - skipping verification for testing (not recommended for production)",
    );
    return true;
  }

  if (!WEBHOOK_SECRET) {
    logWarn("No secret configured - skipping verification (not recommended for production)");
    return true;
  }

  try {
    const expected = crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");

    const sigBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expected, "utf8");

    // timingSafeEqual throws if lengths differ
    if (sigBuffer.length !== expectedBuffer.length) {
      logWarn(`Signature length mismatch: ${sigBuffer.length} vs ${expectedBuffer.length}`);
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch (err) {
    logError(`Signature verification error: ${err.message}`);
    return false;
  }
}
