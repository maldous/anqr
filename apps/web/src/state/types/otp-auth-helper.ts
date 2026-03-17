export interface OtpAuthHelper {
  issuer?: string;
  account?: string;
  secret?: string;
  algorithm?: string;
  digits?: number;
  period?: number;
  counter?: number;
  type?: "totp" | "hotp";
}
