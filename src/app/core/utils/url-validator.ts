import { environment } from '../../../environments/environment';

/** Validates a URL is safe for redirect (same origin or allowed domain) */
export function isSafeRedirectUrl(url: string): boolean {
  if (url.startsWith('/')) return true; // relative URLs are safe
  try {
    const parsed = new URL(url);
    const allowedDomains = [environment.domainName, 'localhost', '127.0.0.1'];
    return allowedDomains.some(
      (domain) => parsed.hostname === domain || parsed.hostname.endsWith('.' + domain),
    );
  } catch {
    return false; // malformed URL
  }
}
