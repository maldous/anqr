import type { UrlHelper } from './types';

/** Generate URL payload with optional UTM parameters */
export function generateUrl(params: UrlHelper): string {
  let url = params.href;

  if (params.forceHttps && url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }

  const utmParams = new URLSearchParams();
  if (params.utmSource) utmParams.set('utm_source', params.utmSource);
  if (params.utmMedium) utmParams.set('utm_medium', params.utmMedium);
  if (params.utmCampaign) utmParams.set('utm_campaign', params.utmCampaign);
  if (params.utmTerm) utmParams.set('utm_term', params.utmTerm);
  if (params.utmContent) utmParams.set('utm_content', params.utmContent);

  const paramStr = utmParams.toString();
  if (paramStr) {
    url += url.includes('?') ? '&' : '?';
    url += paramStr;
  }

  return url;
}
