'use client';

export {
  needLogin,
  isNeedLoginError,
  NotAuthenticatedError,
  NotAuthenticatedContainer,
  type NotAuthenticatedContainerProps,
  NotAuthenticatedErrorWrapper,
  type NotAuthenticatedErrorWrapperProps,
  type NotAuthenticatedFallbackProps,
  useNotAuthenticatedReset
} from './auth';

export {
  accessRestricted,
  isAccessRestrictedError,
  AccessRestrictedError,
  AccessRestrictedContainer,
  type AccessRestrictedContainerProps,
  AccessRestrictedErrorWrapper,
  type AccessRestrictedErrorWrapperProps,
  type AccessRestrictedFallbackProps,
  useAccessRestrictedReset
} from './access';
