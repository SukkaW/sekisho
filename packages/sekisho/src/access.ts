'use client';

import { createSekisho } from './factory';
import type { SekishoContainerProps, SekishoErrorWrapperProps, SekishoFallbackComponentProps } from './factory';

export const [
  accessRestricted,
  AccessRestrictedContainer,
  AccessRestrictedErrorWrapper,
  isAccessRestrictedError,
  AccessRestrictedError,
  useAccessRestrictedReset
] = createSekisho('AccessRestrictedError');

export type AccessRestrictedContainerProps = SekishoContainerProps;
export type AccessRestrictedErrorWrapperProps = SekishoErrorWrapperProps;
export type AccessRestrictedFallbackProps = SekishoFallbackComponentProps;
