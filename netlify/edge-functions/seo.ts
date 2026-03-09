import type { Context } from 'https://edge.netlify.com';

const BASE_URL = 'https://anqr.link';
const OG_IMAGE_SIZE = 600;

interface PageMeta {
  title: string;
  description: string;
  ogImageUrl?: string;
}

function escapeHtml(str: string): string {
  return str
    .replaceAll(/&/g, '&amp;')
    .replaceAll(/"/g, '&quot;')
    .replaceAll(/</g, '&lt;')
    .replaceAll(/>/g, '&gt;');
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return `${str.slice(0, maxLen - 1)}\u2026`;
}

const OG_PASSTHROUGH_PARAMS = [
  'fg',
  'bg',
  'transparent',
  'ec',
  'margin',
  'enc',
  'v',
  'border',
  'modulePx',
  'style',
  'finder',
  'align',
  'timing',
  'eyeOuter',
  'eyeInner',
  'eyeScale',
  'radius',
  'gap',
  'gapMode',
  'dotRot',
  'frame',
  'frameText',
  'grad',
  'gradAngle',
  'gradStops',
  'img',
  'mode',
  'intensity',
  'colorMode',
  'logoSize',
  'keepFinders',
  'keepTiming',
  'keepAlign',
  'brightness',
  'contrast',
  'gamma',
  'saturation',
  'ditherKind',
  'diffusionKernel',
  'ditherStrength',
  'duo1',
  'duo2',
  'palette',
  'paletteMode',
  'wmEn',
  'wmKind',
  'wmText',
  'wmPos',
  'wmOpacity',
  'wmBlend',
  'subpixel',
  'crisp',
  'snap',
  'modColor',
  'cGuard',
  'minContrast',
];

function buildOgImageUrl(searchParams: URLSearchParams): string {
  const imageParams = new URLSearchParams();

  const data = searchParams.get('data');
  if (data) imageParams.set('data', data);

  imageParams.set('size', OG_IMAGE_SIZE.toString());

  const clientSize = searchParams.get('size');
  if (clientSize) imageParams.set('modulePx', clientSize);

  for (const key of OG_PASSTHROUGH_PARAMS) {
    const val = searchParams.get(key);
    if (val) imageParams.set(key, val);
  }

  return `${BASE_URL}/api/qr?${imageParams.toString()}`;
}

const PAGE_META: Record<string, PageMeta> = {
  '/': {
    title: 'ANQR - QR Code Generator',
    description:
      'ANQR is a fast, privacy-friendly QR code generator for URLs, text, vCards, Wi-Fi, and more. Create scan-ready QR codes with high error correction, styling, and export options.',
  },
  '/gallery': {
    title: 'QR Code Gallery | ANQR',
    description:
      'Browse examples of styled QR codes created with ANQR. See overlays, dithering, animations, blend modes, and more.',
  },
  '/about': {
    title: 'About ANQR',
    description:
      'ANQR is a free QR code generator with a client-first approach - generate QR codes locally or use our API for embedding.',
  },
  '/privacy': {
    title: 'Privacy Policy | ANQR',
    description:
      'Information ANQR collects, how it is used, and your rights under applicable privacy laws.',
  },
  '/terms': {
    title: 'Terms of Service | ANQR',
    description: 'By accessing or using the site, you agree to be bound by these terms.',
  },
  '/contact': {
    title: 'Contact Us | ANQR',
    description: 'We welcome feedback, bug reports, feature requests, and general enquiries.',
  },
  '/guide': {
    title: 'ANQR User Guide | ANQR',
    description:
      'Complete guide to using ANQR for creating QR codes with styling, overlays, and export options.',
  },
  '/learn': {
    title: 'Learn with ANQR',
    description:
      'Practical, business-first guides for turning QR codes into real marketing assets.',
  },
  '/examples': {
    title: 'ANQR Examples | ANQR',
    description:
      'Five real-world examples showing where QR codes create measurable value: retail, payments, print, animation, and collaboration.',
  },
  '/analyze': {
    title: 'QR Code Analyzer | ANQR',
    description:
      'Analyze and validate QR codes. Check scannability, structure, and error correction.',
  },
  '/translate': {
    title: 'Help Translate ANQR',
    description:
      'Join our community of translators helping make ANQR accessible to users worldwide.',
  },
};

export default async function handler(request: Request, context: Context) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Skip static assets, API calls, and other non-page requests early
  if (
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/.netlify/') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/screenshots/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/.well-known/') ||
    /\.(js|css|png|jpe?g|gif|svg|ico|woff2?|json|xml|txt|webp|map|webmanifest)$/i.test(pathname)
  ) {
    return context.next();
  }

  // Normalize path: strip trailing slashes, default to '/'
  const path = pathname.replace(/\/+$/, '') || '/';

  // Skip gallery image paths (e.g. /gallery/plain-v1-L.png) but not /gallery itself
  if (pathname.startsWith('/gallery/') && path !== '/gallery') {
    return context.next();
  }

  // Look up page metadata; for '/' with ?data= param, build dynamic share meta
  const dataParam = url.searchParams.get('data');
  const isShareUrl = path === '/' && dataParam;

  let meta: PageMeta | undefined;
  let canonicalUrl: string;

  if (isShareUrl) {
    const displayData = truncate(dataParam, 80);
    meta = {
      title: `QR Code: ${displayData} | ANQR`,
      description: `Scan this QR code created with ANQR. Content: ${truncate(dataParam, 150)}`,
      ogImageUrl: buildOgImageUrl(url.searchParams),
    };
    canonicalUrl = `${BASE_URL}/?${url.searchParams.toString()}`;
  } else {
    meta = PAGE_META[path];
    canonicalUrl = path === '/' ? `${BASE_URL}/` : `${BASE_URL}${path}`;
  }

  if (!meta) {
    return context.next();
  }

  const response = await context.next();

  // Only modify HTML responses
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  let html = await response.text();

  const safeTitle = escapeHtml(meta.title);
  const safeDescription = escapeHtml(meta.description);
  const safeCanonical = escapeHtml(canonicalUrl);

  // Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`);

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${safeDescription}"`
  );

  // Replace canonical URL
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${safeCanonical}"`
  );

  // Replace Open Graph tags
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${safeCanonical}"`
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${safeTitle}"`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${safeDescription}"`
  );

  // Replace og:image for share URLs (dynamic QR preview via API)
  if (meta.ogImageUrl) {
    const safeOgImage = escapeHtml(meta.ogImageUrl);
    html = html.replace(
      /<meta property="og:image" content="[^"]*"/,
      `<meta property="og:image" content="${safeOgImage}"`
    );
    html = html.replace(
      /<meta property="og:image:width" content="[^"]*"/,
      `<meta property="og:image:width" content="${OG_IMAGE_SIZE}"`
    );
    html = html.replace(
      /<meta property="og:image:height" content="[^"]*"/,
      `<meta property="og:image:height" content="${OG_IMAGE_SIZE}"`
    );
    html = html.replace(
      /<meta name="twitter:image" content="[^"]*"/,
      `<meta name="twitter:image" content="${safeOgImage}"`
    );
  }

  // Replace Twitter Card tags
  html = html.replace(
    /<meta name="twitter:url" content="[^"]*"/,
    `<meta name="twitter:url" content="${safeCanonical}"`
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${safeTitle}"`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${safeDescription}"`
  );

  // Build new response with modified HTML
  const headers = new Headers(response.headers);
  headers.delete('content-length');

  return new Response(html, {
    status: response.status,
    headers,
  });
}

export const config = { path: '/*' };
