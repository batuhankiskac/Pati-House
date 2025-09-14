// Error logging utility for the application
interface ErrorInfo {
  componentStack?: string;
  [key: string]: any;
}

class ErrorLogger {
  // Log error to console
  static logError(error: Error, info?: ErrorInfo) {
    console.error('[ErrorLogger]', error.message, {
      stack: error.stack,
      componentStack: info?.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      ...info
    });
  }

  // Log error to external service (in production)
  static logToService(error: Error, info?: ErrorInfo) {
    // In a real application, this would send the error to an external service
    // like Sentry, LogRocket, or a custom error tracking API
    if (process.env.NODE_ENV === 'production') {
      // Example implementation:
      // fetch('/api/log-error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     message: error.message,
      //     stack: error.stack,
      //     componentStack: info?.componentStack,
      //     timestamp: new Date().toISOString(),
      //     url: window.location.href,
      //     userAgent: navigator.userAgent,
      //     ...info
      //   })
      // }).catch(console.error);
    }
  }

  // Log error with both console and external service
  static log(error: Error, info?: ErrorInfo) {
    this.logError(error, info);
    this.logToService(error, info);
  }
}

export default ErrorLogger;
