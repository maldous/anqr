import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// ========== enterprise.ts ==========

describe('payload-generators enterprise', () => {
  describe('generateGS1DigitalLink', () => {
    it('generates basic GS1 link with just GTIN', async () => {
      const { generateGS1DigitalLink } =
        await import('../../src/modules/payload-generators/enterprise');
      const result = generateGS1DigitalLink({ gtin: '01234567890128' });
      expect(result).toBe('https://id.gs1.org/01/01234567890128');
    });

    it('includes lot, serial, and expiry', async () => {
      const { generateGS1DigitalLink } =
        await import('../../src/modules/payload-generators/enterprise');
      const result = generateGS1DigitalLink({
        gtin: '01234567890128',
        lot: 'LOT123',
        ser: 'SER456',
        expiry: '250101',
      });
      expect(result).toBe('https://id.gs1.org/01/01234567890128/10/LOT123/21/SER456/17/250101');
    });

    it('uses custom base URL', async () => {
      const { generateGS1DigitalLink } =
        await import('../../src/modules/payload-generators/enterprise');
      const result = generateGS1DigitalLink({
        gtin: '01234567890128',
        baseUrl: 'https://my.resolver.com',
      });
      expect(result).toBe('https://my.resolver.com/01/01234567890128');
    });

    it('includes only provided path segments', async () => {
      const { generateGS1DigitalLink } =
        await import('../../src/modules/payload-generators/enterprise');
      const result = generateGS1DigitalLink({
        gtin: '01234567890128',
        lot: 'ABC',
      });
      expect(result).toBe('https://id.gs1.org/01/01234567890128/10/ABC');
    });
  });

  describe('generateOTPAuth', () => {
    it('generates basic TOTP URI', async () => {
      const { generateOTPAuth } = await import('../../src/modules/payload-generators/enterprise');
      const result = generateOTPAuth({
        type: 'totp',
        secret: 'JBSWY3DPEHPK3PXP',
        account: 'user@example.com',
      });
      expect(result).toContain('otpauth://totp/');
      expect(result).toContain('secret=JBSWY3DPEHPK3PXP');
      expect(result).toContain('user%40example.com');
    });

    it('includes issuer in label and params', async () => {
      const { generateOTPAuth } = await import('../../src/modules/payload-generators/enterprise');
      const result = generateOTPAuth({
        type: 'totp',
        secret: 'SECRET',
        issuer: 'MyApp',
        account: 'user',
      });
      expect(result).toContain('otpauth://totp/MyApp:user');
      expect(result).toContain('issuer=MyApp');
    });

    it('handles HOTP with counter', async () => {
      const { generateOTPAuth } = await import('../../src/modules/payload-generators/enterprise');
      const result = generateOTPAuth({
        type: 'hotp',
        secret: 'SECRET',
        counter: 5,
      });
      expect(result).toContain('otpauth://hotp/');
      expect(result).toContain('counter=5');
    });

    it('includes non-default algorithm', async () => {
      const { generateOTPAuth } = await import('../../src/modules/payload-generators/enterprise');
      const result = generateOTPAuth({
        type: 'totp',
        secret: 'SECRET',
        algorithm: 'SHA256',
      });
      expect(result).toContain('algorithm=SHA256');
    });

    it('excludes default SHA1 algorithm', async () => {
      const { generateOTPAuth } = await import('../../src/modules/payload-generators/enterprise');
      const result = generateOTPAuth({
        type: 'totp',
        secret: 'SECRET',
        algorithm: 'SHA1',
      });
      expect(result).not.toContain('algorithm=');
    });

    it('includes non-default digits', async () => {
      const { generateOTPAuth } = await import('../../src/modules/payload-generators/enterprise');
      const result = generateOTPAuth({
        type: 'totp',
        secret: 'SECRET',
        digits: 8,
      });
      expect(result).toContain('digits=8');
    });

    it('excludes default 6 digits', async () => {
      const { generateOTPAuth } = await import('../../src/modules/payload-generators/enterprise');
      const result = generateOTPAuth({
        type: 'totp',
        secret: 'SECRET',
        digits: 6,
      });
      expect(result).not.toContain('digits=');
    });

    it('includes non-default period for TOTP', async () => {
      const { generateOTPAuth } = await import('../../src/modules/payload-generators/enterprise');
      const result = generateOTPAuth({
        type: 'totp',
        secret: 'SECRET',
        period: 60,
      });
      expect(result).toContain('period=60');
    });

    it('excludes default 30s period', async () => {
      const { generateOTPAuth } = await import('../../src/modules/payload-generators/enterprise');
      const result = generateOTPAuth({
        type: 'totp',
        secret: 'SECRET',
        period: 30,
      });
      expect(result).not.toContain('period=');
    });

    it('uses default type and label', async () => {
      const { generateOTPAuth } = await import('../../src/modules/payload-generators/enterprise');
      const result = generateOTPAuth({ type: 'totp', secret: 'SECRET' });
      expect(result).toContain('otpauth://totp/user');
    });
  });
});

// ========== social.ts ==========

