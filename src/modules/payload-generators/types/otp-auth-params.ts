export interface OTPAuthParams {
  type: 'totp' | 'hotp';
  issuer?: string;
  account?: string;
  secret: string;
  algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
  digits?: number;
  period?: number;
  counter?: number;
}
