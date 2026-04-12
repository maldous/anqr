import crypto from "node:crypto";

import { WEBHOOK_SECRET } from "./webhook-secret.mjs";
import { logWarn, logError } from "./logger.mjs";

const ALLOW_INSECURE = process.env.ANQR_ALLOW_INSECURE_WEBHOOKS === "true";

export function verifySignature(rawBody, signature) {
  if (!WEBHOOK_SECRET) {
    if (ALLOW_INSECURE) {
      logWarn(
        "No LINEAR_WEBHOOK_SECRET configured — bypassing verification (ANQR_ALLOW_INSECURE_WEBHOOKS=true)",
      );
      return true;
    }
    logError(
      "LINEAR_WEBHOOK_SECRET not configured — rejecting webhook (set ANQR_ALLOW_INSECURE_WEBHOOKS=true for dev)",
    );
    return false;
  }

  if (!signature || signature === "sha256=") {
    if (ALLOW_INSECURE) {
      logWarn("No signature provided — bypassing verification (ANQR_ALLOW_INSECURE_WEBHOOKS=true)");
      return true;
    }
    logWarn("No signature provided — rejecting webhook");
    return false;
  }

  try {
    const expected = crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");

    const sigBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expected, "utf8");

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