describe('payload-generators social', () => {
  describe('generateSocialProfile', () => {
    it('generates Twitter link', async () => {
      const { generateSocialProfile } = await import('../../src/modules/payload-generators/social');
      expect(generateSocialProfile('twitter', 'john')).toBe('https://twitter.com/john');
    });

    it('generates X link', async () => {
      const { generateSocialProfile } = await import('../../src/modules/payload-generators/social');
      expect(generateSocialProfile('x', 'john')).toBe('https://x.com/john');
    });

    it('generates Instagram link', async () => {
      const { generateSocialProfile } = await import('../../src/modules/payload-generators/social');
      expect(generateSocialProfile('instagram', 'john')).toBe('https://instagram.com/john');
    });

    it('generates Facebook link', async () => {
      const { generateSocialProfile } = await import('../../src/modules/payload-generators/social');
      expect(generateSocialProfile('facebook', 'john')).toBe('https://facebook.com/john');
    });

    it('generates LinkedIn link', async () => {
      const { generateSocialProfile } = await import('../../src/modules/payload-generators/social');
      expect(generateSocialProfile('linkedin', 'john')).toBe('https://linkedin.com/in/john');
    });

    it('generates GitHub link', async () => {
      const { generateSocialProfile } = await import('../../src/modules/payload-generators/social');
      expect(generateSocialProfile('github', 'john')).toBe('https://github.com/john');
    });

    it('generates YouTube link with @', async () => {
      const { generateSocialProfile } = await import('../../src/modules/payload-generators/social');
      expect(generateSocialProfile('youtube', 'john')).toBe('https://youtube.com/@john');
    });

    it('generates TikTok link with @', async () => {
      const { generateSocialProfile } = await import('../../src/modules/payload-generators/social');
      expect(generateSocialProfile('tiktok', 'john')).toBe('https://tiktok.com/@john');
    });

    it('generates Snapchat link', async () => {
      const { generateSocialProfile } = await import('../../src/modules/payload-generators/social');
      expect(generateSocialProfile('snapchat', 'john')).toBe('https://snapchat.com/add/john');
    });

    it('generates Pinterest link', async () => {
      const { generateSocialProfile } = await import('../../src/modules/payload-generators/social');
      expect(generateSocialProfile('pinterest', 'john')).toBe('https://pinterest.com/john');
    });

    it('generates Reddit link', async () => {
      const { generateSocialProfile } = await import('../../src/modules/payload-generators/social');
      expect(generateSocialProfile('reddit', 'john')).toBe('https://reddit.com/u/john');
    });

    it('generates Discord link', async () => {
      const { generateSocialProfile } = await import('../../src/modules/payload-generators/social');
      expect(generateSocialProfile('discord', 'invite123')).toBe('https://discord.gg/invite123');
    });

    it('generates Twitch link', async () => {
      const { generateSocialProfile } = await import('../../src/modules/payload-generators/social');
      expect(generateSocialProfile('twitch', 'streamer')).toBe('https://twitch.tv/streamer');
    });

    it('is case-insensitive', async () => {
      const { generateSocialProfile } = await import('../../src/modules/payload-generators/social');
      expect(generateSocialProfile('Twitter', 'john')).toBe('https://twitter.com/john');
    });

    it('falls back to generic URL for unknown platform', async () => {
      const { generateSocialProfile } = await import('../../src/modules/payload-generators/social');
      expect(generateSocialProfile('mastodon', 'john')).toBe('https://mastodon.com/john');
    });
  });

  describe('generateMessagingLink', () => {
    it('generates WhatsApp link', async () => {
      const { generateMessagingLink } = await import('../../src/modules/payload-generators/social');
      expect(generateMessagingLink('whatsapp', '+61400123456')).toBe('https://wa.me/61400123456');
    });

    it('generates WhatsApp link with message', async () => {
      const { generateMessagingLink } = await import('../../src/modules/payload-generators/social');
      const result = generateMessagingLink('whatsapp', '+61400123456', 'Hello!');
      expect(result).toBe('https://wa.me/61400123456?text=Hello!');
    });

    it('generates Telegram link', async () => {
      const { generateMessagingLink } = await import('../../src/modules/payload-generators/social');
      expect(generateMessagingLink('telegram', 'username')).toBe('https://t.me/username');
    });

    it('generates Telegram link with message', async () => {
      const { generateMessagingLink } = await import('../../src/modules/payload-generators/social');
      const result = generateMessagingLink('telegram', 'user', 'Hi');
      expect(result).toContain('?text=Hi');
    });

    it('generates Signal link', async () => {
      const { generateMessagingLink } = await import('../../src/modules/payload-generators/social');
      expect(generateMessagingLink('signal', '+1234')).toBe('https://signal.me/#p/+1234');
    });

    it('generates Viber link', async () => {
      const { generateMessagingLink } = await import('../../src/modules/payload-generators/social');
      expect(generateMessagingLink('viber', '+61400123456')).toBe(
        'viber://chat?number=61400123456'
      );
    });

    it('generates Line link', async () => {
      const { generateMessagingLink } = await import('../../src/modules/payload-generators/social');
      expect(generateMessagingLink('line', 'userId')).toBe('https://line.me/ti/p/userId');
    });

    it('generates Skype link', async () => {
      const { generateMessagingLink } = await import('../../src/modules/payload-generators/social');
      expect(generateMessagingLink('skype', 'user.name')).toBe('skype:user.name?chat');
    });

    it('falls back to identifier for unknown platform', async () => {
      const { generateMessagingLink } = await import('../../src/modules/payload-generators/social');
      expect(generateMessagingLink('unknown', 'id123')).toBe('id123');
    });

    it('is case-insensitive', async () => {
      const { generateMessagingLink } = await import('../../src/modules/payload-generators/social');
      expect(generateMessagingLink('WhatsApp', '+1234')).toBe('https://wa.me/1234');
    });
  });

  describe('generateAppDeepLink', () => {
    it('generates Android intent URI', async () => {
      const { generateAppDeepLink } = await import('../../src/modules/payload-generators/social');
      const result = generateAppDeepLink('android', {
        scheme: 'myapp',
        host: 'example.com',
        path: '/page',
        package: 'com.example.app',
        fallbackUrl: 'https://example.com',
      });
      expect(result).toContain('intent://example.com/page#Intent;');
      expect(result).toContain('scheme=myapp;');
      expect(result).toContain('package=com.example.app;');
      expect(result).toContain('S.browser_fallback_url=');
      expect(result).toContain('end');
    });

    it('generates Android intent without optional fields', async () => {
      const { generateAppDeepLink } = await import('../../src/modules/payload-generators/social');
      const result = generateAppDeepLink('android', { package: 'com.example.app' });
      expect(result).toContain('intent://');
      expect(result).toContain('package=com.example.app;');
      expect(result).not.toContain('scheme=');
    });

    it('generates iOS custom scheme link', async () => {
      const { generateAppDeepLink } = await import('../../src/modules/payload-generators/social');
      const result = generateAppDeepLink('ios', {
        scheme: 'myapp',
        host: 'example.com',
        path: '/page',
      });
      expect(result).toBe('myapp://example.com/page');
    });

    it('generates universal link (https)', async () => {
      const { generateAppDeepLink } = await import('../../src/modules/payload-generators/social');
      const result = generateAppDeepLink('universal', {
        host: 'example.com',
        path: '/deep',
      });
      expect(result).toBe('https://example.com/deep');
    });

    it('generates scheme link for universal with scheme', async () => {
      const { generateAppDeepLink } = await import('../../src/modules/payload-generators/social');
      const result = generateAppDeepLink('universal', {
        scheme: 'myapp',
        host: 'host',
      });
      expect(result).toBe('myapp://host');
    });

    it('handles missing host and path', async () => {
      const { generateAppDeepLink } = await import('../../src/modules/payload-generators/social');
      const result = generateAppDeepLink('ios', { scheme: 'myapp' });
      expect(result).toBe('myapp://');
    });
  });
});

