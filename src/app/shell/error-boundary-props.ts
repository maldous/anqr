import type { ReactNode } from 'react';

export type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};
