// Generated from ../../../../scripts/ops/integrations/notifications/discord-webhook.mjs:35

import { DISCORD_WEBHOOK_URL } from "./discord-webhook-url.mjs";

export const DISCORD_WEBHOOK_ENABLED =
  process.env.DISCORD_WEBHOOK_ENABLED !== "false" && !!DISCORD_WEBHOOK_URL;
