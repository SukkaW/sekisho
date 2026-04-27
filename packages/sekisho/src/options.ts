import { nullthrow } from 'foxact/nullthrow';
import { createContext, useContext } from 'react';

export interface SekishoOptions {
  onNeedLogin: () => void
}

/** @private */
export const SekishoOptionsContext = createContext<SekishoOptions | null | undefined>(null);

/** @private */
export function useSekishoOptions() {
  // eslint-disable-next-line @eslint-react/no-use-context -- backward compat with older versions of React
  return nullthrow(useContext(SekishoOptionsContext), 'useSekishoOptions must be used within a SekishoOptionsProvider');
}
