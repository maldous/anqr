export const WEBHOOK_SECRET = process.env.LINEAR_WEBHOOK_SECRET || null;

if (!WEBHOOK_SECRET && process.env.ANQR_ALLOW_INSECURE_WEBHOOKS !== "true") {
  process.stderr.write(
    "[linear-webhook] FATAL: LINEAR_WEBHOOK_SECRET is not set and ANQR_ALLOW_INSECURE_WEBHOOKS is not 'true'.\n" +
    "[linear-webhook] Refusing to start without webhook signature verification.\n" +
    "[linear-webhook] Set LINEAR_WEBHOOK_SECRET in anqr.env or anqr-ops.env.\n",
  );
  process.exit(1);
}