// ========== contacts.ts ==========

describe('payload-generators contacts', () => {
  describe('generateMeCard', () => {
    it('generates basic MeCard', async () => {
      const { generateMeCard } = await import('../../src/modules/payload-generators/contacts');
      const result = generateMeCard({ n: 'John Doe', tel: '+1234', email: 'john@example.com' });
      expect(result).toContain('MECARD:');
      expect(result).toContain('N:John Doe;');
      expect(result).toContain('TEL:+1234;');
      expect(result).toContain('EMAIL:john@example.com;');
    });

    it('includes all optional fields', async () => {
      const { generateMeCard } = await import('../../src/modules/payload-generators/contacts');
      const result = generateMeCard({
        n: 'Jane',
        nickname: 'JJ',
        org: 'ACME',
        tel: '+999',
        email: 'j@a.com',
        url: 'https://jane.com',
        adr: '123 St',
        bday: '1990-01-15',
        note: 'A note',
      });
      expect(result).toContain('NICKNAME:JJ;');
      expect(result).toContain('ORG:ACME;');
      expect(result).toContain('URL:https://jane.com;');
      expect(result).toContain('ADR:123 St;');
      expect(result).toContain('BDAY:19900115;'); // Dashes stripped
      expect(result).toContain('NOTE:A note;');
    });

    it('escapes special characters', async () => {
      const { generateMeCard } = await import('../../src/modules/payload-generators/contacts');
      const result = generateMeCard({ n: 'John;Doe' });
      expect(result).toContain('N:John\\;Doe;');
    });

    it('handles empty params', async () => {
      const { generateMeCard } = await import('../../src/modules/payload-generators/contacts');
      const result = generateMeCard({});
      expect(result).toBe('MECARD:;');
    });
  });

  describe('generateBizCard', () => {
    it('generates basic BizCard', async () => {
      const { generateBizCard } = await import('../../src/modules/payload-generators/contacts');
      const result = generateBizCard({
        firstName: 'John',
        lastName: 'Doe',
        title: 'CEO',
        company: 'ACME',
        phone: '+1234',
        email: 'john@acme.com',
        address: '123 Main St',
      });
      expect(result).toContain('BIZCARD:');
      expect(result).toContain('N:John');
      expect(result).toContain('X:Doe');
      expect(result).toContain('T:CEO');
      expect(result).toContain('C:ACME');
      expect(result).toContain('B:+1234');
      expect(result).toContain('E:john@acme.com');
      expect(result).toContain('A:123 Main St');
    });

    it('handles partial fields', async () => {
      const { generateBizCard } = await import('../../src/modules/payload-generators/contacts');
      const result = generateBizCard({ firstName: 'Jane', email: 'j@e.com' });
      expect(result).toContain('N:Jane');
      expect(result).toContain('E:j@e.com');
      expect(result).not.toContain('X:');
      expect(result).not.toContain('T:');
    });

    it('handles empty params', async () => {
      const { generateBizCard } = await import('../../src/modules/payload-generators/contacts');
      const result = generateBizCard({});
      expect(result).toContain('BIZCARD:');
    });
  });

  describe('generateVCard extra cases', () => {
    it('handles vCard 4.0 format', async () => {
      const { generateVCard } = await import('../../src/modules/payload-generators/contacts');
      const result = generateVCard({
        version: '4.0',
        fn: 'John Doe',
        tel: ['+1234'],
        email: ['john@ex.com'],
        url: 'https://john.dev',
        photo: 'https://photo.com/img.jpg',
      });
      expect(result).toContain('VERSION:4.0');
      expect(result).toContain('TEL;TYPE=voice:+1234');
      expect(result).toContain('EMAIL:john@ex.com');
      expect(result).toContain('PHOTO:https://photo.com/img.jpg');
    });

    it('handles vCard 2.1 format', async () => {
      const { generateVCard } = await import('../../src/modules/payload-generators/contacts');
      const result = generateVCard({
        version: '2.1',
        fn: 'John',
        tel: ['+1234'],
        email: ['j@e.com'],
        photo: 'https://photo.com/x.jpg',
      });
      expect(result).toContain('VERSION:2.1');
      expect(result).toContain('TEL;CELL:+1234');
      expect(result).toContain('EMAIL;INTERNET:j@e.com');
      expect(result).toContain('PHOTO;VALUE=URI:');
    });

    it('handles single-name FN', async () => {
      const { generateVCard } = await import('../../src/modules/payload-generators/contacts');
      const result = generateVCard({ version: '3.0', fn: 'Madonna' });
      expect(result).toContain('N:;Madonna;;;');
    });

    it('includes optional fields', async () => {
      const { generateVCard } = await import('../../src/modules/payload-generators/contacts');
      const result = generateVCard({
        version: '3.0',
        fn: 'J D',
        n: 'Doe;John',
        org: 'Corp',
        title: 'Eng',
        role: 'Dev',
        adr: [';;123 St;City;State;12345;US'],
        bday: '19900101',
        note: 'Test note',
        impp: 'xmpp:user@server',
        uid: 'uid-123',
      });
      expect(result).toContain('N:Doe\\;John');
      expect(result).toContain('ORG:Corp');
      expect(result).toContain('TITLE:Eng');
      expect(result).toContain('ROLE:Dev');
      expect(result).toContain('ADR:');
      expect(result).toContain('BDAY:19900101');
      expect(result).toContain('NOTE:Test note');
      expect(result).toContain('IMPP:xmpp:user@server');
      expect(result).toContain('UID:uid-123');
    });

    it('skips invalid tel/email/url', async () => {
      const { generateVCard } = await import('../../src/modules/payload-generators/contacts');
      const result = generateVCard({
        version: '3.0',
        fn: 'Test',
        tel: ['ab'], // Invalid: < 3 digits
        email: ['noatsign'], // Invalid: no @
        url: 'not-a-url', // Invalid: no http
      });
      expect(result).not.toContain('TEL:');
      expect(result).not.toContain('EMAIL');
      expect(result).not.toContain('URL:');
    });
  });
});

