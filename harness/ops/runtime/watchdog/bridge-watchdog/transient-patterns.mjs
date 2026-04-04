export const TRANSIENT_PATTERNS = [
  /429.*rate.?limit/i,
  /quota.*exhausted/i,
  /usage limit/i,
  /timeout/i,
  /ECONNREFUSED/i,
  /provider.*exhausted/i,
];
