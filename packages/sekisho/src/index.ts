'use client';

export {
  needLogin,
  isNeedLoginError,
  NotAuthenticatedError,
  NotAuthenticatedContainer,
  type NotAuthenticatedContainerProps,
  NotAuthenticatedErrorWrapper,
  type NotAuthenticatedErrorWrapperProps
} from './auth';

export {
  accessRestricted,
  isAccessRestrictedError,
  AccessRestrictedError,
  AccessRestrictedContainer,
  type AccessRestrictedContainerProps,
  AccessRestrictedErrorWrapper,
  type AccessRestrictedErrorWrapperProps
} from './access';
