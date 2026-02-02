/**
 * Enterprise/Industrial Payload Generators
 * GS1 Digital Link, OTPAuth
 */

import { createLogger } from '../../lib/logger';
import type { GS1DigitalLinkParams, OTPAuthParams } from './types';

const _log = createLogger('PAYLOAD');

/** Generate GS1 Digital Link URI */
export function generateGS1DigitalLink(params: GS1DigitalLinkParams): string {
  const baseUrl = params.baseUrl || 'https://id.gs1.org';
  let uri = `${baseUrl}/01/${params.gtin}`;

  const pathSegments: string[] = [];
  if (params.lot) pathSegments.push(`10/${params.lot}`);
  if (params.ser) pathSegments.push(`21/${params.ser}`);
  if (params.expiry) pathSegments.push(`17/${params.expiry}`);

  if (pathSegments.length > 0) {
    uri += `/${pathSegments.join('/')}`;
  }

  return uri;
}

/** Generate OTPAuth URI (TOTP/HOTP) */
export function generateOTPAuth(params: OTPAuthParams): string {
  const type = params.type || 'totp';
  const label =
    params.issuer && params.account
      ? `${encodeURIComponent(params.issuer)}:${encodeURIComponent(params.account)}`
      : encodeURIComponent(params.account || 'user');

  const uri = `otpauth://${type}/${label}`;

  const queryParams = new URLSearchParams();
  queryParams.set('secret', params.secret);

  if (params.issuer) queryParams.set('issuer', params.issuer);
  if (params.algorithm && params.algorithm !== 'SHA1') {
    queryParams.set('algorithm', params.algorithm);
  }
  if (params.digits && params.digits !== 6) {
    queryParams.set('digits', params.digits.toString());
  }
  if (type === 'totp' && params.period && params.period !== 30) {
    queryParams.set('period', params.period.toString());
  }
  if (type === 'hotp' && params.counter !== undefined) {
    queryParams.set('counter', params.counter.toString());
  }

  return `${uri}?${queryParams.toString()}`;
}
