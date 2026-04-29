'use client';

export {
  needLogin,
  isNeedLoginError,
  NotAuthenticatedError
} from './auth';

export {
  SekishoErrorWrapper,
  type SekishoErrorWrapperProps
} from './auth-error-wrapper';

export {
  SekishoErrorBoundary,
  type SekishoErrorBoundaryProps
} from './auth-error-boundary';

export {
  type SekishoOptions
} from './options';

export {
  SekishoProvider,
  type SekishoProviderProps
} from './provider';

export {
  accessRestricted,
  isAccessRestrictedError,
  AccessRestrictedError
} from './access';

export {
  SekishoAccessContainer,
  type SekishoAccessContainerProps
} from './access-container';
