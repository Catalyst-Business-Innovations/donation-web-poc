import { ErrorHandler, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    if (!environment.production) {
      // Log full error to console in development
      console.error('[GlobalErrorHandler]', error);
    } else {
      // Structured error object for production tracking
      const structuredError = {
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        url: window.location.href,
      };
      // TODO: Send structuredError to error tracking service (Sentry/DataDog)
      console.error('[GlobalErrorHandler]', structuredError);
    }
  }
}
