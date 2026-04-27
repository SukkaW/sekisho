import { createStackLessError } from './create-stackless-error';

export class NotAuthenticatedError extends Error {
  public readonly name = 'NotAuthenticatedError';
  public readonly notAuthenticated = true;
  public readonly $sekishoError = true;
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
  throw createStackLessError(() => new NotAuthenticatedError(message));
}
