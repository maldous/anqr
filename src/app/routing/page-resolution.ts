import type { StaticPageType } from '@/app/pages/StaticPage';

export type { PageView, ModuleStyleOption } from './page-resolution.types';
import type { PageView } from './page-resolution.types';

export function getPageFromLocation(): PageView {
  // NOSONAR - This regex is safe: /\/+$/ has no backtracking risk (simple trailing slash removal)
  const path = globalThis.location.pathname.replace(/\/+$/, '') || '/';
  const hash = globalThis.location.hash.replace(/^#/, '');

  // Prefer clean paths when present.
  if (path === '/analyze') return 'analyze';
  if (path === '/gallery') return 'gallery';
  if (path === '/guide') return 'guide';
  if (path === '/learn') return 'learn';
  if (path === '/examples') return 'examples';
  if (path === '/translate') return 'translate';
  if (path === '/about') return 'about';
  if (path === '/privacy') return 'privacy';
  if (path === '/terms') return 'terms';
  if (path === '/contact') return 'contact';

  // Backward-compatible hash routes.
  if (hash === 'gallery') return 'gallery';
  if (
    hash === 'about' ||
    hash === 'privacy' ||
    hash === 'terms' ||
    hash === 'contact' ||
    hash === 'guide'
  )
    return hash as StaticPageType;

  return 'editor';
}
