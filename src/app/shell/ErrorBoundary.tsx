/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs them, and displays a fallback UI instead of crashing the app.
 */

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/primitives/button';
import { createLogger } from '@/infra/logging/logger';

const log = createLogger('ERROR');

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

// Functional component for the error UI (to use hooks)
const ErrorFallbackUI = ({
  error,
  onRetry,
}: Readonly<{ error: Error | null; onRetry: () => void }>) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {t('error.title', 'Something went wrong')}
          </h1>
          <p className="text-muted-foreground">
            {t(
              'error.description',
              'An unexpected error occurred. Please try refreshing the page.'
            )}
          </p>
        </div>

        {import.meta.env.DEV && error && (
          <div className="bg-muted rounded-lg p-4 text-left">
            <p className="text-sm font-mono text-destructive break-all">{error.message}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onRetry} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('error.retry', 'Try Again')}
          </Button>
          <Button
            onClick={() => {
              globalThis.location.href = '/';
            }}
            variant="outline"
          >
            {t('error.goHome', 'Go to Home')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error using canonical logger (sends to Sentry automatically)
    log.error('ErrorBoundary caught an error', {
      error,
      componentStack: errorInfo.componentStack,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallbackUI error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}
