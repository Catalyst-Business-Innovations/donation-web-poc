import { ErrorHandler, Injectable, inject } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    // Log to console in development
    console.error('[GlobalErrorHandler]', error);
    // TODO: Send to error tracking service (Sentry/DataDog) in production
  }
}
