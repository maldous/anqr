import { lazy } from 'react';

export const Gallery = lazy(() =>
  import('@/components/Gallery').then((m) => ({ default: m.Gallery }))
);
