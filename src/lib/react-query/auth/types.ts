// Authentication Request Types
export interface SignInRequest {
  email: string;
  password: string;
}

// Authentication Response Types
export interface SignInResponse {
  token: string;
}
