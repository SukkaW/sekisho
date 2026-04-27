declare global {
  interface ErrorConstructor {
    /**
     * The `Error.stackTraceLimit` property is v8 only, add this to the type with nullish
     */
    stackTraceLimit?: number
  }
}

const stlProp = Object.getOwnPropertyDescriptor(
  Error,
  'stackTraceLimit'
);
const hasSTL = stlProp?.writable && typeof stlProp.value === 'number';

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
 * This is a shortcut function to throw a "Not Authenticated" error.
 *
 * This can be used in ky's interceptor hooks, when HTTP 401 is detected, we can simply call this
 * This can also be used in SWR middleware, when API response JSON contains a known "not authenticated" error, we can call this
 */
export function needLogin(message: string): never {
  // Error is very expensive, runtime has to collect error stack trace, consuming more memory.
  // Also, Next.js <HotReloader /> will catch any propogated error and show a red box.
  //
  // However, though very tempting to throw any regular object, such as `throw { notAuthenticated: true }`,
  // it is still be able to be caught by React Error Boundary, but it is very dangerous.
  // To be safe, let's try to patch stack trace limit instead to create 0 stack trace error

  const originalStackTraceLimit = Error.stackTraceLimit;

  // This is *only* safe to do when we know that nothing at any point in the
  // stack relies on the `Error.stack` property of the NotAuthenticatedError.
  if (hasSTL) {
    Error.stackTraceLimit = 0;
  }

  const error = new NotAuthenticatedError(message);

  // Restore the stack trace limit to its original value after the error has
  // been created.
  if (hasSTL) {
    Error.stackTraceLimit = originalStackTraceLimit;
  }

  throw error;
}
