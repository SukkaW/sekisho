// This file is an Error Boundary implementation that works for Next.js App Router error page

'use client';

// Error components must be Client Components

import { Component as ReactClassComponent } from 'react';
import { isNeedLoginError } from './auth';
import { SekishoErrorWrapper } from './auth-error-wrapper';

export interface SekishoErrorBoundaryProps extends React.PropsWithChildren {}

interface SekishoErrorBoundaryState {
  needLoginErrorObject: unknown | null | undefined
}

export class SekishoErrorBoundary extends ReactClassComponent<SekishoErrorBoundaryProps, SekishoErrorBoundaryState> {
  constructor(props: SekishoErrorBoundaryProps) {
    super(props);
    this.state = { needLoginErrorObject: null };
  }

  static getDerivedStateFromError(this: void, error: unknown): SekishoErrorBoundaryState {
    if (isNeedLoginError(error)) {
      return { needLoginErrorObject: error };
    }

    // Re-throw if error is not for login requirement
    throw error;
  }

  // Explicit type is needed to avoid the generated `.d.ts` having a wide return type that could be specific to the `@types/react` version.
  render(): React.ReactNode {
    if (this.state.needLoginErrorObject) {
      return (
        <SekishoErrorWrapper error={this.state.needLoginErrorObject}>
          {this.props.children}
        </SekishoErrorWrapper>
      );
    }

    return this.props.children;
  }
}
