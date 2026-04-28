import { createStacklessError } from 'foxact/create-stackless-error';

export class NotAuthenticatedError extends Error {
  public readonly name = 'NotAuthenticatedError';
  public readonly notAuthenticated = true;
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

export function isNeedLoginError(error: unknown): error is NotAuthenticatedError {
  return (
    !!error
    && typeof error === 'object'
    && 'notAuthenticated' in error
    && error.notAuthenticated === true
    && '$sekishoError' in error
    && error.$sekishoError === true
  );
}

/**
 * Throw a `NotAuthenticatedError` from anywhere in the React render phase.
 *
 * The error is caught by the nearest `SekishoErrorWrapper` or
 * `SekishoErrorBoundary`, which then calls the `onNeedLogin` callback supplied
 * to `SekishoProvider`.
 *
 * Common call sites: ky afterResponse hooks (HTTP 401), SWR middleware, or
 * directly inside a component when session state is absent.
 */
export function needLogin(message: string): never {
  throw createStacklessError(() => new NotAuthenticatedError(message));
}
