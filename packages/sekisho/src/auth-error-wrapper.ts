'use client';

import { useLayoutEffect } from 'foxact/use-isomorphic-layout-effect';
import { useSekishoOptions } from './options';
import { useStableHandler } from 'foxact/use-stable-handler-only-when-you-know-what-you-are-doing-or-you-will-be-fired';
import { isNeedLoginError } from './auth';

export interface SekishoErrorWrapperProps extends React.PropsWithChildren {
  error: unknown | null | undefined
}

/**
 * The actual error handling and redirection logic for "Not Authenticated" error
 *
 * This is used internally by SekishoErrorBoundary. And if you are using Next.js App Router,
 * you can use this directly in the "error.tsx" file.
 */
export function SekishoErrorWrapper({ error, children }: SekishoErrorWrapperProps) {
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
