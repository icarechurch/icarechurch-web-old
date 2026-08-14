import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to server-side or monitoring service in production
    const timestamp = new Date().toISOString();
    // Use structured logging rather than console.error to avoid exposing internals
    const message = `[${timestamp}] Render error: ${error.message}`;
    // biome-ignore lint/suspicious/noConsole: intentional boundary logging
    console.error(message, info.componentStack);
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
            <h2 className="font-bold text-2xl">Something went wrong</h2>
            <p className="text-muted-foreground">
              An unexpected error occurred. Please refresh the page.
            </p>
            <button
              className="rounded bg-primary px-4 py-2 text-primary-foreground"
              onClick={() => this.setState({ hasError: false })}
              type="button"
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
