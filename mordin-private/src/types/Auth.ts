import { BaseResponse } from './response';
import { User } from './User';

export type Auth = {
  user: User;
  access_token: string;
};

export type AuthRequest = {
  username: string;
  password: string;
};

export type AuthResponse = BaseResponse<Auth>;
