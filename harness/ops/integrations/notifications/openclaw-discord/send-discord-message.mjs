// Generated from ../../../../scripts/ops/integrations/notifications/openclaw-discord.mjs:146

import { sendViaOpenClaw } from "./send-via-open-claw.mjs";

export async function sendDiscordMessage(content, options = {}) {
  if (!content || !content.trim()) {
    return { sent: false, reason: "empty content" };
  }
  return sendViaOpenClaw(content, options);
}
