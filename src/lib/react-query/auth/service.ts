import {Api} from '@lib/ky';
import {MutationFunction} from '@tanstack/react-query';

import {SignInRequest, SignInResponse} from './types';

// Services
const signIn: MutationFunction<SignInResponse, SignInRequest> = async data => {
  const resp = await Api.post('api/signin', {json: data}).json<SignInResponse>();
  return resp;
};

export const AuthServices = {
  signIn,
};
