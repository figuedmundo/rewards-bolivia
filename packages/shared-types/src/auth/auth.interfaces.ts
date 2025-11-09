import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface RequestUser {
  userId: string;
  email: string;
  role: string;
  refreshToken?: string;
}

export interface RequestWithUser extends Request {
  user: RequestUser;
}

export interface RequestWithRefreshToken extends Request {
  cookies: {
    refresh_token: string;
  };
}
