import {Api} from '@lib/ky';
import {ApiResponse} from '@models/API/app';
import {MutationFunction} from '@tanstack/react-query';

import {RegisterRequest, RegisterResponse, SignInRequest, SignInResponse} from './types';

const signIn: MutationFunction<SignInResponse, SignInRequest> = async data => {
  const resp = await Api.post('api/auth/login', {json: data}).json<ApiResponse<SignInResponse>>();
  return resp.data;
};

const register: MutationFunction<RegisterResponse, RegisterRequest> = async data => {
  const resp = await Api.post('api/auth/register', {json: data}).json<ApiResponse<RegisterResponse>>();
  return resp.data;
};

export const AuthServices = {
  signIn,
  register,
};
