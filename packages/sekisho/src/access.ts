'use client';

import { createSekisho } from './factory';
import type { SekishoContainerProps, SekishoErrorWrapperProps } from './factory';

export const [
  accessRestricted,
  AccessRestrictedContainer,
  AccessRestrictedErrorWrapper,
  isAccessRestrictedError,
  AccessRestrictedError
] = createSekisho('AccessRestrictedError');

export type AccessRestrictedContainerProps = SekishoContainerProps;
export type AccessRestrictedErrorWrapperProps = SekishoErrorWrapperProps;
