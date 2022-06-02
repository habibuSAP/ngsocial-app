import { IUser } from '../models/user.model';

export interface IAuthState {
  isLoggedIn: boolean;
  currentUser: IUser | null;
  accessToken: string | null;
};
export type AuthResponse = {
  token: string;
  user: IUser;
};
export type RegisterResponse = {
  register: AuthResponse;
};
export type LoginResponse = {
  signIn: AuthResponse;
};
export type MayBeNullOrUndefined<T> = T | null | undefined;
