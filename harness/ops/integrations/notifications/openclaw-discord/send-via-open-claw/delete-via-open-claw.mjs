import { DISCORD_TEXT_CHANNEL_ID } from "../discord-text-channel-id.mjs";
import { invokeGateway } from "../invoke-gateway.mjs";

export async function deleteViaOpenClaw(messageId) {
  if (!messageId) return { deleted: false, reason: "no messageId" };

  const result = await invokeGateway("message", {
    action: "delete",
    channel: "discord",
    to: DISCORD_TEXT_CHANNEL_ID,
    messageId,
  });

  return result.ok ? { deleted: true } : { deleted: false, reason: result.reason };
}
