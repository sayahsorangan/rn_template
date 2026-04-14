/* eslint-disable react-hooks/rules-of-hooks */

import {IUser} from '@models/API/user';
import {useMQ, UseMQOptions, useRQ, UseRQOptions} from '@react-query/custom-hooks';
import {AuthQueryKey} from '@react-query/query-key';
import {AuthService} from '@react-query/service/auth';

export function getUsers(options?: UseRQOptions<IUser.User[]>) {
  return useRQ([AuthQueryKey.getUsers], AuthService.getUsers, options);
}

export function loginByEmail(options?: UseMQOptions<IUser.User[], string>) {
  return useMQ([AuthQueryKey.getUsers], AuthService.getUserByEmail, options);
}

export function updateUser(options?: UseMQOptions<IUser.User, {id: string; data: Partial<IUser.User>}>) {
  return useMQ([AuthQueryKey.getUsers], AuthService.updateUser, options);
}
