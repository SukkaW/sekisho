import { createStackLessError } from './create-stackless-error';

export class AccessRestrictedError extends Error {
  public readonly name = 'AccessRestrictedError';
  public readonly accessRestricted = true;
  public readonly $sekishoError = true;
  /**
   * Normally, when React encounters an error during rendering in the server,
   * it will find the nearest Suspense boundary and render its fallback (on
   * the client it would find the nearest error boundary instead).
   *
   * For various purposes, Next.js also uses this mechanism to bail out of
   * server-side rendering to do client-side rendering only. Thus Next.js
   * create this magic digest 'BAILOUT_TO_CLIENT_SIDE_RENDERING' that does
   * nothing but allow every error report (console, reportError, etc.) to
   * skip this error
   *
   * Next.js doesn't handle this error in any special way. It is React itself
   * who contains the "special handling".
   *
   * So we can safely re-use this digest to make sure that the error is not
   * reported by Next.js
   */
  public readonly digest = 'BAILOUT_TO_CLIENT_SIDE_RENDERING';
}

export function isAccessRestrictedError(error: unknown): error is AccessRestrictedError {
  return (
    !!error
    && typeof error === 'object'
    && 'accessRestricted' in error
    && error.accessRestricted === true
    && '$sekishoError' in error
    && error.$sekishoError === true
  );
}

/**
 * Throw an `AccessRestrictedError` from anywhere in the React render phase.
 *
 * The error is caught by the nearest `SekishoAccessContainer`, which renders
 * its `fallback` prop instead of its children. Any other error boundary in the
 * tree (including `SekishoErrorBoundary`) re-throws it unchanged.
 */
export function accessRestricted(message: string): never {
  throw createStackLessError(() => new AccessRestrictedError(message));
}
