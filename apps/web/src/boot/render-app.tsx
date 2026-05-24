import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "../shell/app-shell.types";
import { ErrorBoundary } from "../shell/error-boundary";

export function renderApp(appRoot: HTMLElement): void {
  ReactDOM.createRoot(appRoot).render(
    <React.StrictMode>
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
          }
        >
          <App />
        </Suspense>
      </ErrorBoundary>
    </React.StrictMode>,
  );
}
