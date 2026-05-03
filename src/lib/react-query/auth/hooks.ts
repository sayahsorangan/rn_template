import {useMQ, UseMQOptions} from '@react-query/custom-hooks';

import {AuthQueryKey} from './keys';
import {AuthServices} from './service';
import {RegisterRequest, RegisterResponse, SignInRequest, SignInResponse} from './types';

function useSignIn(options?: UseMQOptions<SignInResponse, SignInRequest>) {
  return useMQ([AuthQueryKey.signIn], AuthServices.signIn, options);
}

function useRegister(options?: UseMQOptions<RegisterResponse, RegisterRequest>) {
  return useMQ([AuthQueryKey.register], AuthServices.register, options);
}

export const AuthQueries = {
  useSignIn,
  useRegister,
};
