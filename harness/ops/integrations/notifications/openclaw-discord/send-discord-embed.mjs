import { sendViaOpenClaw } from "./send-via-open-claw.mjs";
import { colorToEmoji } from "./color-to-emoji.mjs";

export async function sendDiscordEmbed(options, transportOptions) {
  const merged = transportOptions ? { ...options, ...transportOptions } : options;
  const { title, description, fields, footer, color, replyTo, threadName, source } = merged || {};
  // Build embed as compact formatted text for Discord.
  // Inline fields → single line with " · " separator.
  // Non-inline fields → one per line.
  let content = "";

  if (title) {
    const emoji = colorToEmoji(color);
    content += emoji ? `${emoji} **${title}**` : `**${title}**`;
  }

  if (description) {
    const desc = description.length > 150 ? description.slice(0, 147) + "\u2026" : description;
    content += `\n${desc}`;
  }

  if (fields && fields.length > 0) {
    const inlineFields = fields.filter((f) => f.inline);
    const blockFields = fields.filter((f) => !f.inline);

    if (inlineFields.length > 0) {
      const inlineStr = inlineFields.map((f) => `${f.name}: ${f.value}`).join(" \u00b7 ");
      content += `\n${inlineStr}`;
    }

    for (const field of blockFields) {
      content += `\n${field.name}: ${field.value}`;
    }
  }

  if (footer) {
    content += `\n_${footer}_`;
  }

  if (!content.trim()) {
    return { sent: false, reason: "empty embed" };
  }

  return sendViaOpenClaw(content.trim(), { replyTo, threadName, source });
}
