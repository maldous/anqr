// ---------------------------------------------------------------------------
// 4. Email (mailto:) parser
// ---------------------------------------------------------------------------
export function parseEmailPayload(payload: string): Record<string, string | null> {
  const result: Record<string, string | null> = {
    to: null,
    subject: null,
    body: null,
    cc: null,
    bcc: null,
    domain: null,
    provider: null,
  };

  if (!payload.toLowerCase().startsWith('mailto:')) return result;

  const content = payload.slice(7);
  const [email, queryString] = content.split('?');
  result.to = decodeURIComponent(email);

  // Extract domain
  const atIdx = result.to.indexOf('@');
  if (atIdx !== -1) {
    result.domain = result.to.slice(atIdx + 1).toLowerCase();
    // Detect provider
    if (result.domain.includes('gmail')) result.provider = 'Gmail';
    else if (
      result.domain.includes('outlook') ||
      result.domain.includes('hotmail') ||
      result.domain.includes('live.com')
    )
      result.provider = 'Microsoft Outlook';
    else if (result.domain.includes('yahoo')) result.provider = 'Yahoo Mail';
    else if (
      result.domain.includes('icloud') ||
      result.domain.includes('me.com') ||
      result.domain.includes('mac.com')
    )
      result.provider = 'Apple iCloud';
    else if (result.domain.includes('protonmail') || result.domain.includes('proton.me'))
      result.provider = 'ProtonMail';
    else result.provider = 'Custom Domain';
  }

  if (queryString) {
    const params = new URLSearchParams(queryString);
    result.subject = params.get('subject');
    result.body = params.get('body');
    result.cc = params.get('cc');
    result.bcc = params.get('bcc');
  }

  return result;
}
