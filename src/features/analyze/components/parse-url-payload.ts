import type { UrlParseResult } from './payload-parsers.types';

export function parseUrlPayload(payload: string): UrlParseResult {
  const result: UrlParseResult = {
    full: payload,
    protocol: null,
    hostname: null,
    port: null,
    path: null,
    queryString: null,
    fragment: null,
    isSecure: null,
    isShortened: null,
    shortenerService: null,
    params: [],
    urlLength: String(payload.length),
    hasPercentEncoding: /%[0-9A-Fa-f]{2}/.test(payload) ? 'true' : null,
  };

  try {
    const url = new URL(payload);
    result.protocol = url.protocol.replaceAll(':', '');
    result.hostname = url.hostname;
    result.port = url.port || null;
    result.path = url.pathname === '/' ? null : url.pathname;
    result.queryString = url.search || null;
    result.fragment = url.hash ? url.hash.slice(1) : null;
    result.isSecure = url.protocol === 'https:' ? 'true' : 'false';

    // Check if shortened URL
    const shorteners = [
      'bit.ly',
      't.co',
      'goo.gl',
      'tinyurl.com',
      'ow.ly',
      'is.gd',
      'buff.ly',
      'adf.ly',
      'j.mp',
      'rb.gy',
      'cutt.ly',
      'shorturl.at',
    ];
    for (const shortener of shorteners) {
      if (url.hostname.includes(shortener)) {
        result.isShortened = 'true';
        result.shortenerService = shortener;
        break;
      }
    }

    // Parse all query parameters
    const params: Array<{ key: string; value: string }> = [];
    url.searchParams.forEach((value, key) => {
      params.push({ key, value: decodeURIComponent(value) });
    });
    result.params = params;
  } catch {
    // Not a valid URL
  }

  return result;
}
