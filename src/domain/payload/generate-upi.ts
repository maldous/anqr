import type { UPIParams } from '../../modules/payload-generators/types';

/**
 * Generate UPI payment URI (India)
 */
export function generateUPI(params: UPIParams): string {
  const queryParams = new URLSearchParams();

  queryParams.set('pa', params.pa);

  if (params.pn) queryParams.set('pn', params.pn);
  if (params.am !== undefined && params.am > 0) queryParams.set('am', params.am.toFixed(2));
  queryParams.set('cu', params.cu || 'INR');
  if (params.tn) queryParams.set('tn', params.tn.substring(0, 50));
  if (params.tr) queryParams.set('tr', params.tr.substring(0, 35));
  if (params.mc) queryParams.set('mc', params.mc);
  if (params.tid) queryParams.set('tid', params.tid);
  if (params.url) queryParams.set('url', params.url);
  if (params.mode) queryParams.set('mode', params.mode);
  if (params.purpose) queryParams.set('purpose', params.purpose);
  if (params.orgid) queryParams.set('orgid', params.orgid);
  if (params.sign) queryParams.set('sign', params.sign);

  return `upi://pay?${queryParams.toString()}`;
}
