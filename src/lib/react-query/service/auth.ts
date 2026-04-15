import {Api} from '@lib/ky/base';
import {ApiResponse} from '@models/API/app';
import {IUser} from '@models/API/user';

const login = async (data: IUser.LoginRequest) => {
  const resp = await Api.post('auth/login', {json: data}).json<ApiResponse<IUser.LoginResponse>>();
  return resp.data;
};

const register = async (data: IUser.RegisterRequest) => {
  const resp = await Api.post('auth/register', {json: data}).json<ApiResponse<IUser.RegisterResponse>>();
  return resp.data;
};

const refreshToken = async (token: string) => {
  const resp = await Api.post('auth/refresh', {json: {refreshToken: token}}).json<
    ApiResponse<{accessToken: string; refreshToken: string; expiresIn: number}>
  >();
  return resp.data;
};

const logout = async (accessToken?: string) => {
  const resp = await Api.post('auth/logout', {json: {accessToken}}).json<
    ApiResponse<{success: boolean; message: string}>
  >();
  return resp.data;
};

const getMe = async () => {
  const resp = await Api.get('auth/me').json<ApiResponse<IUser.User>>();
  return resp.data;
};

const getUserById = async (userId: string) => {
  const resp = await Api.get(`auth/user/${userId}`).json<ApiResponse<IUser.User>>();
  return resp.data;
};

const updateProfile = async (data: IUser.UpdateProfileRequest) => {
  const resp = await Api.put('course/profile', {json: data}).json<ApiResponse<IUser.UserProfile>>();
  return resp.data;
};

export const AuthService = {
  login,
  register,
  refreshToken,
  logout,
  getMe,
  getUserById,
  updateProfile,
};
