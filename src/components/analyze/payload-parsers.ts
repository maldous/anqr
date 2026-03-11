/**
 * Pure payload parser functions extracted from the Analyze component.
 *
 * Each function was originally wrapped in `useCallback(..., [])` with an empty
 * dependency array, confirming they are pure (no React state / prop references).
 */

// ---------------------------------------------------------------------------
// 1. WiFi payload parser – parses WIFI:T:WPA;S:Name;P:pass;H:true;;
// ---------------------------------------------------------------------------
export function parseWifiPayload(payload: string): Record<string, string | null> {
  const result: Record<string, string | null> = {
    ssid: null,
    password: null,
    security: null,
    hidden: null,
    eapMethod: null,
    identity: null,
    anonymousIdentity: null,
    phase2: null,
  };

  if (!payload.toUpperCase().startsWith('WIFI:')) return result;

  // Remove WIFI: prefix and trailing ;;
  const content = payload.slice(5).replace(/;;\s*$/, '');
  const parts = content.split(';');

  for (const part of parts) {
    const colonIdx = part.indexOf(':');
    if (colonIdx === -1) continue;
    const key = part.slice(0, colonIdx).toUpperCase();
    const value = part.slice(colonIdx + 1);

    switch (key) {
      case 'S':
        result.ssid = value;
        break;
      case 'P':
        result.password = value;
        break;
      case 'T':
        result.security = value.toUpperCase();
        break;
      case 'H':
        result.hidden = value.toLowerCase() === 'true' ? 'true' : 'false';
        break;
      case 'E':
        result.eapMethod = value;
        break;
      case 'I':
        result.identity = value;
        break;
      case 'A':
        result.anonymousIdentity = value;
        break;
      case 'PH2':
        result.phase2 = value;
        break;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// 2. vCard parser – parses BEGIN:VCARD...END:VCARD
// ---------------------------------------------------------------------------
export function parseVCardPayload(payload: string): Record<string, string | string[] | null> {
  const result: Record<string, string | string[] | null> = {
    version: null,
    fullName: null,
    name: null,
    organization: null,
    title: null,
    phones: [],
    emails: [],
    addresses: [],
    birthday: null,
    url: null,
    note: null,
    hasPhoto: null,
  };

  if (!payload.toUpperCase().includes('BEGIN:VCARD')) return result;

  const lines = payload.split(/\r?\n/);
  const phones: string[] = [];
  const emails: string[] = [];
  const addresses: string[] = [];

  let i = 0;
  while (i < lines.length) {
    let line = lines[i];
    // Handle line folding (continuation lines start with space or tab)
    while (i + 1 < lines.length && /^[ \t]/.test(lines[i + 1])) {
      i++;
      line += lines[i].slice(1);
    }
    i++;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const keyPart = line.slice(0, colonIdx).toUpperCase();
    const value = line.slice(colonIdx + 1);
    const baseKey = keyPart.split(';')[0];

    switch (baseKey) {
      case 'VERSION':
        result.version = value;
        break;
      case 'FN':
        result.fullName = value;
        break;
      case 'N':
        result.name = value.replaceAll(';', ' ').trim();
        break;
      case 'ORG':
        result.organization = value.replaceAll(';', ', ');
        break;
      case 'TITLE':
        result.title = value;
        break;
      case 'TEL': {
        const typeMatch = keyPart.match(/TYPE=([^;:]+)/i);
        const type = typeMatch ? typeMatch[1] : 'Phone';
        phones.push(`${type}: ${value}`);
        break;
      }
      case 'EMAIL': {
        const typeMatch = keyPart.match(/TYPE=([^;:]+)/i);
        const type = typeMatch ? typeMatch[1] : 'Email';
        emails.push(`${type}: ${value}`);
        break;
      }
      case 'ADR': {
        const typeMatch = keyPart.match(/TYPE=([^;:]+)/i);
        const type = typeMatch ? typeMatch[1] : 'Address';
        const addrParts = value.split(';').filter(Boolean);
        if (addrParts.length > 0) {
          addresses.push(`${type}: ${addrParts.join(', ')}`);
        }
        break;
      }
      case 'BDAY':
        result.birthday = value;
        break;
      case 'URL':
        result.url = value;
        break;
      case 'NOTE':
        result.note = value;
        break;
      case 'PHOTO':
        result.hasPhoto = 'true';
        break;
    }
  }

  result.phones = phones;
  result.emails = emails;
  result.addresses = addresses;

  return result;
}

// ---------------------------------------------------------------------------
// 3. MeCard parser – parses MECARD:N:Last,First;...;;
// ---------------------------------------------------------------------------
export function parseMeCardPayload(payload: string): Record<string, string | null> {
  const result: Record<string, string | null> = {
    name: null,
    organization: null,
    phone: null,
    email: null,
    address: null,
    birthday: null,
    url: null,
    note: null,
  };

  if (!payload.toUpperCase().startsWith('MECARD:')) return result;

  const content = payload.slice(7).replace(/;;\s*$/, '');
  const parts = content.split(';');

  for (const part of parts) {
    const colonIdx = part.indexOf(':');
    if (colonIdx === -1) continue;
    const key = part.slice(0, colonIdx).toUpperCase();
    const value = part.slice(colonIdx + 1);

    switch (key) {
      case 'N':
        result.name = value.replaceAll(',', ' ');
        break;
      case 'ORG':
        result.organization = value;
        break;
      case 'TEL':
        result.phone = value;
        break;
      case 'EMAIL':
        result.email = value;
        break;
      case 'ADR':
        result.address = value.replaceAll(',', ', ');
        break;
      case 'BDAY':
        result.birthday = value;
        break;
      case 'URL':
        result.url = value;
        break;
      case 'NOTE':
        result.note = value;
        break;
    }
  }

  return result;
}

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

// ---------------------------------------------------------------------------
// 5. Phone (tel:) parser with country detection
// ---------------------------------------------------------------------------
export function parseTelPayload(payload: string): Record<string, string | null> {
  const result: Record<string, string | null> = {
    number: null,
    formatted: null,
    countryCode: null,
    country: null,
    countryFlag: null,
  };

  let number = payload.toLowerCase().startsWith('tel:') ? payload.slice(4) : payload;
  number = number.replaceAll(/[^+\d]/g, '');
  result.number = number;
  result.formatted = number;

  // Detect country by dialing code
  const countryCodes: Record<string, { name: string; flag: string }> = {
    '+1': { name: 'USA/Canada', flag: '🇺🇸' },
    '+44': { name: 'United Kingdom', flag: '🇬🇧' },
    '+61': { name: 'Australia', flag: '🇦🇺' },
    '+91': { name: 'India', flag: '🇮🇳' },
    '+86': { name: 'China', flag: '🇨🇳' },
    '+81': { name: 'Japan', flag: '🇯🇵' },
    '+49': { name: 'Germany', flag: '🇩🇪' },
    '+33': { name: 'France', flag: '🇫🇷' },
    '+39': { name: 'Italy', flag: '🇮🇹' },
    '+34': { name: 'Spain', flag: '🇪🇸' },
    '+55': { name: 'Brazil', flag: '🇧🇷' },
    '+52': { name: 'Mexico', flag: '🇲🇽' },
    '+82': { name: 'South Korea', flag: '🇰🇷' },
    '+7': { name: 'Russia', flag: '🇷🇺' },
    '+31': { name: 'Netherlands', flag: '🇳🇱' },
    '+46': { name: 'Sweden', flag: '🇸🇪' },
    '+41': { name: 'Switzerland', flag: '🇨🇭' },
    '+65': { name: 'Singapore', flag: '🇸🇬' },
    '+64': { name: 'New Zealand', flag: '🇳🇿' },
    '+353': { name: 'Ireland', flag: '🇮🇪' },
    '+972': { name: 'Israel', flag: '🇮🇱' },
    '+971': { name: 'UAE', flag: '🇦🇪' },
    '+966': { name: 'Saudi Arabia', flag: '🇸🇦' },
    '+27': { name: 'South Africa', flag: '🇿🇦' },
    '+62': { name: 'Indonesia', flag: '🇮🇩' },
    '+60': { name: 'Malaysia', flag: '🇲🇾' },
    '+63': { name: 'Philippines', flag: '🇵🇭' },
    '+66': { name: 'Thailand', flag: '🇹🇭' },
    '+84': { name: 'Vietnam', flag: '🇻🇳' },
  };

  if (number.startsWith('+')) {
    // Try to match longest prefix first
    for (const prefix of Object.keys(countryCodes).sort((a, b) => b.length - a.length)) {
      if (number.startsWith(prefix)) {
        result.countryCode = prefix;
        result.country = countryCodes[prefix].name;
        result.countryFlag = countryCodes[prefix].flag;
        break;
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// 6. SMS parser
// ---------------------------------------------------------------------------
export function parseSmsPayload(payload: string): Record<string, string | number | null> {
  const result: Record<string, string | number | null> = {
    number: null,
    body: null,
    charCount: null,
    segmentCount: null,
  };

  let content = payload;
  if (payload.toLowerCase().startsWith('sms:')) content = payload.slice(4);
  else if (payload.toLowerCase().startsWith('smsto:')) content = payload.slice(6);

  const [number, queryPart] = content.split('?');
  result.number = number;

  if (queryPart) {
    const params = new URLSearchParams(queryPart);
    result.body = params.get('body');
    if (result.body) {
      result.charCount = result.body.length;
      // SMS segments: 160 chars for GSM-7, 70 for Unicode
      const hasUnicode = /\P{ASCII}/u.test(result.body);
      const charsPerSegment = hasUnicode ? 70 : 160;
      result.segmentCount = Math.ceil(result.body.length / charsPerSegment);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// 7. Geo coordinate parser with DMS conversion
// ---------------------------------------------------------------------------
export function parseGeoPayload(payload: string): Record<string, string | number | null> {
  const result: Record<string, string | number | null> = {
    latitude: null,
    longitude: null,
    altitude: null,
    uncertainty: null,
    latDms: null,
    lonDms: null,
    latHemisphere: null,
    lonHemisphere: null,
    googleMapsUrl: null,
    appleMapsUrl: null,
    osmUrl: null,
  };

  const match = payload.match(/^geo:([\d.-]+),([\d.-]+)(?:,([\d.-]+))?(?:\?.*u=([\d.]+))?/i);
  if (!match) return result;

  const lat = Number.parseFloat(match[1]);
  const lon = Number.parseFloat(match[2]);
  result.latitude = lat;
  result.longitude = lon;
  result.altitude = match[3] ? Number.parseFloat(match[3]) : null;
  result.uncertainty = match[4] ? Number.parseFloat(match[4]) : null;

  // Determine hemispheres
  result.latHemisphere = lat >= 0 ? 'N' : 'S';
  result.lonHemisphere = lon >= 0 ? 'E' : 'W';

  // Convert to DMS
  const toDms = (decimal: number): string => {
    const abs = Math.abs(decimal);
    const deg = Math.floor(abs);
    const minFloat = (abs - deg) * 60;
    const min = Math.floor(minFloat);
    const sec = ((minFloat - min) * 60).toFixed(2);
    return `${deg}° ${min}' ${sec}"`;
  };

  result.latDms = `${toDms(lat)} ${result.latHemisphere}`;
  result.lonDms = `${toDms(lon)} ${result.lonHemisphere}`;

  // Generate map URLs
  result.googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
  result.appleMapsUrl = `https://maps.apple.com/?ll=${lat},${lon}`;
  result.osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=15`;

  return result;
}

// ---------------------------------------------------------------------------
// 8. Crypto address parser
// ---------------------------------------------------------------------------
export function parseCryptoPayload(payload: string): Record<string, string | null> {
  const result: Record<string, string | null> = {
    network: null,
    address: null,
    addressPreview: null,
    amount: null,
    label: null,
    message: null,
    explorerUrl: null,
    networkColor: null,
  };

  const lowerPayload = payload.toLowerCase();
  let network = 'Unknown';
  let address = payload;
  let queryString = '';

  if (lowerPayload.startsWith('bitcoin:')) {
    network = 'Bitcoin';
    result.networkColor = 'orange';
    const content = payload.slice(8);
    [address, queryString] = content.split('?');
    result.explorerUrl = `https://www.blockchain.com/btc/address/${address}`;
  } else if (lowerPayload.startsWith('ethereum:')) {
    network = 'Ethereum';
    result.networkColor = 'purple';
    const content = payload.slice(9);
    [address, queryString] = content.split('?');
    result.explorerUrl = `https://etherscan.io/address/${address}`;
  } else if (lowerPayload.startsWith('litecoin:')) {
    network = 'Litecoin';
    result.networkColor = 'gray';
    const content = payload.slice(9);
    [address, queryString] = content.split('?');
    result.explorerUrl = `https://blockchair.com/litecoin/address/${address}`;
  } else if (lowerPayload.startsWith('dogecoin:')) {
    network = 'Dogecoin';
    result.networkColor = 'yellow';
    const content = payload.slice(9);
    [address, queryString] = content.split('?');
    result.explorerUrl = `https://dogechain.info/address/${address}`;
  }

  result.network = network;
  result.address = address;
  result.addressPreview =
    address.length > 20 ? `${address.slice(0, 10)}...${address.slice(-10)}` : address;

  if (queryString) {
    const params = new URLSearchParams(queryString);
    result.amount = params.get('amount');
    result.label = params.get('label');
    result.message = params.get('message') || params.get('memo');
  }

  return result;
}

// ---------------------------------------------------------------------------
// 9. EPC/SEPA payment parser
// ---------------------------------------------------------------------------
export function parseEpcSepaPayload(payload: string): Record<string, string | null> {
  const result: Record<string, string | null> = {
    serviceTag: null,
    version: null,
    encoding: null,
    bic: null,
    beneficiaryName: null,
    iban: null,
    amount: null,
    currency: null,
    purposeCode: null,
    referenceType: null,
    reference: null,
    remittanceInfo: null,
    beneficiaryToOriginator: null,
  };

  const lines = payload.split('\n');
  if (lines.length < 4) return result;

  result.serviceTag = lines[0] || null; // Should be 'BCD'
  result.version = lines[1] || null;
  result.encoding = lines[2] || null;
  // Line 3 is identification code
  result.bic = lines[4] || null;
  result.beneficiaryName = lines[5] || null;
  result.iban = lines[6] || null;

  // Parse amount (format: EUR123.45)
  if (lines[7]) {
    const amountMatch = lines[7].match(/([A-Z]{3})([\d.]+)/);
    if (amountMatch) {
      result.currency = amountMatch[1];
      result.amount = amountMatch[2];
    }
  }

  result.purposeCode = lines[8] || null;
  result.referenceType = lines[9] || null;
  result.reference = lines[10] || null;
  result.remittanceInfo = lines[11] || null;
  result.beneficiaryToOriginator = lines[12] || null;

  // Format IBAN with spaces
  if (result.iban) {
    result.iban = result.iban.replaceAll(/(.{4})/g, '$1 ').trim();
  }

  return result;
}

// ---------------------------------------------------------------------------
// 10. UPI payment parser
// ---------------------------------------------------------------------------
export function parseUpiPayload(payload: string): Record<string, string | null> {
  const result: Record<string, string | null> = {
    vpa: null,
    payeeName: null,
    amount: null,
    currency: 'INR',
    transactionRef: null,
    transactionNote: null,
    merchantCode: null,
    minAmount: null,
    url: null,
  };

  if (!payload.toLowerCase().startsWith('upi://')) return result;

  try {
    const url = new URL(payload);
    result.vpa = url.searchParams.get('pa');
    result.payeeName = url.searchParams.get('pn');
    result.amount = url.searchParams.get('am');
    result.currency = url.searchParams.get('cu') || 'INR';
    result.transactionRef = url.searchParams.get('tr');
    result.transactionNote = url.searchParams.get('tn');
    result.merchantCode = url.searchParams.get('mc');
    result.minAmount = url.searchParams.get('mam');
    result.url = url.searchParams.get('url');
  } catch {
    // Invalid URL format
  }

  return result;
}

// ---------------------------------------------------------------------------
// 11. Calendar event parser
// ---------------------------------------------------------------------------
function formatICalDateTime(dt: string): string {
  try {
    const isAllDay = dt.length === 8;
    const year = Number.parseInt(dt.slice(0, 4), 10);
    const month = Number.parseInt(dt.slice(4, 6), 10) - 1;
    const day = Number.parseInt(dt.slice(6, 8), 10);
    let hours = 0,
      minutes = 0;

    if (!isAllDay && dt.includes('T')) {
      const timePart = dt.split('T')[1];
      hours = Number.parseInt(timePart.slice(0, 2), 10);
      minutes = Number.parseInt(timePart.slice(2, 4), 10);
    }

    const date = new Date(year, month, day, hours, minutes);

    if (isAllDay) {
      return date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return date.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dt;
  }
}

const ICAL_DAY_NAMES: Record<string, string> = {
  SU: 'Sunday',
  MO: 'Monday',
  TU: 'Tuesday',
  WE: 'Wednesday',
  TH: 'Thursday',
  FR: 'Friday',
  SA: 'Saturday',
};

function formatFrequencyText(freq: string, interval: number, byday?: string): string {
  if (freq === 'DAILY') return interval === 1 ? 'Daily' : `Every ${interval} days`;
  if (freq === 'WEEKLY') {
    if (byday) {
      const days = byday
        .split(',')
        .map((d) => ICAL_DAY_NAMES[d] || d)
        .join(', ');
      return interval === 1 ? `Weekly on ${days}` : `Every ${interval} weeks on ${days}`;
    }
    return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
  }
  if (freq === 'MONTHLY') return interval === 1 ? 'Monthly' : `Every ${interval} months`;
  if (freq === 'YEARLY') return interval === 1 ? 'Yearly' : `Every ${interval} years`;
  return freq || 'Recurring';
}

function formatRecurrenceRule(rrule: string): string {
  const parts: Record<string, string> = {};
  rrule
    .replaceAll('RRULE:', '')
    .split(';')
    .forEach((p) => {
      const [k, v] = p.split('=');
      if (k && v) parts[k] = v;
    });

  const interval = parts.INTERVAL ? Number.parseInt(parts.INTERVAL, 10) : 1;
  let text = formatFrequencyText(parts.FREQ, interval, parts.BYDAY);

  if (parts.UNTIL) text += ` until ${formatICalDateTime(parts.UNTIL)}`;
  if (parts.COUNT) text += ` (${parts.COUNT} times)`;

  return text;
}

function processCalendarLine(
  baseKey: string,
  keyPart: string,
  value: string,
  line: string,
  result: Record<string, string | boolean | null>
): boolean {
  switch (baseKey) {
    case 'SUMMARY':
      result.summary = value;
      return false;
    case 'DESCRIPTION':
      result.description = value.replaceAll('\\n', '\n').replaceAll('\\,', ',');
      return false;
    case 'LOCATION':
      result.location = value.replaceAll('\\,', ',');
      return false;
    case 'DTSTART': {
      result.startDate = value;
      result.startFormatted = formatICalDateTime(value.replaceAll('Z', ''));
      result.isAllDay = value.length === 8;
      const tzMatch = keyPart.match(/TZID=([^;:]+)/i);
      if (tzMatch) result.timezone = tzMatch[1];
      return false;
    }
    case 'DTEND':
      result.endDate = value;
      result.endFormatted = formatICalDateTime(value.replaceAll('Z', ''));
      return false;
    case 'DURATION':
      result.duration = value;
      return false;
    case 'ORGANIZER': {
      const cnMatch = value.match(/CN=([^:;]+)/i) || keyPart.match(/CN=([^:;]+)/i);
      result.organizer = cnMatch ? cnMatch[1] : value.replaceAll('mailto:', '');
      return false;
    }
    case 'ATTENDEE':
      return true;
    case 'RRULE':
      result.recurrence = value;
      result.recurrenceFormatted = formatRecurrenceRule(line);
      return false;
    case 'VALARM':
    case 'TRIGGER':
      if (value) result.alarm = value;
      return false;
    default:
      return false;
  }
}

export function parseCalendarPayload(payload: string): Record<string, string | boolean | null> {
  const result: Record<string, string | boolean | null> = {
    summary: null,
    description: null,
    location: null,
    startDate: null,
    startFormatted: null,
    endDate: null,
    endFormatted: null,
    duration: null,
    organizer: null,
    attendeesCount: null,
    recurrence: null,
    recurrenceFormatted: null,
    isAllDay: false,
    timezone: null,
    alarm: null,
  };

  if (
    !(
      payload.toUpperCase().includes('BEGIN:VCALENDAR') ||
      payload.toUpperCase().includes('BEGIN:VEVENT')
    )
  ) {
    return result;
  }

  const lines = payload.split(/\r?\n/);
  let attendeesCount = 0;

  let i = 0;
  while (i < lines.length) {
    let line = lines[i];
    while (i + 1 < lines.length && /^[ \t]/.test(lines[i + 1])) {
      i++;
      line += lines[i].slice(1);
    }
    i++;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const keyPart = line.slice(0, colonIdx).toUpperCase();
    const value = line.slice(colonIdx + 1);
    const baseKey = keyPart.split(';')[0];

    if (processCalendarLine(baseKey, keyPart, value, line, result)) {
      attendeesCount++;
    }
  }

  result.attendeesCount = attendeesCount > 0 ? String(attendeesCount) : null;

  return result;
}

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

// ---------------------------------------------------------------------------
// 13. URL parser with comprehensive breakdown
// ---------------------------------------------------------------------------
export interface UrlParseResult {
  full: string;
  protocol: string | null;
  hostname: string | null;
  port: string | null;
  path: string | null;
  queryString: string | null;
  fragment: string | null;
  isSecure: string | null;
  isShortened: string | null;
  shortenerService: string | null;
  params: Array<{ key: string; value: string }>;
  urlLength: string;
  hasPercentEncoding: string | null;
}

export function parseUrlPayload(payload: string): UrlParseResult {
  const result: UrlParseResult = {
    full: payload,
    protocol: null,
    hostname: null,
    port: null,
    path: null,
    queryString: null,
    fragment: null,
    isSecure: null,
    isShortened: null,
    shortenerService: null,
    params: [],
    urlLength: String(payload.length),
    hasPercentEncoding: /%[0-9A-Fa-f]{2}/.test(payload) ? 'true' : null,
  };

  try {
    const url = new URL(payload);
    result.protocol = url.protocol.replaceAll(':', '');
    result.hostname = url.hostname;
    result.port = url.port || null;
    result.path = url.pathname === '/' ? null : url.pathname;
    result.queryString = url.search || null;
    result.fragment = url.hash ? url.hash.slice(1) : null;
    result.isSecure = url.protocol === 'https:' ? 'true' : 'false';

    // Check if shortened URL
    const shorteners = [
      'bit.ly',
      't.co',
      'goo.gl',
      'tinyurl.com',
      'ow.ly',
      'is.gd',
      'buff.ly',
      'adf.ly',
      'j.mp',
      'rb.gy',
      'cutt.ly',
      'shorturl.at',
    ];
    for (const shortener of shorteners) {
      if (url.hostname.includes(shortener)) {
        result.isShortened = 'true';
        result.shortenerService = shortener;
        break;
      }
    }

    // Parse all query parameters
    const params: Array<{ key: string; value: string }> = [];
    url.searchParams.forEach((value, key) => {
      params.push({ key, value: decodeURIComponent(value) });
    });
    result.params = params;
  } catch {
    // Not a valid URL
  }

  return result;
}

// ---------------------------------------------------------------------------
// 14. Plain text analyzer
// ---------------------------------------------------------------------------
export function analyzePlainText(payload: string): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {
    charCount: payload.length,
    wordCount: payload.trim().split(/\s+/).filter(Boolean).length,
    lineCount: payload.split(/\r?\n/).length,
    hasSpecialChars: /[^a-zA-Z0-9\s]/.test(payload),
    hasNonAscii: /\P{ASCII}/u.test(payload),
    hasEmoji: /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u.test(payload),
    isAllNumeric: /^\d+$/.test(payload),
    isAllAlphanumeric: /^[0-9A-Z $%*+\-./:]+$/i.test(payload),
    encodingRecommendation: 'Byte mode',
    preview: payload.length > 200 ? `${payload.slice(0, 200)}...` : payload,
  };

  if (result.isAllNumeric) {
    result.encodingRecommendation = 'Numeric mode (most efficient)';
  } else if (result.isAllAlphanumeric && !result.hasNonAscii) {
    result.encodingRecommendation = 'Alphanumeric mode (efficient)';
  } else if (result.hasNonAscii) {
    result.encodingRecommendation = 'Byte mode (UTF-8 required)';
  }

  return result;
}
