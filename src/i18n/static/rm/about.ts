import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../types';

export const about: PageDefinition = {
  title: 'About ANQR',
  description: 'ANQR is a free QR code generator with a client-first approach - generate QR codes locally or use our API for embedding.',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: '/?lang=${lang}', label: 'Open the generator', type: 'generator' },
    { href: '/learn?lang=${lang}', label: 'Browse Learn articles', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: 'Privacy Policy', type: 'external' },
    { href: '/terms?lang=${lang}', label: 'Terms of Service', type: 'external' },
  ],
  sections: [
    {
      heading: 'What is ANQR?',
      paragraphs: ['ANQR (pronounced "anchor") is a free QR code generator that creates scannable codes for URLs, text, Wi-Fi credentials, contact cards, calendar events, and more.', 'It is built for individuals, small businesses, marketers, and developers who want powerful QR tools without signing up. The client-first design means QR codes are generated locally in your browser by default, with an optional server API for professional embedding and integration.'],
    },
    {
      heading: 'Key features',
      bullets: ['Generate QR codes instantly in your browser - no account required.', 'Customise colours, module styles, finder patterns, and add image overlays.', 'Export in multiple formats: PNG, SVG, WebP, and animated GIF.', 'Advanced controls for error correction level, QR version, encoding mode, and mask selection.', 'Scan-safety guidance and live preview to help keep codes readable in print and on screens.', 'Server-side API for professional embedding with full parameter support.', 'Works offline once loaded - it is a static web app you can run anywhere.'],
    },
    {
      heading: 'How ANQR works',
      paragraphs: ['ANQR runs in your browser and encodes your input into a standard QR matrix with Reed–Solomon error correction, then renders it to the format you choose.', 'By default, generation happens locally in your browser. For professional use, you can also use the server-side API to generate QR codes via URL parameters - perfect for embedding in websites, emails, or automated workflows.', 'When you add overlays or animations, ANQR balances styling with scan reliability so the result remains scannable.', 'ANQR focuses on static codes (the data is inside the QR). If you need a dynamic code (editable destination), you can encode your own redirect URL or short link.'],
    },
    {
      heading: 'Who operates ANQR?',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: 'Advertising and how we stay free',
      paragraphs: ['ANQR is free to use and is supported by advertising. We may show ads via Google AdSense and/or other advertising partners.', 'Ad providers may use cookies or similar technologies to personalise ads based on your interests and browsing activity. You can manage ad preferences in your device settings and through Google ad settings, and learn more in our Privacy Policy.', 'We do not sell the content you encode into QR codes. Ads help cover the cost of running and improving the project.'],
    },
    {
      heading: 'Open standards',
      paragraphs: ['ANQR generates QR codes based on the ISO/IEC 18004 standard and aims for broad compatibility across scanners, cameras, and print workflows.'],
    },
    {
      heading: 'Trademark notice',
      paragraphs: ['QR Code® is a registered trademark of DENSO WAVE INCORPORATED. ANQR is not affiliated with, endorsed by, or sponsored by DENSO WAVE INCORPORATED.'],
    },
    {
      heading: 'Feedback and contributions',
      paragraphs: ['We welcome feedback, bug reports, and feature suggestions. Please get in touch via email or the contact page - we read every message, though response times may vary.'],
    },
  ],
};

export default about;
