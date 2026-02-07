import { describe, expect, it } from 'vitest';
import {
  generateEmail,
  generateSms,
  generateTel,
  generateUrl,
  generateVCard,
  generateWifi,
} from '../../src/modules/payload-generators';

// Core payload generators

describe('payload generators (core)', () => {
  it('generateUrl applies https + UTM params', () => {
    const out = generateUrl({
      href: 'http://example.com/path',
      forceHttps: true,
      utmSource: 'newsletter',
      utmMedium: 'email',
      utmCampaign: 'launch',
    });
    expect(out).toBe(
      'https://example.com/path?utm_source=newsletter&utm_medium=email&utm_campaign=launch'
    );
  });

  it('generateTel strips whitespace', () => {
    const out = generateTel({ number: '+61 400 123 456' });
    expect(out).toBe('tel:+61400123456');
  });

  it('generateEmail encodes subject/body', () => {
    const out = generateEmail({
      to: 'hello@example.com',
      subject: 'Hello',
      body: 'Line 1\nLine 2',
    });
    expect(out).toBe('mailto:hello@example.com?subject=Hello&body=Line+1%0ALine+2');
  });

  it('generateSms encodes body', () => {
    const out = generateSms({ number: '+61400123456', body: 'Hi there!' });
    expect(out).toBe('sms:+61400123456?body=Hi%20there!');
  });

  it('generateWifi escapes special chars', () => {
    const out = generateWifi({
      auth: 'WPA',
      ssid: 'My;WiFi',
      password: 'p@ss;word',
      hidden: true,
    });
    expect(out).toBe('WIFI:T:WPA;S:My\\;WiFi;P:p@ss\\;word;H:true;;');
  });
});

// Contact payload generators

describe('payload generators (contacts)', () => {
  it('generateVCard includes N and FN ordering', () => {
    const out = generateVCard({
      version: '3.0',
      fn: 'John Doe',
      tel: ['+61400123456'],
      email: ['john@example.com'],
    });
    expect(out).toContain('BEGIN:VCARD');
    expect(out).toContain('VERSION:3.0');
    expect(out).toContain('N:Doe;John;;;');
    expect(out).toContain('FN:John Doe');
    expect(out).toContain('TEL:+61400123456');
    expect(out).toContain('EMAIL;TYPE=INTERNET:john@example.com');
    expect(out).toContain('END:VCARD');
  });
});
