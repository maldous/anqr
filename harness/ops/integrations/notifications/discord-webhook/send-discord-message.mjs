// Generated from ../../../../scripts/ops/integrations/notifications/discord-webhook.mjs:198

import { sendDiscordNotification } from "./send-discord-notification.mjs";
import { trimToUndefined } from "./trim-to-undefined.mjs";

export async function sendDiscordMessage(message, options = {}) {
  const content = trimToUndefined(message);
  if (!content) return { sent: false, reason: "empty message" };

  const payload = { content };

  // Add thread name for threaded conversations
  if (options.threadName) {
    payload.thread_name = options.threadName;
  }

  // Add reply reference for message replies
  if (options.replyTo) {
    payload.message_reference = { message_id: options.replyTo };
  }

  return sendDiscordNotification(payload);
}
