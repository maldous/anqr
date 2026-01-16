/**
 * Core Payload Generators
 * URL, tel, email, SMS, geo, WiFi
 */

import type {
  EmailHelper,
  GeoHelper,
  SmsHelper,
  TelHelper,
  UrlHelper,
  WifiHelper,
} from './types';

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

/** Generate telephone URI */
export function generateTel(params: TelHelper): string {
  return `tel:${params.number.replaceAll(/\s+/g, '')}`;
}

/** Generate email (mailto) URI */
export function generateEmail(params: EmailHelper): string {
  let mailto = `mailto:${params.to}`;
  const queryParams = new URLSearchParams();

  if (params.subject) queryParams.set('subject', params.subject);
  if (params.body) queryParams.set('body', params.body);

  const paramStr = queryParams.toString();
  if (paramStr) mailto += `?${paramStr}`;

  return mailto;
}

/** Generate SMS URI */
export function generateSms(params: SmsHelper): string {
  let sms = `sms:${params.number}`;
  if (params.body) {
    sms += `?body=${encodeURIComponent(params.body)}`;
  }
  return sms;
}

/** Generate Geo URI */
export function generateGeo(params: GeoHelper): string {
  let geo = `geo:${params.lat},${params.lon}`;
  if (params.query) {
    geo += `?q=${encodeURIComponent(params.query)}`;
  }
  return geo;
}

/** Generate WiFi configuration string */
export function generateWifi(params: WifiHelper): string {
  const escapeWifi = (s: string) => s.replaceAll(/[\\";,:]/g, String.raw`\$&`);

  let wifi = 'WIFI:';
  wifi += `T:${params.auth};`;
  wifi += `S:${escapeWifi(params.ssid)};`;

  if (params.password && params.auth !== 'nopass') {
    wifi += `P:${escapeWifi(params.password)};`;
  }

  if (params.hidden) {
    wifi += 'H:true;';
  }

  if (params.eapIdentity) wifi += `I:${escapeWifi(params.eapIdentity)};`;
  if (params.eapAnonymous) wifi += `A:${escapeWifi(params.eapAnonymous)};`;
  if (params.eapPhase2) wifi += `PH2:${params.eapPhase2};`;

  wifi += ';';
  return wifi;
}
