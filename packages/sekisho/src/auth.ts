'use client';

import { createSekisho } from './factory';
import type { SekishoContainerProps, SekishoErrorWrapperProps, SekishoFallbackComponentProps } from './factory';

export const [
  needLogin,
  NotAuthenticatedContainer,
  NotAuthenticatedErrorWrapper,
  isNeedLoginError,
  NotAuthenticatedError,
  useNotAuthenticatedReset
] = createSekisho('NotAuthenticatedError');

export type NotAuthenticatedContainerProps = SekishoContainerProps;
export type NotAuthenticatedErrorWrapperProps = SekishoErrorWrapperProps;
export type NotAuthenticatedFallbackProps = SekishoFallbackComponentProps;
