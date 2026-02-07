import { beforeEach, describe, expect, it, vi } from 'vitest';

const loadStore = async () => {
  const mod = await import('../../src/store/qr-store');
  return mod.useQRStore;
};

describe('qr-store', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useRealTimers();
  });

  it('exposes exhaustive setter coverage and applies each setter', async () => {
    const store = await loadStore();

    const setterArgs: Record<string, any> = {
      setAnimationBounce: true,
      setAnimationFrameStep: 2,
      setAnimationLoop: false,
      setAnimationMaxFrames: 12,
      setAnimationPlaying: false,
      setAnimationSpeedMs: 250,
      setAnimationStartFrame: 1,
      setAutoPickEcc: true,
      setAutoPickVersion: false,
      setMetadata: { title: 'T', author: 'A' },
      setOutputFilename: 'file-name',
      setOutputFormat: 'png',
      setOutputGifPaletteSize: 16,
      setOutputGifQuantizer: 'neuquant',
      setOutputHeight: 512,
      setOutputQuality: 0.7,
      setOutputSvgTrueVector: true,
      setOutputWidth: 512,
      setOverlayBlur: 2,
      setOverlayBrightness: 10,
      setOverlayColorMode: 'grayscale',
      setOverlayContrast: 5,
      setOverlayCrop: { enabled: true, region: { x: 0.2, y: 0.4, size: 0.6 } },
      setOverlayDiffusionKernel: 'atkinson',
      setOverlayDitherKind: 'ordered_bayer',
      setOverlayDitherStrength: 75,
      setOverlayEdgeDetect: 'sobel',
      setOverlayEnabled: true,
      setOverlayFile: { name: 'overlay.png' },
      setOverlayFit: 'contain',
      setOverlayFlip: { x: true, y: true },
      setOverlayGamma: 1.3,
      setOverlayHueRotate: 45,
      setOverlayIntensity: 42,
      setOverlayInvert: true,
      setOverlayMode: 'artwork',
      setOverlayPosterize: 4,
      setOverlayPreserveAlignment: true,
      setOverlayPreserveFinders: false,
      setOverlayPreserveTiming: true,
      setOverlayRotate: 15,
      setOverlaySaturation: 20,
      setOverlaySharpen: 5,
      setOverlayThreshold: 120,
      setOverlayType: 'gif',
      setOverlayUrl: 'https://example.com/overlay.png',
      setPayloadAppLink: { platform: 'custom', scheme: 'myapp', host: 'open', path: '/x' },
      setPayloadAusPayNet: { payId: 'merchant@example.com' },
      setPayloadBharatQR: { merchantName: 'Shop', merchantCity: 'Delhi' },
      setPayloadBizCard: { firstName: 'A', company: 'B' },
      setPayloadCalendarSub: { url: 'https://calendar.example/feed.ics' },
      setPayloadCashApp: { cashtag: 'cashuser' },
      setPayloadCloudLink: { service: 'gdrive', url: 'https://drive.example/file' },
      setPayloadCrypto: { type: 'bitcoin', address: 'abc' },
      setPayloadDuitNow: { proxyType: 'MOBILE', proxyValue: '01234', merchantName: 'M' },
      setPayloadEMVGeneric: { merchantName: 'M', countryCode: 'US', currencyCode: '840' },
      setPayloadEmail: { to: 'a@example.com', subject: 's', body: 'b' },
      setPayloadEthereum: { targetAddress: '0xabc' },
      setPayloadEvent: { summary: 'Meeting' },
      setPayloadEventRsvp: { rsvpUrl: 'https://example.com/rsvp' },
      setPayloadGS1: { gtin: '123', resolver: 'id.gs1.org' },
      setPayloadGeo: { lat: 1.23, lon: 4.56 },
      setPayloadHKQR: { fpsId: 'fps-id', merchantName: 'HK' },
      setPayloadJPQR: { storeId: 'S', merchantName: 'JP' },
      setPayloadKind: 'custom',
      setPayloadLightning: { invoice: 'lnbc123' },
      setPayloadMeCard: { name: 'Jane' },
      setPayloadMessaging: { platform: 'telegram', identifier: 'user', message: 'hello' },
      setPayloadOtpAuth: { issuer: 'ANQR', account: 'user', secret: 'ABC123' },
      setPayloadPayPalMe: { username: 'paypal-user' },
      setPayloadQRIS: { merchantId: 'MID', merchantName: 'Shop', merchantCity: 'Jakarta' },
      setPayloadQRPh: { accountNumber: 'ACC', merchantName: 'Shop', merchantCity: 'Manila' },
      setPayloadSms: { number: '+1555000', body: 'hello' },
      setPayloadSocialProfile: { platform: 'github', username: 'anqr' },
      setPayloadSwissQRBill: { creditorIBAN: 'CH9300762011623852957', creditorName: 'Creditor' },
      setPayloadTWQR: { merchantId: 'TW', merchantName: 'Store' },
      setPayloadTel: { number: '+15551234567' },
      setPayloadText: '  raw text  ',
      setPayloadUrl: { href: 'http://example.com', forceHttps: true, utmSource: 'newsletter' },
      setPayloadVCard: { fullName: 'John Doe', version: '3.0' },
      setPayloadValidation: { trim: true, normalizeNewlines: true, maxLenGuard: false },
      setPayloadVietQR: { bankBin: '970418', accountNumber: '12345678' },
      setPayloadWifi: { ssid: 'MY_WIFI', auth: 'WPA2', password: 'secret', hidden: true },
      setQaContrastCheck: true,
      setQaShowHeatmap: true,
      setQaSimulateBlur: 1.5,
      setQrCharacterEncoding: 'utf8',
      setQrEcc: 'Q',
      setQrEncodingMode: 'byte',
      setQrMaskPattern: 3,
      setQrQuietZone: 6,
      setQrQuietZoneMinEnforce: false,
      setQrVersion: 8,
      setRenderAlignmentStyle: 'rounded',
      setRenderBgColor: '#ffeecc',
      setRenderBgTransparent: true,
      setRenderCornerRadius: 30,
      setRenderCrispEdges: false,
      setRenderFgColor: '#112233',
      setRenderFinderStyle: 'circle',
      setRenderFrameStyle: 'sticker',
      setRenderFrameText: 'Scan me',
      setRenderGapMode: 'stroke',
      setRenderGradient: { type: 'linear', stops: [{ offset: 0, color: '#000000' }] },
      setRenderModuleGap: 10,
      setRenderModulePx: 16,
      setRenderModuleStyle: 'rounded',
      setRenderTimingStyle: 'dashed',
      setSafetyLocks: { lockFinders: false, lockTiming: false },
      setSafetyMinModulePx: 3,
      setSafetyMode: 'balanced',
      setSearchQuery: 'wifi',
      setShare: { directLink: false, encodeMoreParams: true },
      setTier: 'advanced',
      setWatermarkEnabled: true,
      setWatermarkKind: 'image',
      setWatermarkOpacity: 80,
      setWatermarkPosition: 'bottom_right',
      setWatermarkText: '© ANQR',
    };

    const state = store.getState() as Record<string, unknown>;
    const setterNames = Object.keys(state).filter((key) => key.startsWith('set')).sort();
    const mappedSetterNames = Object.keys(setterArgs).sort();
    expect(mappedSetterNames).toEqual(setterNames);

    for (const name of setterNames) {
      (store.getState() as Record<string, any>)[name](setterArgs[name]);
    }

    const updated = store.getState();
    expect(updated.overlay.mode).toBe('artwork');
    expect(updated.render.finderStyle).toBe('circle');
    expect(updated.render.eyeOuterStyle).toBe('circle');
    expect(updated.share.directLink).toBe(false);
    expect(updated.searchQuery).toBe('wifi');
  });

  it('handles premium access lifecycle and effective tier', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-07T00:00:00Z'));

    const store = await loadStore();
    expect(store.getState().checkPremiumAccess()).toBe(false);
    expect(store.getState().getEffectiveTier()).toBe('basic');

    store.getState().setTier('advanced');
    store.getState().activatePremiumAccess();

    expect(store.getState().checkPremiumAccess()).toBe(true);
    expect(store.getState().getEffectiveTier()).toBe('professional');

    vi.advanceTimersByTime(24 * 60 * 60 * 1000 + 1);
    expect(store.getState().checkPremiumAccess()).toBe(false);
    expect(store.getState().premiumAccess).toEqual({ active: false, expiresAt: null });
    expect(store.getState().getEffectiveTier()).toBe('advanced');
  });

  it('applies artwork overlay mode QR overrides', async () => {
    const store = await loadStore();

    store.getState().setQrEcc('Q');
    store.getState().setQrVersion(8);
    store.getState().setOverlayMode('artwork');

    expect(store.getState().overlay.mode).toBe('artwork');
    expect(store.getState().qr.ecc).toBe('L');
    expect(store.getState().qr.version).toBe(6);
  });

  it('builds plain text, URL, and contact payloads', async () => {
    const store = await loadStore();

    store.getState().setPayloadKind('plain_text');
    store.getState().setPayloadValidation({ trim: true, normalizeNewlines: true });
    store.getState().setPayloadText('  hello\r\nworld\r  ');
    expect(store.getState().getPayloadText()).toBe('hello\nworld');

    store.getState().setPayloadKind('url');
    store.getState().setPayloadUrl({
      href: 'http://example.com/path',
      forceHttps: true,
      utmSource: 'src',
      utmMedium: 'med',
      utmCampaign: 'camp',
    });
    expect(store.getState().getPayloadText()).toBe(
      'https://example.com/path?utm_source=src&utm_medium=med&utm_campaign=camp'
    );

    store.getState().setPayloadKind('email');
    store.getState().setPayloadEmail({ to: 'test@example.com', subject: 'Hi', body: 'Body text' });
    expect(store.getState().getPayloadText()).toBe(
      'mailto:test@example.com?subject=Hi&body=Body+text'
    );

    store.getState().setPayloadKind('sms');
    store.getState().setPayloadSms({ number: '+1234', body: 'hello world' });
    expect(store.getState().getPayloadText()).toBe('sms:+1234?body=hello%20world');

    store.getState().setPayloadKind('geo');
    store.getState().setPayloadGeo({ lat: 12.34, lon: 56.78 });
    expect(store.getState().getPayloadText()).toBe('geo:12.34,56.78');

    store.getState().setPayloadKind('wifi');
    store.getState().setPayloadWifi({ ssid: 'ANQR', auth: 'WPA2', password: 'pw', hidden: true });
    expect(store.getState().getPayloadText()).toBe('WIFI:T:WPA2;S:ANQR;P:pw;H:true;;');
  });

  it('builds app/event/social and fallback payload kinds', async () => {
    const store = await loadStore();

    store.getState().setPayloadKind('calendar_subscription');
    store.getState().setPayloadCalendarSub({
      url: 'https://calendar.example.com/team.ics',
      calendarName: 'Team Calendar',
    });
    expect(store.getState().getPayloadText()).toContain('webcal://calendar.example.com/team.ics');
    expect(store.getState().getPayloadText()).toContain('name=Team%20Calendar');

    store.getState().setPayloadKind('event_rsvp');
    store.getState().setPayloadEventRsvp({ rsvpUrl: 'hello@example.com' });
    expect(store.getState().getPayloadText()).toBe('mailto:hello@example.com?subject=RSVP');

    store.getState().setPayloadKind('event_rsvp');
    store.getState().setPayloadEventRsvp({
      summary: 'Launch',
      start: '2026-02-07T10:00:00Z',
      end: '2026-02-07T11:00:00Z',
      rsvpUrl: 'https://example.com/rsvp',
    });
    expect(store.getState().getPayloadText()).toContain('BEGIN:VEVENT');
    expect(store.getState().getPayloadText()).toContain('RSVP: https://example.com/rsvp');

    store.getState().setPayloadKind('social_profile');
    store.getState().setPayloadSocialProfile({ platform: 'github', username: 'anqr' });
    expect(store.getState().getPayloadText()).toContain('github');

    store.getState().setPayloadKind('messaging_link');
    store.getState().setPayloadMessaging({ platform: 'whatsapp', identifier: '12345', message: 'hi' });
    expect(store.getState().getPayloadText()).toContain('12345');

    store.getState().setPayloadKind('app_link');
    store.getState().setPayloadAppLink({ platform: 'universal', scheme: 'https', host: 'anqr.link', path: '/open' });
    expect(store.getState().getPayloadText()).toBe('https://anqr.link/open');

    store.getState().setPayloadKind('app_link');
    store.getState().setPayloadAppLink({ platform: 'custom', scheme: 'anqr', host: 'open', path: '/foo' });
    expect(store.getState().getPayloadText()).toBe('anqr://open/foo');

    store.getState().setPayloadKind('file_url');
    store.getState().setPayloadText('files.example.com/a.pdf');
    expect(store.getState().getPayloadText()).toBe('https://files.example.com/a.pdf');

    store.getState().setPayloadKind('custom');
    store.getState().setPayloadValidation({ trim: true, normalizeNewlines: false });
    store.getState().setPayloadText('  custom text  ');
    expect(store.getState().getPayloadText()).toBe('custom text');
  });

  it('covers payment required-field guards and valid generation paths', async () => {
    const store = await loadStore();

    store.getState().setPayloadKind('swiss_qr_bill');
    store.getState().setPayloadSwissQRBill({ creditorIBAN: '', creditorName: '' });
    expect(store.getState().getPayloadText()).toBe('');

    store.getState().setPayloadKind('lightning');
    store.getState().setPayloadLightning({ invoice: '' });
    expect(store.getState().getPayloadText()).toBe('');

    store.getState().setPayloadKind('ethereum_eip681');
    store.getState().setPayloadEthereum({ targetAddress: '' });
    expect(store.getState().getPayloadText()).toBe('');

    store.getState().setPayloadKind('qris');
    store.getState().setPayloadQRIS({ merchantId: 'x', merchantName: '', merchantCity: 'Jakarta' });
    expect(store.getState().getPayloadText()).toBe('');

    store.getState().setPayloadKind('duitnow');
    store.getState().setPayloadDuitNow({ proxyType: 'MOBILE', proxyValue: '', merchantName: '' });
    expect(store.getState().getPayloadText()).toBe('');

    store.getState().setPayloadKind('bharatqr');
    store.getState().setPayloadBharatQR({ merchantName: '', merchantCity: 'Mumbai' });
    expect(store.getState().getPayloadText()).toBe('');

    store.getState().setPayloadKind('vietqr');
    store.getState().setPayloadVietQR({ bankBin: '', accountNumber: '' });
    expect(store.getState().getPayloadText()).toBe('');

    store.getState().setPayloadKind('qrph');
    store.getState().setPayloadQRPh({ accountNumber: '', merchantName: '', merchantCity: 'MNL' });
    expect(store.getState().getPayloadText()).toBe('');

    store.getState().setPayloadKind('twqr');
    store.getState().setPayloadTWQR({ merchantId: '1', merchantName: '' });
    expect(store.getState().getPayloadText()).toBe('');

    store.getState().setPayloadKind('hkqr');
    store.getState().setPayloadHKQR({ fpsId: '', merchantName: '' });
    expect(store.getState().getPayloadText()).toBe('');

    store.getState().setPayloadKind('jpqr');
    store.getState().setPayloadJPQR({ storeId: 'x', merchantName: '' });
    expect(store.getState().getPayloadText()).toBe('');

    store.getState().setPayloadKind('auspaynet');
    store.getState().setPayloadAusPayNet({ payId: '', bsb: '', accountNumber: '' });
    expect(store.getState().getPayloadText()).toBe('');

    store.getState().setPayloadKind('paypal_me');
    store.getState().setPayloadPayPalMe({ username: '' });
    expect(store.getState().getPayloadText()).toBe('');

    store.getState().setPayloadKind('cashapp');
    store.getState().setPayloadCashApp({ cashtag: '' });
    expect(store.getState().getPayloadText()).toBe('');

    store.getState().setPayloadKind('emv_generic');
    store.getState().setPayloadEMVGeneric({ merchantName: '', countryCode: '', currencyCode: '' });
    expect(store.getState().getPayloadText()).toBe('');

    store.getState().setPayloadKind('paypal_me');
    store.getState().setPayloadPayPalMe({ username: 'anqr-user', amount: 12.34, currencyCode: 'USD' });
    expect(store.getState().getPayloadText()).toContain('paypal.me');

    store.getState().setPayloadKind('cashapp');
    store.getState().setPayloadCashApp({ cashtag: 'anqr', amount: 9.99 });
    expect(store.getState().getPayloadText()).toContain('cash.app');

    store.getState().setPayloadKind('auspaynet');
    store.getState().setPayloadAusPayNet({ payId: 'payid@example.com', merchantName: 'ANQR' });
    expect(store.getState().getPayloadText()).toMatch(/^000201/);

    store.getState().setPayloadKind('emv_generic');
    store.getState().setPayloadEMVGeneric({
      merchantName: 'ANQR',
      merchantCity: 'Sydney',
      countryCode: 'AU',
      currencyCode: '036',
      amount: 1.23,
      reference: 'INV-1',
    });
    expect(store.getState().getPayloadText()).toContain('ANQR');
  });

  it('handles gs1 and utm variants', async () => {
    const store = await loadStore();

    store.getState().setPayloadKind('gs1_digital_link');
    store.getState().setPayloadGS1({ gtin: '09506000134352', resolver: 'id.gs1.org', batch: 'B1' });
    expect(store.getState().getPayloadText()).toContain('id.gs1.org');

    store.getState().setPayloadKind('utm_link');
    store.getState().setPayloadUrl({
      href: 'https://example.com?existing=1',
      utmSource: 'newsletter',
      utmMedium: 'email',
      utmCampaign: 'launch',
      utmTerm: 'qr',
      utmContent: 'cta',
    });
    expect(store.getState().getPayloadText()).toBe(
      'https://example.com?existing=1&utm_source=newsletter&utm_medium=email&utm_campaign=launch&utm_term=qr&utm_content=cta'
    );

    store.getState().setPayloadKind('short_link');
    store.getState().setPayloadText('https://anqr.link/s/abc');
    expect(store.getState().getPayloadText()).toBe('https://anqr.link/s/abc');
  });

  it('supports explicit tel and crypto generation', async () => {
    const store = await loadStore();

    store.getState().setPayloadKind('tel');
    store.getState().setPayloadTel({ number: '+18005551212' });
    expect(store.getState().getPayloadText()).toBe('tel:+18005551212');

    store.getState().setPayloadKind('crypto');
    store.getState().setPayloadCrypto({
      type: 'bitcoin',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      amount: 0.5,
      label: 'Donation',
    });
    expect(store.getState().getPayloadText()).toBe(
      'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.5&label=Donation'
    );
  });

  it('covers remaining payload generation branches', async () => {
    const store = await loadStore();

    store.getState().setPayloadKind('url');
    store.getState().setPayloadUrl({ href: 'https://example.com/base' });
    expect(store.getState().getPayloadText()).toBe('https://example.com/base');

    store.getState().setPayloadKind('vcard');
    store.getState().setPayloadVCard({ fullName: 'Jane Doe', org: 'ANQR', email: 'jane@example.com' });
    expect(store.getState().getPayloadText()).toContain('BEGIN:VCARD');

    store.getState().setPayloadKind('mecard');
    store.getState().setPayloadMeCard({ name: 'Jane Doe', email: 'jane@example.com' });
    expect(store.getState().getPayloadText()).toContain('MECARD:');

    store.getState().setPayloadKind('event');
    store.getState().setPayloadEvent({
      summary: 'Planning',
      start: '2026-02-07T09:00:00Z',
      end: '2026-02-07T09:30:00Z',
    });
    expect(store.getState().getPayloadText()).toContain('BEGIN:VEVENT');

    store.getState().setPayloadKind('bizcard');
    store.getState().setPayloadBizCard({ firstName: 'Jane', lastName: 'Doe', company: 'ANQR' });
    expect(store.getState().getPayloadText()).toContain('BIZCARD:');

    store.getState().setPayloadKind('calendar_subscription');
    store.getState().setPayloadCalendarSub({ url: 'example.com/team.ics' });
    expect(store.getState().getPayloadText()).toBe('webcal://example.com/team.ics');
    store.getState().setPayloadCalendarSub({ url: 'http://example.com/legacy.ics' });
    expect(store.getState().getPayloadText()).toBe('webcal://example.com/legacy.ics');

    store.getState().setPayloadKind('event_rsvp');
    store.getState().setPayloadEventRsvp({ rsvpUrl: 'https://example.com/rsvp' });
    expect(store.getState().getPayloadText()).toBe('https://example.com/rsvp');

    store.getState().setPayloadKind('gs1_digital_link');
    store.getState().setPayloadGS1({ gtin: '09506000134352', resolver: 'id.gs1.org' });
    expect(store.getState().getPayloadText()).toContain('https://id.gs1.org/01/');
    store.getState().setPayloadKind('gs1_digital_link');
    store.getState().setPayloadGS1({ gtin: '', resolver: 'id.gs1.org' });
    expect(store.getState().getPayloadText()).toContain('https://id.gs1.org/01/');
    store.getState().setPayloadText('');
    store.getState().setPayloadGS1({ gtin: '', resolver: '' });
    expect(store.getState().getPayloadText()).toBe('');

    store.getState().setPayloadKind('app_link');
    store.getState().setPayloadAppLink({
      platform: 'universal',
      scheme: '',
      host: '',
      path: '',
    });
    store.getState().setPayloadText('anqr.link/open');
    expect(store.getState().getPayloadText()).toBe('https://anqr.link/open');

    store.getState().setPayloadKind('app_link');
    store.getState().setPayloadAppLink({
      platform: 'android',
      scheme: 'anqr',
      host: 'open',
      path: '/route',
      package: 'com.anqr.app',
      fallbackUrl: 'https://anqr.link/open',
    });
    expect(store.getState().getPayloadText()).toContain('intent://');

    store.getState().setPayloadKind('app_link');
    store.getState().setPayloadText('');
    store.getState().setPayloadAppLink({
      platform: 'universal',
      scheme: '',
      host: '',
      path: '',
    });
    expect(store.getState().getPayloadText()).toBe('');

    store.getState().setPayloadKind('app_link');
    store.getState().setPayloadAppLink({
      platform: 'universal',
      scheme: 'https',
      host: 'anqr.link',
      path: '/u',
    });
    expect(store.getState().getPayloadText()).toBe('https://anqr.link/u');

    store.getState().setPayloadKind('app_link');
    store.getState().setPayloadText('fallback-link');
    store.getState().setPayloadAppLink({
      platform: 'custom',
      scheme: '',
      host: '',
      path: '',
    });
    expect(store.getState().getPayloadText()).toBe('fallback-link');
    store.getState().setPayloadAppLink({
      platform: 'custom',
      scheme: 'anqr',
      host: 'open',
      path: '',
    });
    expect(store.getState().getPayloadText()).toBe('anqr://open');

    store.getState().setPayloadKind('utm_link');
    store.getState().setPayloadUrl({ href: 'http://example.com/no-utm', forceHttps: true });
    expect(store.getState().getPayloadText()).toBe('https://example.com/no-utm');
    store.getState().setPayloadUrl({ href: 'https://example.com/no-utm', forceHttps: false });
    expect(store.getState().getPayloadText()).toBe('https://example.com/no-utm');
    store.getState().setPayloadUrl({ href: 'https://example.com/new', utmSource: 'src' });
    expect(store.getState().getPayloadText()).toBe('https://example.com/new?utm_source=src');

    store.getState().setPayloadKind('swiss_qr_bill');
    store.getState().setPayloadSwissQRBill({
      creditorIBAN: 'CH4431999123000889012',
      creditorName: 'ANQR AG',
      creditorAddressType: 'S',
      creditorCountry: 'CH',
      currency: 'CHF',
      referenceType: 'NON',
    });
    expect(store.getState().getPayloadText()).toContain('SPC');

    store.getState().setPayloadKind('lightning');
    store.getState().setPayloadLightning({ invoice: 'lnbc1p0test' });
    expect(store.getState().getPayloadText()).toContain('lnbc1p0test');

    store.getState().setPayloadKind('ethereum_eip681');
    store.getState().setPayloadEthereum({
      targetAddress: '0xabc123abc123abc123abc123abc123abc123abcd',
      value: '1000000000000000000',
    });
    expect(store.getState().getPayloadText()).toContain('ethereum:');

    store.getState().setPayloadKind('qris');
    store.getState().setPayloadQRIS({ merchantId: 'ID123', merchantName: 'ANQR', merchantCity: 'Jakarta' });
    expect(store.getState().getPayloadText()).toContain('000201');

    store.getState().setPayloadKind('duitnow');
    store.getState().setPayloadDuitNow({
      proxyType: 'MOBILE',
      proxyValue: '60123456789',
      merchantName: 'ANQR',
    });
    expect(store.getState().getPayloadText()).toContain('000201');

    store.getState().setPayloadKind('bharatqr');
    store.getState().setPayloadBharatQR({ merchantName: 'ANQR', merchantCity: 'Mumbai' });
    expect(store.getState().getPayloadText()).toContain('000201');

    store.getState().setPayloadKind('vietqr');
    store.getState().setPayloadVietQR({ bankBin: '970418', accountNumber: '1234567890' });
    expect(store.getState().getPayloadText()).toContain('9704');

    store.getState().setPayloadKind('qrph');
    store.getState().setPayloadQRPh({ accountNumber: '12345', merchantName: 'ANQR', merchantCity: 'MNL' });
    expect(store.getState().getPayloadText()).toContain('000201');

    store.getState().setPayloadKind('twqr');
    store.getState().setPayloadTWQR({ merchantId: 'TW01', merchantName: 'ANQR' });
    expect(store.getState().getPayloadText()).toContain('000201');

    store.getState().setPayloadKind('hkqr');
    store.getState().setPayloadHKQR({ fpsId: 'FPS123456', merchantName: 'ANQR' });
    expect(store.getState().getPayloadText()).toContain('000201');
    store.getState().setPayloadHKQR({ fpsId: 'FPS123456', merchantName: 'ANQR', merchantCity: '' });
    expect(store.getState().getPayloadText()).toContain('000201');
    store.getState().setPayloadHKQR({ fpsId: '', merchantName: 'ANQR' });
    expect(store.getState().getPayloadText()).toContain('000201');

    store.getState().setPayloadKind('jpqr');
    store.getState().setPayloadJPQR({ storeId: 'STORE1', merchantName: 'ANQR' });
    expect(store.getState().getPayloadText()).toContain('000201');

    store.getState().setPayloadKind('auspaynet');
    store.getState().setPayloadAusPayNet({
      payId: '',
      bsb: '082902',
      accountNumber: '12345678',
      merchantName: 'ANQR',
    });
    expect(store.getState().getPayloadText()).toContain('000201');

    store.getState().setPayloadKind('emv_generic');
    store.getState().setPayloadEMVGeneric({
      merchantName: 'ANQR',
      merchantCity: 'Sydney',
      countryCode: 'AU',
      currencyCode: '036',
      tipIndicator: 'fixed',
      tipAmount: 2.5,
    });
    expect(store.getState().getPayloadText()).toContain('000201');

    store.setState((s) => ({ payload: { ...s.payload, kind: '__unknown__' as any, text: ' fallback ' } }));
    expect(store.getState().getPayloadText()).toBe('fallback');
  });

  it('executes clearOverlay helper', async () => {
    const store = await loadStore();

    store.getState().setOverlayFile({ name: 'x.png' } as any);
    store.getState().setOverlayUrl('https://example.com/x.png');
    expect(store.getState().overlay.enabled).toBe(true);

    store.getState().clearOverlay();
    expect(store.getState().overlay.enabled).toBe(false);
    expect(store.getState().overlay.url).toBe('');
    expect(store.getState().overlay.file).toBeNull();
  });
});
