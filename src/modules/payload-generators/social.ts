/**
 * Social and Messaging Payload Generators
 */

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

/** Generate messaging app deep link */
export function generateMessagingLink(
  platform: string,
  identifier: string,
  message?: string
): string {
  switch (platform.toLowerCase()) {
    case 'whatsapp': {
      let url = `https://wa.me/${identifier.replaceAll(/\D/g, '')}`;
      if (message) url += `?text=${encodeURIComponent(message)}`;
      return url;
    }
    case 'telegram': {
      let url = `https://t.me/${identifier}`;
      if (message) url += `?text=${encodeURIComponent(message)}`;
      return url;
    }
    case 'signal':
      return `https://signal.me/#p/${identifier}`;
    case 'viber':
      return `viber://chat?number=${identifier.replaceAll(/\D/g, '')}`;
    case 'line':
      return `https://line.me/ti/p/${identifier}`;
    case 'skype':
      return `skype:${identifier}?chat`;
    default:
      return identifier;
  }
}

/** Generate app deep link (Android intent or iOS universal link) */
export function generateAppDeepLink(
  platform: 'android' | 'ios' | 'universal',
  params: {
    scheme?: string;
    host?: string;
    path?: string;
    package?: string;
    fallbackUrl?: string;
  }
): string {
  if (platform === 'android' && params.package) {
    let intent = `intent://${params.host || ''}${params.path || ''}#Intent;`;
    if (params.scheme) intent += `scheme=${params.scheme};`;
    intent += `package=${params.package};`;
    if (params.fallbackUrl) {
      intent += `S.browser_fallback_url=${encodeURIComponent(params.fallbackUrl)};`;
    }
    intent += 'end';
    return intent;
  }

  if (params.scheme) {
    return `${params.scheme}://${params.host || ''}${params.path || ''}`;
  }

  return `https://${params.host || ''}${params.path || ''}`;
}
