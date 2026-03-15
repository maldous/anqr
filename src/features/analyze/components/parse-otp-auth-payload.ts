// ---------------------------------------------------------------------------
// 12. OTP Auth parser
// ---------------------------------------------------------------------------
export function parseOtpAuthPayload(payload: string): Record<string, string | null> {
  const result: Record<string, string | null> = {
    type: null,
    issuer: null,
    account: null,
    algorithm: null,
    algorithmNote: null,
    digits: null,
    period: null,
    counter: null,
    hasSecret: null,
  };

  const match = payload.match(/^otpauth:\/\/(totp|hotp)\/([^?]+)(?:\?(.*))?$/i);
  if (!match) return result;

  result.type = match[1].toUpperCase();
  const label = decodeURIComponent(match[2]);
  const queryString = match[3];

  // Parse label (format: Issuer:Account or just Account)
  if (label.includes(':')) {
    const [issuer, account] = label.split(':');
    result.issuer = issuer;
    result.account = account;
  } else {
    result.account = label;
  }

  if (queryString) {
    const params = new URLSearchParams(queryString);
    result.issuer = result.issuer || params.get('issuer');
    result.algorithm = params.get('algorithm')?.toUpperCase() || 'SHA1';
    result.digits = params.get('digits') || '6';
    result.period = params.get('period') || '30';
    result.counter = params.get('counter');
    result.hasSecret = params.has('secret') ? 'Present (hidden for security)' : 'Missing';

    // Add security note for algorithm
    if (result.algorithm === 'SHA1') {
      result.algorithmNote = 'Standard, widely compatible';
    } else if (result.algorithm === 'SHA256') {
      result.algorithmNote = 'More secure, good compatibility';
    } else if (result.algorithm === 'SHA512') {
      result.algorithmNote = 'Most secure, limited compatibility';
    }
  }

  return result;
}
