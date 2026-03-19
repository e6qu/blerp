import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | undefined;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack?: string | null }) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            An unexpected error occurred. Please try again or return to the home page.
          </p>
          {this.state.error && (
            <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-gray-100 dark:bg-gray-700 p-3 text-left text-xs text-gray-700 dark:text-gray-200">
              {this.state.error.message}
            </pre>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Try Again
            </button>
            <a
              href="/"
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
