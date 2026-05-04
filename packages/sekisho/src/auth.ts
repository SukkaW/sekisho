'use client';

import { createSekisho } from './factory';
import type { SekishoContainerProps, SekishoErrorWrapperProps } from './factory';

export const [
  needLogin,
  NotAuthenticatedContainer,
  NotAuthenticatedErrorWrapper,
  isNeedLoginError,
  NotAuthenticatedError
] = createSekisho('NotAuthenticatedError');

export type NotAuthenticatedContainerProps = SekishoContainerProps;
export type NotAuthenticatedErrorWrapperProps = SekishoErrorWrapperProps;
