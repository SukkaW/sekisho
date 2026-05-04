'use client';

import { createSekisho } from './factory';
import type { SekishoGuardBoundaryProps } from './factory';

export const [
  accessRestricted,
  AccessRestrictedContainer,
  isAccessRestrictedError,
  AccessRestrictedError
] = createSekisho('AccessRestrictedError');

export type AccessRestrictedContainerProps = SekishoGuardBoundaryProps;

/** @deprecated `SekishoAccessContainer` has since been renamed to `AccessRestrictedContainer` */
export const SekishoAccessContainer = AccessRestrictedContainer;
/** @deprecated `SekishoAccessContainerProps` has since been renamed to `AccessRestrictedContainerProps` */
export type SekishoAccessContainerProps = AccessRestrictedContainerProps;
