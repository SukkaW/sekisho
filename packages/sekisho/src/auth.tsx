'use client';

import { useLayoutEffect } from 'foxact/use-isomorphic-layout-effect';
import { useStableHandler } from 'foxact/use-stable-handler-only-when-you-know-what-you-are-doing-or-you-will-be-fired';
import { createSekisho } from './factory';
import { useSekishoOptions } from './options';

// ========== Basic Util

const [
  needLogin,
  NeedLoginBoundary,
  isNeedLoginError,
  NotAuthenticatedError
] = createSekisho('NotAuthenticatedError');

// We do not export raw NeedLoginBoundary, instead we export wrapped NotAuthenticatedBoundary
export { needLogin, isNeedLoginError, NotAuthenticatedError };

// ========== Error Wrapper

export interface NotAuthenticatedErrorWrapperProps extends React.PropsWithChildren {
  error: unknown | null | undefined
}

/** @deprecated `SekishoErrorWrapperProps` has since been renamed to `NotAuthenticatedErrorWrapperProps` */
export type SekishoErrorWrapperProps = NotAuthenticatedErrorWrapperProps;

/**
 * The actual error handling and redirection logic for "Not Authenticated" error.
 *
 * Used internally by `NotAuthenticatedBoundary`. You can also use this directly in
 * a Next.js `app/error.tsx` file for custom error handling.
 */
export function NotAuthenticatedErrorWrapper({ error, children }: NotAuthenticatedErrorWrapperProps) {
  const { onNeedLogin } = useSekishoOptions();

  const notAuthenticated = isNeedLoginError(error);
  const handleNeedLogin = useStableHandler(onNeedLogin);

  useLayoutEffect(() => {
    if (notAuthenticated) {
      handleNeedLogin();
    }
  }, [notAuthenticated, handleNeedLogin]);

  if (notAuthenticated) {
    return null;
  }

  return children;
}

export {
  /** @deprecated `SekishoErrorWrapper` has since been renamed to `NotAuthenticatedErrorWrapper` */
  NotAuthenticatedErrorWrapper as SekishoErrorWrapper
};

// ========== Error Boundary

export interface NotAuthenticatedBoundaryProps extends React.PropsWithChildren { }

/**
 * Error boundary that catches `NotAuthenticatedError` thrown by `needLogin()`
 * within its subtree and calls the `onNeedLogin` callback from `SekishoProvider`.
 * All other errors are re-thrown to the next boundary up the tree.
 *
 * This is included inside `SekishoProvider` automatically; you only need to use
 * it directly if you want a narrower boundary for a specific subtree.
 */
export function NotAuthenticatedBoundary({ children }: NotAuthenticatedBoundaryProps): React.ReactNode {
  return (
    <NeedLoginBoundary fallbackComponent={NotAuthenticatedErrorWrapper}>
      {children}
    </NeedLoginBoundary>
  );
}

/** @deprecated `SekishoErrorBoundaryProps` has since been renamed to `NotAuthenticatedBoundaryProps` */
export type SekishoErrorBoundaryProps = NotAuthenticatedBoundaryProps;

export {
  /** @deprecated `SekishoErrorBoundary` has since been renamed to `NotAuthenticatedBoundary` */
  NotAuthenticatedBoundary as SekishoErrorBoundary
};
