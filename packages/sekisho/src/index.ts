/* eslint-disable @typescript-eslint/no-deprecated -- re-export deprecated items for backward compatibility */
'use client';

export {
  needLogin,
  isNeedLoginError,
  NotAuthenticatedError,
  NotAuthenticatedErrorWrapper,
  type NotAuthenticatedErrorWrapperProps,
  NotAuthenticatedBoundary,
  type NotAuthenticatedBoundaryProps,

  // Deprecated aliases for backward compatibility
  type SekishoErrorWrapperProps,
  SekishoErrorWrapper,
  SekishoErrorBoundary,
  type SekishoErrorBoundaryProps
} from './auth';

export {
  createSekisho,
  type SekishoGuardError,
  type SekishoGuardBoundaryProps,
  type SekishoGuardBoundaryState
} from './factory';

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
  AccessRestrictedError,
  AccessRestrictedContainer,
  type AccessRestrictedContainerProps,

  // Deprecated aliases for backward compatibility
  SekishoAccessContainer,
  type SekishoAccessContainerProps
} from './access';
