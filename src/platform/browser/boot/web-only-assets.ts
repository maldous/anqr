import { Capacitor } from '@capacitor/core';
import { addLink } from './add-link';
import { addScript } from './add-script';
import type { IubendaWindow } from './iubenda-window';

export const loadWebOnlyBootAssets = (): void => {
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
};
