import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorDisplayProps {
  error: Error | null;
  onRetry?: () => void;
  resetErrorBoundary?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  resetErrorBoundary
}) => {
  const handleRetry = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else if (onRetry) {
      onRetry();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-2xl">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">
            Something went wrong. We're sorry for the inconvenience.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 rounded-md">
              <p className="font-medium text-sm mb-1">Error Details:</p>
              <p className="text-sm">{error.message}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleRetry} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              Refresh Page
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
