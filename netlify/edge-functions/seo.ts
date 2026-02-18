import type { Context } from 'https://edge.netlify.com';

const BASE_URL = 'https://anqr.link';

interface PageMeta {
  title: string;
  description: string;
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

  // Look up page metadata early to skip unknown pages without calling origin
  const meta = PAGE_META[path];
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

  const canonicalUrl = path === '/' ? `${BASE_URL}/` : `${BASE_URL}${path}`;

  // Replace <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${meta.description}"`
  );

  // Replace canonical URL
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${canonicalUrl}"`
  );

  // Replace Open Graph tags
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${canonicalUrl}"`
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${meta.title}"`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${meta.description}"`
  );

  // Replace Twitter Card tags
  html = html.replace(
    /<meta name="twitter:url" content="[^"]*"/,
    `<meta name="twitter:url" content="${canonicalUrl}"`
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${meta.title}"`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${meta.description}"`
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
