export { Gallery } from './gallery';
export { StaticPage } from './static-page';
export { WelcomeModal } from './welcome-modal';
export type { CapacitorAppPlugin } from './capacitor-app-plugin';
export { log } from './log';
import { lazy } from 'react';
export const Analyze = lazy(() => import('@/components/Analyze').then((m) => ({ default: m.Analyze })));
