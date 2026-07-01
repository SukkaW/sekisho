'use client';

import { createStacklessError } from 'foxact/create-stackless-error';
import { nullthrow } from 'foxact/nullthrow';
import { Component as ReactClassComponent, createContext, useContext } from 'react';

/** Base interface for every guard error created by `createSekisho`. */
export interface SekishoGuardError extends Error {
  readonly digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
}

/**
 * Props passed to a `fallbackComponent` when the guard fires.
 */
export interface SekishoFallbackComponentProps {
  error: SekishoGuardError,
  /**
   * Clears the caught error and re-renders children, like a regular error
   * boundary reset. Only `undefined` when the fallback is rendered through
   * `ErrorWrapper` inside a framework error boundary and no `reset` prop was
   * forwarded to `ErrorWrapper`.
   */
  reset?: () => void
}

/**
 * Props accepted by the container component returned from `createSekisho`.
 *
 * Exactly one of `fallback` or `fallbackComponent` must be provided:
 *
 * - `fallback` — a static `ReactNode` rendered in place of children when the
 *   guard fires (access-control pattern).
 * - `fallbackComponent` — a React component that receives `{ error, reset }` as props.
 *   The `error` prop will only be `null` when the error is thrown in the server
 */
export type SekishoContainerProps = React.PropsWithChildren & (
  | { fallback: React.ReactNode, fallbackComponent?: never }
  | { fallback?: never, fallbackComponent: React.ComponentType<SekishoFallbackComponentProps> }
);

/**
 * Props accepted by the `ErrorWrapper` component returned from `createSekisho`.
 *
 * Mirrors the shape of framework error boundary props (Next.js `error.tsx`,
 * React Router `errorElement`, etc.) so the component can be used as a direct
 * wrapper without any adapter layer.
 */
export interface SekishoErrorWrapperProps extends React.PropsWithChildren {
  error: unknown,
  /**
   * The framework error boundary's own reset function (e.g. the `reset` prop of
   * Next.js `error.tsx`). Forwarded to `fallbackComponent` and to the `useReset`
   * hook so the fallback UI can recover from the error.
   */
  reset?: () => void
}

interface SekishoGuardBoundaryState {
  error: unknown | null
}

/**
 * Creates a paired guard throw function, container component, error wrapper,
 * type guard, and error class — all isolated from every other guard in the tree.
 *
 * Call the returned throw function anywhere in the React render phase to signal
 * that a condition is unmet. The nearest container component in the tree will
 * catch it and render its `fallback` prop instead of `children`. Every other
 * error boundary — including ones from other `createSekisho()` calls —
 * re-throws the error unchanged.
 *
 * The container component stores its `fallback`/`fallbackComponent` in context so
 * that `ErrorWrapper` can reuse it from a framework error boundary (e.g. Next.js
 * `error.tsx` or React Router `errorElement`) without repeating the redirect logic.
 *
 * Returns a 6-tuple so each element can be named freely on destructure:
 * `[throwFn, ContainerComponent, ErrorWrapper, isError, ErrorClass, useReset]`
 *
 * @example
 * // Access-control pattern — static fallback element:
 * const [requireOnboarding, OnboardingGate] = createSekisho();
 *
 * <OnboardingGate fallback={<OnboardingWizard />}>
 *   <Profile />
 * </OnboardingGate>
 *
 * @example
 * // Auth pattern — render-phase redirect:
 * const [requireAuth, AuthGate, AuthErrorWrapper] = createSekisho();
 *
 * function LoginRedirect(): never { redirect('/login'); }
 *
 * // In layout:
 * <AuthGate fallbackComponent={LoginRedirect}>{children}</AuthGate>
 *
 * // In Next.js error.tsx:
 * export default function ErrorPage({ error, reset }) {
 *   return <AuthErrorWrapper error={error}>...</AuthErrorWrapper>;
 * }
 *
 * // In React Router errorElement:
 * const ErrorComponent = () => {
 *   const error = useRouteError();
 *   return <AuthErrorWrapper error={error}>...</AuthErrorWrapper>;
 * }
 *
 * { errorElement: <ErrorComponent /> }
 *
 * @example
 * // Resetting the boundary from a static `fallback` element:
 * const [requireAuth, AuthGate, , , , useAuthGateReset] = createSekisho();
 *
 * function RetryButton() {
 *   const reset = useAuthGateReset();
 *   return <button type="button" onClick={reset}>Try again</button>;
 * }
 *
 * <AuthGate fallback={<RetryButton />}>{children}</AuthGate>
 */
