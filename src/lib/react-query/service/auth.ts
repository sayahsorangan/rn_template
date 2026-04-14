import {Api} from '@lib/ky/base';
import {ApiResponse} from '@models/API/app';
import {IUser} from '@models/API/user';

const getUsers = async () => {
  const resp = await Api.get('users').json<ApiResponse<IUser.User[]>>();
  return resp.data;
};

const getUserByEmail = async (email: string) => {
  const resp = await Api.get(`users?email=${encodeURIComponent(email)}`).json<ApiResponse<IUser.User[]>>();
  return resp.data;
};

const updateUser = async ({id, data}: {id: string; data: Partial<IUser.User>}) => {
  const resp = await Api.put(`users/${id}`, {json: data}).json<ApiResponse<IUser.User>>();
  return resp.data;
};

export const AuthService = {
  getUsers,
  getUserByEmail,
  updateUser,
};
