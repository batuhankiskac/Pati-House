import React, { ErrorInfo, ReactNode } from 'react';
import { ErrorDisplay } from '@/components/layout/error-display';
import ErrorLogger from '@/lib/error-logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error with our error logger
    ErrorLogger.log(error, { componentStack: errorInfo.componentStack || undefined });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorDisplay
          error={this.state.error}
          onRetry={this.handleRetry}
          resetErrorBoundary={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
