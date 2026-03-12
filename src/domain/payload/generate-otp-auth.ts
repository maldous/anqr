import type { OTPAuthParams } from '../../modules/payload-generators/types';

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