// ========== calendar.ts ==========

describe('payload-generators calendar', () => {
  describe('generateEvent', () => {
    it('generates basic event', async () => {
      const { generateEvent } = await import('../../src/modules/payload-generators/calendar');
      const result = generateEvent({
        summary: 'Meeting',
        start: '2025-01-15T10:00:00Z',
        end: '2025-01-15T11:00:00Z',
      });
      expect(result).toContain('BEGIN:VCALENDAR');
      expect(result).toContain('BEGIN:VEVENT');
      expect(result).toContain('SUMMARY:Meeting');
      expect(result).toContain('DTSTART:20250115T100000Z');
      expect(result).toContain('DTEND:20250115T110000Z');
      expect(result).toContain('END:VEVENT');
      expect(result).toContain('END:VCALENDAR');
    });

    it('includes location and description', async () => {
      const { generateEvent } = await import('../../src/modules/payload-generators/calendar');
      const result = generateEvent({
        summary: 'Lunch',
        location: 'Cafe',
        description: 'Team lunch',
        start: '2025-06-01T12:00:00Z',
      });
      expect(result).toContain('LOCATION:Cafe');
      expect(result).toContain('DESCRIPTION:Team lunch');
    });

    it('truncates long summary', async () => {
      const { generateEvent } = await import('../../src/modules/payload-generators/calendar');
      const longSummary = 'A'.repeat(60);
      const result = generateEvent({ summary: longSummary });
      expect(result).toContain('SUMMARY:' + 'A'.repeat(47) + '...');
    });

    it('truncates long description', async () => {
      const { generateEvent } = await import('../../src/modules/payload-generators/calendar');
      const longDesc = 'B'.repeat(110);
      const result = generateEvent({ description: longDesc });
      expect(result).toContain('DESCRIPTION:' + 'B'.repeat(97) + '...');
    });

    it('truncates long location', async () => {
      const { generateEvent } = await import('../../src/modules/payload-generators/calendar');
      const longLoc = 'C'.repeat(60);
      const result = generateEvent({ location: longLoc });
      expect(result).toContain('LOCATION:' + 'C'.repeat(47) + '...');
    });

    it('includes rrule', async () => {
      const { generateEvent } = await import('../../src/modules/payload-generators/calendar');
      const result = generateEvent({ rrule: 'FREQ=WEEKLY;COUNT=10' });
      expect(result).toContain('RRULE:FREQ=WEEKLY;COUNT=10');
    });

    it('skips empty fields', async () => {
      const { generateEvent } = await import('../../src/modules/payload-generators/calendar');
      const result = generateEvent({ summary: '', location: '  ', description: '' });
      expect(result).not.toContain('SUMMARY:');
      expect(result).not.toContain('LOCATION:');
      expect(result).not.toContain('DESCRIPTION:');
    });

    it('uses CRLF line endings', async () => {
      const { generateEvent } = await import('../../src/modules/payload-generators/calendar');
      const result = generateEvent({ summary: 'Test' });
      expect(result).toContain('\r\n');
    });
  });

  describe('generateCalendarSubscription', () => {
    it('converts http to webcal', async () => {
      const { generateCalendarSubscription } =
        await import('../../src/modules/payload-generators/calendar');
      expect(generateCalendarSubscription('http://example.com/cal.ics')).toBe(
        'webcal://example.com/cal.ics'
      );
    });

    it('converts https to webcal', async () => {
      const { generateCalendarSubscription } =
        await import('../../src/modules/payload-generators/calendar');
      expect(generateCalendarSubscription('https://example.com/cal.ics')).toBe(
        'webcal://example.com/cal.ics'
      );
    });

    it('prepends webcal:// for bare URLs', async () => {
      const { generateCalendarSubscription } =
        await import('../../src/modules/payload-generators/calendar');
      expect(generateCalendarSubscription('example.com/cal.ics')).toBe(
        'webcal://example.com/cal.ics'
      );
    });
  });
});

