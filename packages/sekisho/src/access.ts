import { createStackLessError } from './create-stackless-error';

export class AccessRestrictedError extends Error {
  public readonly name = 'AccessRestrictedError';
  public readonly accessRestricted = true;
  public readonly $sekishoError = true;
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
