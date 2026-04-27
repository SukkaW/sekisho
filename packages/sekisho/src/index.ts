'use client';

export {
  needLogin,
  isNeedLoginError,
  NotAuthenticatedError
} from './error';

export {
  SekishoErrorWrapper,
  type SekishoErrorWrapperProps
} from './error-wrapper';

export {
  SekishoErrorBoundary,
  type SekishoErrorBoundaryProps
} from './error-boundary';

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
