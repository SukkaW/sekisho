'use client';

import { createStacklessError } from 'foxact/create-stackless-error';
import { Component as ReactClassComponent } from 'react';

/** Base interface for every guard error created by `createSekisho`. */
export interface SekishoGuardError extends Error {
  readonly digest: 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
}

/**
 * Props accepted by the boundary component returned from `createSekisho`.
 *
 * Exactly one of `fallback` or `fallbackComponent` must be provided:
 *
 * - `fallback` — a static `ReactNode` rendered in place of children when the
 *   guard fires (access-control pattern).
 * - `fallbackComponent` — a React component that receives `{ error }` as props.
 *   Use this when you need the caught error object, e.g. to trigger a
 *   navigation side-effect (auth pattern).
 */
export type SekishoGuardBoundaryProps = React.PropsWithChildren & (
  | { fallback: React.ReactNode, fallbackComponent?: never }
  | { fallback?: never, fallbackComponent: React.ComponentType<{ error: SekishoGuardError }> }
);

export interface SekishoGuardBoundaryState {
  caughtError: SekishoGuardError | null
}

/**
 * Creates a paired guard throw function, error boundary component, type guard,
 * and error class — all isolated from every other guard in the tree.
 *
 * Call the returned throw function anywhere in the React render phase to signal
 * that a condition is unmet. The nearest boundary component in the tree will
 * catch it and render its `fallback` prop instead of `children`. Every other
 * error boundary — including ones from other `createSekisho()` calls —
 * re-throws the error unchanged.
 *
 * Returns a 4-tuple so each element can be named freely on destructure:
 * `[throwFn, BoundaryComponent, isError, ErrorClass]`
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
 * // Callback pattern — component receives the error object:
 * const [requireAuth, AuthGate] = createSekisho();
 *
 * <AuthGate fallbackComponent={AuthErrorHandler}>
 *   <Dashboard />
 * </AuthGate>
 */
export function createSekisho(errorName?: string): [
  throwError: (message: string) => never,
  BoundaryComponent: React.ComponentClass<SekishoGuardBoundaryProps, SekishoGuardBoundaryState>,
  isError: (error: unknown) => error is SekishoGuardError,
  ErrorClass: new (message: string) => SekishoGuardError
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
    return !!error && typeof error === 'object' && instances.has(error);
  }

  function throwGuard(message: string): never {
    throw createStacklessError(() => new GuardError(message));
  }

  class SekishoErrorBoundary extends ReactClassComponent<SekishoGuardBoundaryProps, SekishoGuardBoundaryState> {
    constructor(props: SekishoGuardBoundaryProps) {
      super(props);
      this.state = { caughtError: null };
    }

    static getDerivedStateFromError(this: void, error: unknown): SekishoGuardBoundaryState {
      if (isGuardError(error)) {
        return { caughtError: error };
      }
      // Not our error — let it propagate to the next boundary up the tree.
      throw error;
    }

    render(): React.ReactNode {
      const { caughtError } = this.state;
      if (caughtError !== null) {
        const { fallback, fallbackComponent: FallbackComponent } = this.props;
        return FallbackComponent ? <FallbackComponent error={caughtError} /> : fallback;
      }
      return this.props.children;
    }
  }

  return [throwGuard, SekishoErrorBoundary, isGuardError, GuardError];
}
