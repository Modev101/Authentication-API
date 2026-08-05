import { Roles } from '@prisma/client';
import { Request } from 'express';

export type JwtPayload = {
  sub: string;
  email: string;
  role: Roles;
};

export type JwtUser = {
  userId: string;
  email: string;
};

export type AuthUser = {
  userId: string;
  email: string;
  role: Roles;
};

export interface AuthRequest extends Request {
  user: AuthUser;
}
