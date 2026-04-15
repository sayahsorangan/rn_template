export interface IResponse {
  status: string;
  msg: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export namespace IApp {
  export interface IAuth {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }
}
