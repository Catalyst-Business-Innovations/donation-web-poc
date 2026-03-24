import { ErrorHandler, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    if (!environment.production) {
      console.error('[GlobalErrorHandler]', error);
      return;
    }

    // Production: build structured error for tracking service.
    // Do NOT log to console — prevents information disclosure.
    const structuredError = {
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: window.location.href,
    };

    // TODO: Replace with actual error tracking integration
    // e.g., Sentry.captureException(error);
    // e.g., datadogRum.addError(error);
    void structuredError; // Prevent unused variable warning until tracking is wired
  }
}
