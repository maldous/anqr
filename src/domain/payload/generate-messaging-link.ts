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
