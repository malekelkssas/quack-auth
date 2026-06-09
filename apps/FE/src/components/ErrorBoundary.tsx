import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * App-wide error boundary. Without it, any render-time throw unmounts the whole
 * React tree and leaves a silent blank screen. This catches the error, keeps a
 * visible recovery UI on screen, and logs the cause so it can be diagnosed.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught render error:', error, info);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-duck-navy px-6 text-center font-body text-foreground">
        <h1 className="font-pixel text-[13px] leading-[1.9] text-duck-amber">
          THE POND WENT QUIET.
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Something tripped up the detective. Reload to get back on the case.
        </p>
        <pre className="max-w-md overflow-x-auto rounded-md border-2 border-secondary bg-card px-3 py-2 text-left text-sm text-destructive">
          {error.message}
        </pre>
        <button
          type="button"
          onClick={this.handleReload}
          className="rounded-md border-2 border-duck-amber bg-duck-amber px-4 py-3 font-pixel text-[9px] uppercase tracking-wider text-primary-foreground transition-colors hover:bg-card hover:text-duck-amber active:scale-[0.97]"
        >
          [ Reload ]
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
