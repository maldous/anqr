import { sendDiscordNotification } from "./send-discord-notification.mjs";
import { trimToUndefined } from "./trim-to-undefined.mjs";

export async function sendDiscordEmbed({
  title,
  description,
  color = 0x5865f2,
  fields = [],
  footer,
  replyTo,
  threadName,
  _source,
}) {
  const embed = {
    title: trimToUndefined(title),
    description: trimToUndefined(description),
    color,
    fields: Array.isArray(fields) ? fields : [],
    timestamp: new Date().toISOString(),
  };

  if (footer) {
    embed.footer = { text: footer };
  }

  const payload = {
    embeds: [embed],
    username: "OpenClaw",
  };

  // Add thread name for threaded conversations
  if (threadName) {
    payload.thread_name = threadName;
  }

  // Add reply reference for message replies
  if (replyTo) {
    payload.message_reference = { message_id: replyTo };
  }

  return sendDiscordNotification(payload);
}
