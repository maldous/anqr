import { Capacitor } from '@capacitor/core';

type IubendaWindow = Window & {
  _iub?: Array<Record<string, unknown>> & { csConfiguration?: Record<string, unknown> };
  __anqrWebAssetsLoaded?: boolean;
};

function addLink(
  id: string,
  attrs: {
    rel: string;
    href: string;
    as?: string;
    crossOrigin?: string;
  }
): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(id)) return;

  const link = document.createElement('link');
  link.id = id;
  link.rel = attrs.rel;
  link.href = attrs.href;
  if (attrs.as) link.as = attrs.as;
  if (attrs.crossOrigin) link.crossOrigin = attrs.crossOrigin;
  document.head.appendChild(link);
}

function addScript(
  id: string,
  src: string,
  options: {
    async?: boolean;
    crossOrigin?: string;
    charset?: string;
  } = {}
): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(id)) return;

  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = options.async ?? true;
  if (options.crossOrigin) script.crossOrigin = options.crossOrigin;
  if (options.charset) script.charset = options.charset;
  document.head.appendChild(script);
}

export function loadWebOnlyBootAssets(): void {
  if (typeof document === 'undefined') return;
  if (Capacitor.isNativePlatform()) return;

  const win = window as IubendaWindow;
  if (win.__anqrWebAssetsLoaded) return;
  win.__anqrWebAssetsLoaded = true;

  addLink('anqr-preconnect-fonts-googleapis', {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com',
  });
  addLink('anqr-preconnect-fonts-gstatic', {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  });
  addLink('anqr-preconnect-pagead2', {
    rel: 'preconnect',
    href: 'https://pagead2.googlesyndication.com',
    crossOrigin: 'anonymous',
  });
  addLink('anqr-preconnect-iubenda-cdn', {
    rel: 'preconnect',
    href: 'https://cdn.iubenda.com',
  });
  addLink('anqr-dns-cs-iubenda', {
    rel: 'dns-prefetch',
    href: 'https://cs.iubenda.com',
  });
  addLink('anqr-dns-embeds-iubenda', {
    rel: 'dns-prefetch',
    href: 'https://embeds.iubenda.com',
  });

  addLink('anqr-font-noto-sans', {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap',
    crossOrigin: 'anonymous',
  });

  win._iub ??= [];
  win._iub.csConfiguration = {
    siteId: 4407480,
    cookiePolicyId: 70266922,
    lang: 'en',
    storage: { useSiteId: true },
  };

  addScript('anqr-iubenda-autoblocking', 'https://cs.iubenda.com/autoblocking/4407480.js');
  addScript('anqr-iubenda-gpp-stub', 'https://cdn.iubenda.com/cs/gpp/stub.js');
  addScript('anqr-iubenda-cs', 'https://cdn.iubenda.com/cs/iubenda_cs.js', {
    charset: 'UTF-8',
  });
  addScript(
    'anqr-iubenda-widget',
    'https://embeds.iubenda.com/widgets/28e23ca9-eb78-41ab-ac5e-46b90c7791c7.js'
  );

  addScript(
    'anqr-adsense',
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2270701384951162',
    { crossOrigin: 'anonymous' }
  );
}
