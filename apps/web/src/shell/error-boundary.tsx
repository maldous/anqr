/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs them, and displays a fallback UI instead of crashing the app.
 */

import { Component, type ErrorInfo } from "react";
import { createLogger } from "@/infra/logging/logger";
import { ErrorFallbackUI } from "./error-fallback-ui";
import type { ErrorBoundaryProps } from "./error-boundary-props.types";
import type { ErrorBoundaryState } from "./error-boundary-state.types";

const log = createLogger("ERROR");

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error using canonical logger (sends to Sentry automatically)
    log.error("ErrorBoundary caught an error", {
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
