declare global {
  interface ErrorConstructor {
    /**
     * The `Error.stackTraceLimit` property is v8 only, add this to the type with nullish
     */
    stackTraceLimit?: number
  }
}

const stlProp = Object.getOwnPropertyDescriptor(Error, 'stackTraceLimit');
const hasSTL = stlProp?.writable && typeof stlProp.value === 'number';

/**
 * Creates a sekisho error with a zero stack trace on V8.
 *
 * Error stack trace collection is expensive and the stack is never useful for
 * these control-flow errors. On non-V8 runtimes this is a no-op.
 */
export function createStackLessError<T extends Error>(factory: () => T): T {
  const originalStackTraceLimit = Error.stackTraceLimit;
  if (hasSTL) {
    Error.stackTraceLimit = 0;
  }
  const error = factory();
  if (hasSTL) {
    Error.stackTraceLimit = originalStackTraceLimit;
  }
  return error;
}
