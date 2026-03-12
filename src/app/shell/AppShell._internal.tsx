import { lazy } from 'react';
import { createLogger } from '@/infra/logging/logger';

// Lazy-loaded components for bundle optimization
const Analyze = lazy(() => import('@/components/Analyze').then((m) => ({ default: m.Analyze })));

export const Gallery = lazy(() => import('@/components/Gallery').then((m) => ({ default: m.Gallery })));

export const StaticPage = lazy(() =>
  import('@/components/StaticPage').then((m) => ({ default: m.StaticPage }))
);

export const WelcomeModal = lazy(() =>
  import('@/components/WelcomeModal').then((m) => ({ default: m.WelcomeModal }))
);

export type CapacitorAppPlugin = {
  exitApp?: () => Promise<void> | void;
};

export const log = createLogger('APP');

export { Analyze };
