'use client';

import { NotAuthenticatedBoundary } from './auth';
import { SekishoOptionsContext } from './options';
import type { SekishoOptions } from './options';

export interface SekishoProviderProps extends React.PropsWithChildren, SekishoOptions {}

export function SekishoProvider({ children, ...auth }: SekishoProviderProps) {
  return (
    // eslint-disable-next-line @eslint-react/no-context-provider -- backward compat with older versions of React
    <SekishoOptionsContext.Provider value={auth}>
      <NotAuthenticatedBoundary>
        {children}
      </NotAuthenticatedBoundary>
    </SekishoOptionsContext.Provider>
  );
}
