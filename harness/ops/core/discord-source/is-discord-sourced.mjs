export function isDiscordSourced(issueData) {
  if (!issueData) return false;

  const discordLabelId = process.env.DISCORD_LABEL_ID || process.env.LINEAR_DISCORD_LABEL_ID;

  // Check for Discord label
  if (discordLabelId) {
    const labels = issueData.labels?.nodes || [];
    const hasDiscordLabel = labels.some(
      (l) => l.id === discordLabelId || l.name.toLowerCase().includes("discord"),
    );
    if (hasDiscordLabel) return true;
  }

  // Check if creator is Discord bot
  const createdBy = issueData.createdBy;
  if (createdBy) {
    const creatorIsDiscord =
      createdBy.email?.toLowerCase().includes("discord") ||
      createdBy.name?.toLowerCase().includes("discord") ||
      createdBy.id === process.env.DISCORD_BOT_USER_ID;
    if (creatorIsDiscord) return true;
  }

  return false;
}