export function createSekisho(errorName?: string): [
  throwError: (message: string) => never,
  ContainerComponent: (props: SekishoContainerProps) => React.ReactNode,
  ErrorWrapper: (props: SekishoErrorWrapperProps) => React.ReactNode,
  isError: (error: unknown) => error is SekishoGuardError,
  ErrorClass: new (message: string) => SekishoGuardError,
  useReset: () => () => void
] {
  // WeakSet is the identification mechanism: each createSekisho() call
  // gets its own set, so guards never accidentally catch each other's errors.
  const instances = new WeakSet();

  class GuardError extends Error implements SekishoGuardError {
    /**
     * Next.js checks `err.digest === 'BAILOUT_TO_CLIENT_SIDE_RENDERING'` in its
     * `onCaughtError` root callback and returns early, skipping `console.error`
     * and the dev overlay. Setting this digest makes Next.js treat the error as
     * an intentional control-flow signal rather than an unexpected exception.
     */
    public readonly digest = 'BAILOUT_TO_CLIENT_SIDE_RENDERING';

    // eslint-disable-next-line sukka/unicorn/custom-error-definition -- dynamic error name
    public readonly name = errorName ?? 'SekishoGuardError';

    constructor(message: string) {
      super(message);

      instances.add(this);
    }
  }

  function isGuardError(error: unknown): error is GuardError {
    return typeof error === 'object' && error !== null && instances.has(error);
  }

  function throwGuard(message: string): never {
    throw createStacklessError(() => new GuardError(message));
  }

  type ContainerOptions =
    | { fallback: React.ReactNode, fallbackComponent?: never }
    | { fallback?: never, fallbackComponent: React.ComponentType<SekishoFallbackComponentProps> };

  const OptionsContext = createContext<ContainerOptions | null>(null);

  // Reset is delivered through context (instead of only through props) so that
  // a static `fallback` element — which is created before the error even exists —
  // can still reach it via the `useReset` hook, like react-error-boundary's
  // `useErrorBoundary`. Per-factory context keeps nested guards isolated.
  const ResetContext = createContext<(() => void) | null>(null);

  function useReset(): () => void {
    // eslint-disable-next-line @eslint-react/no-use-context -- we need useContext for backward compat
    const reset = useContext(ResetContext);
    return nullthrow(reset, 'useReset() must be called from within a fallback rendered by its corresponding container component (or pass `reset` to <ErrorWrapper /> when using a framework error boundary)');
  }

  // Single shared render path: reads options from context and renders the
  // appropriate fallback. Used by both SekishoErrorBoundary (when it catches
  // a guard error) and ErrorWrapper (when a framework error boundary receives one).
  function ErrorWrapper({ error, reset, children }: SekishoErrorWrapperProps): React.ReactNode {
    // eslint-disable-next-line @eslint-react/static-components, @eslint-react/no-use-context -- component as a prop is a thing, and we need useContext for backward compat
    const options = nullthrow(useContext(OptionsContext), '<ErrorWrapper /> must be used within its corresponding container component');

    if (isGuardError(error)) {
      const { fallback, fallbackComponent: FallbackComponent } = options;
      return (
        // eslint-disable-next-line @eslint-react/no-context-provider -- backward compat with older versions of React
        <ResetContext.Provider value={reset ?? null}>
          {/* eslint-disable-next-line @eslint-react/static-components -- component as a prop is a thing */}
          {FallbackComponent ? <FallbackComponent error={error} reset={reset} /> : fallback}
        </ResetContext.Provider>
      );
    }

    // if ErrorWrapper is rendered by our own error boundary, we will never reach here
    // if ErrorWrapper is rendered by a framework error boundary, we want to render original error boundary as children
    return children;
  }

  class ErrorBoundary extends ReactClassComponent<React.PropsWithChildren, SekishoGuardBoundaryState> {
    constructor(props: React.PropsWithChildren) {
      super(props);
      this.state = { error: null };
    }

    static getDerivedStateFromError(this: void, error: unknown): SekishoGuardBoundaryState {
      return { error };
    }

    reset = (): void => {
      this.setState({ error: null });
    };

    render(): React.ReactNode {
      const caughtError = this.state.error;

      // No error — render children normally
      if (caughtError === null) {
        return this.props.children;
      }

      // Guard error — delegate to ErrorWrapper which reads options from context
      if (isGuardError(caughtError)) {
        return <ErrorWrapper error={caughtError} reset={this.reset} />;
      }

      // Not our error — re-throw to bubble to the next boundary up
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- re-throwing what we caught
      throw caughtError;
    }
  }

  function ContainerComponent({ children, ...options }: SekishoContainerProps): React.ReactNode {
    return (
      // eslint-disable-next-line @eslint-react/no-context-provider -- backward compat with older versions of React
      <OptionsContext.Provider value={options}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </OptionsContext.Provider>
    );
  }

  return [throwGuard, ContainerComponent, ErrorWrapper, isGuardError, GuardError, useReset];
}
