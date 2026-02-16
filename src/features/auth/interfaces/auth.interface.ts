
export interface IAuthResponse {
  user: IUser;
  access_token: string;
  refreshToken?: string;
}

export interface IUser {
  id: string;
  username: string;
  email: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* Login y Response */

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
}