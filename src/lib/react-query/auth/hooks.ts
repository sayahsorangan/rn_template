import {useMQ, UseMQOptions} from '@react-query/custom-hooks';

import {AuthQueryKey} from './keys';
import {AuthServices} from './service';
import {SignInRequest, SignInResponse} from './types';

// Sign In Hook
function useSignIn(options?: UseMQOptions<SignInResponse, SignInRequest>) {
  return useMQ([AuthQueryKey.signIn], AuthServices.signIn, {retry: 0, ...options});
}

export const AuthQueries = {
  useSignIn,
};
