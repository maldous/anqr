export interface SentryLike {
  withScope(callback: (scope: {
    setTag: (k: string, v: string) => void;
    setExtra: (k: string, v: unknown) => void;
    setExtras: (e: Record<string, unknown>) => void;
  }) => void): void;
  captureException(error: unknown): string;
  captureMessage(message: string, captureContext?: unknown): string;
  addBreadcrumb(breadcrumb: {
    category: string;
    message: string;
    level: string;
    data?: Record<string, unknown>;
  }): void;
}

export const sentryModuleState: { module: SentryLike | null } = { module: null };
