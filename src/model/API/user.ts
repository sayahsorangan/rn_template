export namespace IUser {
  export interface User {
    id: string;
    email: string;
    fullName: string | null;
    avatar: string | null;
    bio: string | null;
    apiKey: string | null;
    createdAt: string;
    updatedAt: string;
  }

  export interface UserProfile {
    id: string;
    email: string;
    fullName: string | null;
    avatar: string | null;
    bio: string | null;
  }

  export interface LoginRequest {
    email: string;
    password: string;
  }

  export interface RegisterRequest {
    email: string;
    password: string;
    fullName?: string;
  }

  export interface AuthSession {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }

  export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
    expiresIn: number;
  }

  export interface RegisterResponse {
    user: User;
    session: AuthSession;
  }

  export interface UpdateProfileRequest {
    fullName?: string;
    avatar?: string;
    bio?: string;
  }
}
