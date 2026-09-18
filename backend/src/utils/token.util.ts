import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthUserPayload } from '../types/index.js';

export const generateToken = (payload: AuthUserPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '15m', // 15 minute timeout requirement (R8)
  });
};

export const verifyToken = (token: string): AuthUserPayload => {
  return jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
};