// ========== utils.ts ==========

describe('payload-generators utils', () => {
  describe('isValidPhone', () => {
    it('accepts valid phone numbers', async () => {
      const { isValidPhone } = await import('../../src/modules/payload-generators/utils');
      expect(isValidPhone('+61400123456')).toBe(true);
      expect(isValidPhone('123')).toBe(true);
    });

    it('rejects too few digits', async () => {
      const { isValidPhone } = await import('../../src/modules/payload-generators/utils');
      expect(isValidPhone('12')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('accepts valid emails', async () => {
      const { isValidEmail } = await import('../../src/modules/payload-generators/utils');
      expect(isValidEmail('a@b')).toBe(true);
      expect(isValidEmail('user@example.com')).toBe(true);
    });

    it('rejects invalid emails', async () => {
      const { isValidEmail } = await import('../../src/modules/payload-generators/utils');
      expect(isValidEmail('nope')).toBe(false);
      expect(isValidEmail('@')).toBe(false);
      expect(isValidEmail('a')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('accepts http/https URLs', async () => {
      const { isValidUrl } = await import('../../src/modules/payload-generators/utils');
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    it('rejects non-http URLs', async () => {
      const { isValidUrl } = await import('../../src/modules/payload-generators/utils');
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
    });
  });

  describe('isValidUrlWithScheme', () => {
    it('accepts custom schemes', async () => {
      const { isValidUrlWithScheme } = await import('../../src/modules/payload-generators/utils');
      expect(isValidUrlWithScheme('webcal://example.com')).toBe(true);
      expect(isValidUrlWithScheme('myapp://deep/link')).toBe(true);
    });

    it('rejects invalid URLs', async () => {
      const { isValidUrlWithScheme } = await import('../../src/modules/payload-generators/utils');
      expect(isValidUrlWithScheme('nope')).toBe(false);
    });
  });

  describe('isNonEmpty', () => {
    it('returns true for non-empty strings', async () => {
      const { isNonEmpty } = await import('../../src/modules/payload-generators/utils');
      expect(isNonEmpty('hello')).toBe(true);
    });

    it('returns false for empty/whitespace strings', async () => {
      const { isNonEmpty } = await import('../../src/modules/payload-generators/utils');
      expect(isNonEmpty('')).toBe(false);
      expect(isNonEmpty('   ')).toBe(false);
    });
  });

  describe('isValidLatitude', () => {
    it('accepts valid latitudes', async () => {
      const { isValidLatitude } = await import('../../src/modules/payload-generators/utils');
      expect(isValidLatitude(0)).toBe(true);
      expect(isValidLatitude(-90)).toBe(true);
      expect(isValidLatitude(90)).toBe(true);
    });

    it('rejects invalid latitudes', async () => {
      const { isValidLatitude } = await import('../../src/modules/payload-generators/utils');
      expect(isValidLatitude(-91)).toBe(false);
      expect(isValidLatitude(91)).toBe(false);
      expect(isValidLatitude(NaN)).toBe(false);
    });
  });

  describe('isValidLongitude', () => {
    it('accepts valid longitudes', async () => {
      const { isValidLongitude } = await import('../../src/modules/payload-generators/utils');
      expect(isValidLongitude(0)).toBe(true);
      expect(isValidLongitude(-180)).toBe(true);
      expect(isValidLongitude(180)).toBe(true);
    });

    it('rejects invalid longitudes', async () => {
      const { isValidLongitude } = await import('../../src/modules/payload-generators/utils');
      expect(isValidLongitude(-181)).toBe(false);
      expect(isValidLongitude(181)).toBe(false);
    });
  });

  describe('isValidSSID', () => {
    it('accepts valid SSIDs', async () => {
      const { isValidSSID } = await import('../../src/modules/payload-generators/utils');
      expect(isValidSSID('A')).toBe(true);
      expect(isValidSSID('A'.repeat(32))).toBe(true);
    });

    it('rejects invalid SSIDs', async () => {
      const { isValidSSID } = await import('../../src/modules/payload-generators/utils');
      expect(isValidSSID('')).toBe(false);
      expect(isValidSSID('A'.repeat(33))).toBe(false);
    });
  });

  describe('isValidIBAN', () => {
    it('accepts valid IBANs', async () => {
      const { isValidIBAN } = await import('../../src/modules/payload-generators/utils');
      expect(isValidIBAN('DE89370400440532013000')).toBe(true);
      expect(isValidIBAN('GB29 NWBK 6016 1331 9268 19')).toBe(true);
    });

    it('rejects invalid IBANs', async () => {
      const { isValidIBAN } = await import('../../src/modules/payload-generators/utils');
      expect(isValidIBAN('123')).toBe(false);
      expect(isValidIBAN('XX')).toBe(false);
    });
  });

  describe('isValidCryptoAddress', () => {
    it('validates Bitcoin addresses', async () => {
      const { isValidCryptoAddress } = await import('../../src/modules/payload-generators/utils');
      expect(isValidCryptoAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'bitcoin')).toBe(true);
      expect(isValidCryptoAddress('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', 'bitcoin')).toBe(
        true
      );
      expect(isValidCryptoAddress('short', 'bitcoin')).toBe(false);
    });

    it('validates Ethereum addresses', async () => {
      const { isValidCryptoAddress } = await import('../../src/modules/payload-generators/utils');
      expect(isValidCryptoAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18', 'ethereum')).toBe(
        true
      );
      expect(isValidCryptoAddress('not-eth', 'ethereum')).toBe(false);
    });

    it('validates Litecoin addresses', async () => {
      const { isValidCryptoAddress } = await import('../../src/modules/payload-generators/utils');
      expect(isValidCryptoAddress('LQN6oj8RNZoBzZz5Ywr6PfoGbPr3jwbeNb', 'litecoin')).toBe(true);
    });

    it('uses generic validation for unknown types', async () => {
      const { isValidCryptoAddress } = await import('../../src/modules/payload-generators/utils');
      expect(isValidCryptoAddress('ABCDEFGHIJKLMNOPQRST', 'solana')).toBe(true);
      expect(isValidCryptoAddress('short', 'solana')).toBe(false);
    });

    it('rejects empty addresses', async () => {
      const { isValidCryptoAddress } = await import('../../src/modules/payload-generators/utils');
      expect(isValidCryptoAddress('', 'bitcoin')).toBe(false);
    });
  });

  describe('isValidGTIN', () => {
    it('accepts valid GTINs', async () => {
      const { isValidGTIN } = await import('../../src/modules/payload-generators/utils');
      expect(isValidGTIN('12345678')).toBe(true); // GTIN-8
      expect(isValidGTIN('012345678901')).toBe(true); // GTIN-12
      expect(isValidGTIN('0123456789012')).toBe(true); // GTIN-13
      expect(isValidGTIN('01234567890123')).toBe(true); // GTIN-14
    });

    it('rejects invalid GTINs', async () => {
      const { isValidGTIN } = await import('../../src/modules/payload-generators/utils');
      expect(isValidGTIN('1234567')).toBe(false); // Too short
      expect(isValidGTIN('123456789')).toBe(false); // 9 digits
      expect(isValidGTIN('abcdefgh')).toBe(false);
    });
  });

  describe('isValidCountryCode', () => {
    it('accepts valid country codes', async () => {
      const { isValidCountryCode } = await import('../../src/modules/payload-generators/utils');
      expect(isValidCountryCode('AU')).toBe(true);
      expect(isValidCountryCode('us')).toBe(true);
    });

    it('rejects invalid country codes', async () => {
      const { isValidCountryCode } = await import('../../src/modules/payload-generators/utils');
      expect(isValidCountryCode('A')).toBe(false);
      expect(isValidCountryCode('ABC')).toBe(false);
      expect(isValidCountryCode('12')).toBe(false);
    });
  });

  describe('isValidUpiVpa', () => {
    it('accepts valid VPAs', async () => {
      const { isValidUpiVpa } = await import('../../src/modules/payload-generators/utils');
      expect(isValidUpiVpa('user@upi')).toBe(true);
      expect(isValidUpiVpa('merchant.name@bank')).toBe(true);
    });

    it('rejects invalid VPAs', async () => {
      const { isValidUpiVpa } = await import('../../src/modules/payload-generators/utils');
      expect(isValidUpiVpa('nope')).toBe(false);
      expect(isValidUpiVpa('@bank')).toBe(false);
    });
  });

  describe('isValidEthereumAddress', () => {
    it('accepts valid addresses', async () => {
      const { isValidEthereumAddress } = await import('../../src/modules/payload-generators/utils');
      expect(isValidEthereumAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18')).toBe(true);
    });

    it('rejects invalid addresses', async () => {
      const { isValidEthereumAddress } = await import('../../src/modules/payload-generators/utils');
      expect(isValidEthereumAddress('0x123')).toBe(false);
    });
  });

  describe('isValidLightningInvoice', () => {
    it('accepts valid invoices', async () => {
      const { isValidLightningInvoice } =
        await import('../../src/modules/payload-generators/utils');
      expect(
        isValidLightningInvoice(
          'lnbc1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqd'
        )
      ).toBe(true);
      expect(isValidLightningInvoice('lntb1abc123')).toBe(true);
    });

    it('rejects invalid invoices', async () => {
      const { isValidLightningInvoice } =
        await import('../../src/modules/payload-generators/utils');
      expect(isValidLightningInvoice('nope')).toBe(false);
    });
  });

  describe('isValidPayPalUsername', () => {
    it('accepts valid usernames', async () => {
      const { isValidPayPalUsername } = await import('../../src/modules/payload-generators/utils');
      expect(isValidPayPalUsername('john')).toBe(true);
      expect(isValidPayPalUsername('JohnDoe123')).toBe(true);
    });

    it('rejects invalid usernames', async () => {
      const { isValidPayPalUsername } = await import('../../src/modules/payload-generators/utils');
      expect(isValidPayPalUsername('ab')).toBe(false); // Too short
      expect(isValidPayPalUsername('a'.repeat(21))).toBe(false); // Too long
      expect(isValidPayPalUsername('user name')).toBe(false); // Space
    });
  });

  describe('isValidCashtag', () => {
    it('accepts valid cashtags', async () => {
      const { isValidCashtag } = await import('../../src/modules/payload-generators/utils');
      expect(isValidCashtag('$John')).toBe(true);
      expect(isValidCashtag('john')).toBe(true);
    });

    it('rejects invalid cashtags', async () => {
      const { isValidCashtag } = await import('../../src/modules/payload-generators/utils');
      expect(isValidCashtag('$123')).toBe(false); // Must start with letter
      expect(isValidCashtag('')).toBe(false);
    });
  });

  describe('isValidCurrencyCode', () => {
    it('accepts 3-digit codes', async () => {
      const { isValidCurrencyCode } = await import('../../src/modules/payload-generators/utils');
      expect(isValidCurrencyCode('840')).toBe(true);
      expect(isValidCurrencyCode('978')).toBe(true);
    });

    it('rejects non-3-digit codes', async () => {
      const { isValidCurrencyCode } = await import('../../src/modules/payload-generators/utils');
      expect(isValidCurrencyCode('12')).toBe(false);
      expect(isValidCurrencyCode('USD')).toBe(false);
    });
  });

  describe('isValidAmount', () => {
    it('accepts valid amounts', async () => {
      const { isValidAmount } = await import('../../src/modules/payload-generators/utils');
      expect(isValidAmount('100')).toBe(true);
      expect(isValidAmount('0')).toBe(true);
      expect(isValidAmount('99.99')).toBe(true);
    });

    it('accepts empty (optional)', async () => {
      const { isValidAmount } = await import('../../src/modules/payload-generators/utils');
      expect(isValidAmount('')).toBe(true);
    });

    it('rejects invalid amounts', async () => {
      const { isValidAmount } = await import('../../src/modules/payload-generators/utils');
      expect(isValidAmount('abc')).toBe(false);
      expect(isValidAmount('-10')).toBe(false);
    });
  });

  describe('isValidBSB', () => {
    it('accepts valid BSBs', async () => {
      const { isValidBSB } = await import('../../src/modules/payload-generators/utils');
      expect(isValidBSB('123456')).toBe(true);
      expect(isValidBSB('123-456')).toBe(true);
    });

    it('rejects invalid BSBs', async () => {
      const { isValidBSB } = await import('../../src/modules/payload-generators/utils');
      expect(isValidBSB('12345')).toBe(false);
      expect(isValidBSB('abcdef')).toBe(false);
    });
  });

  describe('isValidFpsId', () => {
    it('accepts valid FPS IDs', async () => {
      const { isValidFpsId } = await import('../../src/modules/payload-generators/utils');
      expect(isValidFpsId('1234567')).toBe(true);
      expect(isValidFpsId('123456789')).toBe(true);
    });

    it('rejects invalid FPS IDs', async () => {
      const { isValidFpsId } = await import('../../src/modules/payload-generators/utils');
      expect(isValidFpsId('123456')).toBe(false);
      expect(isValidFpsId('1234567890')).toBe(false);
    });
  });

  describe('isValidBankBin', () => {
    it('accepts valid bank BINs', async () => {
      const { isValidBankBin } = await import('../../src/modules/payload-generators/utils');
      expect(isValidBankBin('123456')).toBe(true);
      expect(isValidBankBin('12345678')).toBe(true);
    });

    it('rejects invalid bank BINs', async () => {
      const { isValidBankBin } = await import('../../src/modules/payload-generators/utils');
      expect(isValidBankBin('12345')).toBe(false);
    });
  });

  describe('isValidMerchantId', () => {
    it('accepts non-empty merchant IDs', async () => {
      const { isValidMerchantId } = await import('../../src/modules/payload-generators/utils');
      expect(isValidMerchantId('ABC123')).toBe(true);
    });

    it('rejects empty merchant IDs', async () => {
      const { isValidMerchantId } = await import('../../src/modules/payload-generators/utils');
      expect(isValidMerchantId('')).toBe(false);
      expect(isValidMerchantId('   ')).toBe(false);
    });
  });

  describe('isValidAccountNumber', () => {
    it('accepts valid account numbers', async () => {
      const { isValidAccountNumber } = await import('../../src/modules/payload-generators/utils');
      expect(isValidAccountNumber('1234')).toBe(true);
      expect(isValidAccountNumber('12345678901234')).toBe(true);
    });

    it('rejects too-short account numbers', async () => {
      const { isValidAccountNumber } = await import('../../src/modules/payload-generators/utils');
      expect(isValidAccountNumber('123')).toBe(false);
    });
  });

  describe('isValidStoreId', () => {
    it('accepts non-empty store IDs', async () => {
      const { isValidStoreId } = await import('../../src/modules/payload-generators/utils');
      expect(isValidStoreId('STORE1')).toBe(true);
    });

    it('rejects empty store IDs', async () => {
      const { isValidStoreId } = await import('../../src/modules/payload-generators/utils');
      expect(isValidStoreId('')).toBe(false);
    });
  });

  describe('isValidABN', () => {
    it('accepts valid ABNs', async () => {
      const { isValidABN } = await import('../../src/modules/payload-generators/utils');
      expect(isValidABN('12345678901')).toBe(true);
      expect(isValidABN('12 345 678 901')).toBe(true);
    });

    it('rejects invalid ABNs', async () => {
      const { isValidABN } = await import('../../src/modules/payload-generators/utils');
      expect(isValidABN('1234567890')).toBe(false); // 10 digits
      expect(isValidABN('123456789012')).toBe(false); // 12 digits
    });
  });

  describe('isValidProxyValue', () => {
    it('validates MOBILE proxy', async () => {
      const { isValidProxyValue } = await import('../../src/modules/payload-generators/utils');
      expect(isValidProxyValue('+60123456789', 'MOBILE')).toBe(true);
      expect(isValidProxyValue('ab', 'MOBILE')).toBe(false);
    });

    it('validates NRIC proxy', async () => {
      const { isValidProxyValue } = await import('../../src/modules/payload-generators/utils');
      expect(isValidProxyValue('901234567890', 'NRIC')).toBe(true);
      expect(isValidProxyValue('12345', 'NRIC')).toBe(false);
    });

    it('validates other proxy types', async () => {
      const { isValidProxyValue } = await import('../../src/modules/payload-generators/utils');
      expect(isValidProxyValue('anything', 'PASSPORT')).toBe(true);
      expect(isValidProxyValue('', 'ARMY')).toBe(false);
      expect(isValidProxyValue('  ', 'BUSINESS')).toBe(false);
    });
  });

  describe('escapeValue', () => {
    it('escapes backslash, semicolon, comma, newline', async () => {
      const { escapeValue } = await import('../../src/modules/payload-generators/utils');
      expect(escapeValue('a\\b')).toBe('a\\\\b');
      expect(escapeValue('a;b')).toBe('a\\;b');
      expect(escapeValue('a,b')).toBe('a\\,b');
      expect(escapeValue('a\nb')).toBe('a\\nb');
    });

    it('handles strings without special chars', async () => {
      const { escapeValue } = await import('../../src/modules/payload-generators/utils');
      expect(escapeValue('hello world')).toBe('hello world');
    });
  });

  describe('formatICalDate', () => {
    it('formats UTC date with time', async () => {
      const { formatICalDate } = await import('../../src/modules/payload-generators/utils');
      const result = formatICalDate('2025-01-15T10:30:00Z', true, true);
      expect(result).toBe('20250115T103000Z');
    });

    it('formats UTC date without time', async () => {
      const { formatICalDate } = await import('../../src/modules/payload-generators/utils');
      const result = formatICalDate('2025-01-15T10:30:00Z', false, true);
      expect(result).toBe('20250115');
    });

    it('formats local date with time', async () => {
      const { formatICalDate } = await import('../../src/modules/payload-generators/utils');
      const result = formatICalDate('2025-01-15T10:30:00', true, false);
      expect(result).toMatch(/^\d{8}T\d{6}$/);
      expect(result).not.toContain('Z');
    });

    it('formats local date without time', async () => {
      const { formatICalDate } = await import('../../src/modules/payload-generators/utils');
      const result = formatICalDate('2025-01-15T10:30:00', false, false);
      expect(result).toMatch(/^\d{8}$/);
    });

    it('returns input for invalid date', async () => {
      const { formatICalDate } = await import('../../src/modules/payload-generators/utils');
      expect(formatICalDate('not-a-date')).toBe('not-a-date');
    });
  });

  describe('utf8ByteLength', () => {
    it('counts ASCII correctly', async () => {
      const { utf8ByteLength } = await import('../../src/modules/payload-generators/utils');
      expect(utf8ByteLength('hello')).toBe(5);
    });

    it('counts multi-byte chars', async () => {
      const { utf8ByteLength } = await import('../../src/modules/payload-generators/utils');
      expect(utf8ByteLength('日本')).toBe(6); // 3 bytes each
    });

    it('handles empty string', async () => {
      const { utf8ByteLength } = await import('../../src/modules/payload-generators/utils');
      expect(utf8ByteLength('')).toBe(0);
    });
  });

  describe('crc16CCITT', () => {
    it('computes correct CRC for known input', async () => {
      const { crc16CCITT } = await import('../../src/modules/payload-generators/utils');
      // CRC16-CCITT of "123456789" is 0x29B1
      const result = crc16CCITT('123456789');
      expect(result).toBe('29B1');
    });

    it('produces 4-char hex string', async () => {
      const { crc16CCITT } = await import('../../src/modules/payload-generators/utils');
      const result = crc16CCITT('hello');
      expect(result).toMatch(/^[0-9A-F]{4}$/);
    });

    it('pads short CRC with leading zeros', async () => {
      const { crc16CCITT } = await import('../../src/modules/payload-generators/utils');
      const result = crc16CCITT('');
      expect(result.length).toBe(4);
    });
  });
});
