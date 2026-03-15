/** Generate social profile deep link */
export function generateSocialProfile(platform: string, username: string): string {
  const platformLinks: Record<string, (u: string) => string> = {
    twitter: (u) => `https://twitter.com/${u}`,
    x: (u) => `https://x.com/${u}`,
    instagram: (u) => `https://instagram.com/${u}`,
    facebook: (u) => `https://facebook.com/${u}`,
    linkedin: (u) => `https://linkedin.com/in/${u}`,
    github: (u) => `https://github.com/${u}`,
    youtube: (u) => `https://youtube.com/@${u}`,
    tiktok: (u) => `https://tiktok.com/@${u}`,
    snapchat: (u) => `https://snapchat.com/add/${u}`,
    pinterest: (u) => `https://pinterest.com/${u}`,
    reddit: (u) => `https://reddit.com/u/${u}`,
    discord: (u) => `https://discord.gg/${u}`,
    twitch: (u) => `https://twitch.tv/${u}`,
  };

  const generator = platformLinks[platform.toLowerCase()];
  if (generator) {
    return generator(username);
  }

  return `https://${platform}.com/${username}`;
}
