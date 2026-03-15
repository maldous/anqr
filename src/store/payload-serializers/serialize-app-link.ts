import { generateAppDeepLink } from '@/modules/payload-generators';
import type { PayloadData } from './payload-data';

export function serializeAppLink(payload: PayloadData): string {
  const app = payload.appLink;
  if (app.platform === 'universal') {
    let url =
      app.scheme && app.host ? `${app.scheme}://${app.host}${app.path || ''}` : payload.text;
    if (url && !url.includes('://')) {
      url = `https://${url}`;
    }
    return url || '';
  }
  if (app.platform === 'custom') {
    if (app.scheme && app.host) {
      return `${app.scheme}://${app.host}${app.path || ''}`;
    }
    return payload.text;
  }
  return generateAppDeepLink(app.platform, {
    scheme: app.scheme,
    host: app.host,
    path: app.path,
    package: app.package,
    fallbackUrl: app.fallbackUrl,
  });
}
