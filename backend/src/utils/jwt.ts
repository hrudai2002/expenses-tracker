import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

type AuthTokenPayload = {
  userId: string;
  email: string;
};

function generateAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: '7d'
  });
}

function verifyAuthToken(token: string): AuthTokenPayload {
  const decodedToken = jwt.verify(token, env.jwtSecret);

  if (typeof decodedToken === 'string') {
    throw new Error('Invalid token payload.');
  }

  return {
    userId: decodedToken.userId,
    email: decodedToken.email
  };
}

export { generateAuthToken, verifyAuthToken };

