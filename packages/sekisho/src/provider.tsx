'use client';

import { SekishoErrorBoundary } from './auth-error-boundary';
import { SekishoOptionsContext } from './options';
import type { SekishoOptions } from './options';

export interface SekishoProviderProps extends React.PropsWithChildren, SekishoOptions {}

export function SekishoProvider({ children, ...auth }: SekishoProviderProps) {
  return (
    // eslint-disable-next-line @eslint-react/no-context-provider -- backward compat with older versions of React
    <SekishoOptionsContext.Provider value={auth}>
      <SekishoErrorBoundary>
        {children}
      </SekishoErrorBoundary>
    </SekishoOptionsContext.Provider>
  );
}
