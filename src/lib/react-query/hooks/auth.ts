/* eslint-disable react-hooks/rules-of-hooks */

import {IUser} from '@models/API/user';
import {useMQ, UseMQOptions, useRQ, UseRQOptions} from '@react-query/custom-hooks';
import {AuthQueryKey} from '@react-query/query-key';
import {AuthService} from '@react-query/service/auth';

export function login(options?: UseMQOptions<IUser.LoginResponse, IUser.LoginRequest>) {
  return useMQ([AuthQueryKey.login], AuthService.login, options);
}

export function register(options?: UseMQOptions<IUser.RegisterResponse, IUser.RegisterRequest>) {
  return useMQ([AuthQueryKey.register], AuthService.register, options);
}

export function getMe(options?: UseRQOptions<IUser.User>) {
  return useRQ([AuthQueryKey.getMe], AuthService.getMe, options);
}

export function updateProfile(options?: UseMQOptions<IUser.UserProfile, IUser.UpdateProfileRequest>) {
  return useMQ([AuthQueryKey.updateProfile], AuthService.updateProfile, options);
}

export function logout(options?: UseMQOptions<{success: boolean; message: string}, string | undefined>) {
  return useMQ([AuthQueryKey.logout], AuthService.logout, options);
}
