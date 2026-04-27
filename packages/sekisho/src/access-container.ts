'use client';

import { Component as ReactClassComponent } from 'react';
import { isAccessRestrictedError } from './access';

export interface SekishoAccessContainerProps extends React.PropsWithChildren {
  fallback: React.ReactNode
}

interface State {
  restricted: boolean
}

/**
 * Error boundary that catches `AccessRestrictedError` thrown by
 * `accessRestricted()` within its subtree and renders `fallback` in place of
 * `children`. All other errors are re-thrown to the next boundary up the tree.
 */
export class SekishoAccessContainer extends ReactClassComponent<SekishoAccessContainerProps, State> {
  constructor(props: SekishoAccessContainerProps) {
    super(props);
    this.state = { restricted: false };
  }

  static getDerivedStateFromError(this: void, error: unknown): State {
    if (isAccessRestrictedError(error)) {
      return { restricted: true };
    }
    throw error;
  }

  render(): React.ReactNode {
    if (this.state.restricted) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
