import React, { ErrorInfo, ReactNode } from 'react';
import { ErrorDisplay } from '@/components/layout/error-display';
import ErrorLogger from '@/lib/error-logger';

interface AdminErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface AdminErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AdminErrorBoundary extends React.Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
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
        <div className="p-4">
          <ErrorDisplay
            error={this.state.error}
            onRetry={this.handleRetry}
            resetErrorBoundary={this.handleRetry}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
