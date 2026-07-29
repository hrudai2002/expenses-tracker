import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app-error.js';
import { verifyAuthToken } from '../utils/jwt.js';
import { HTTP_STATUS } from '../utils/http-status.js';

function authenticateRequest(request: Request, _response: Response, next: NextFunction): void {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    next(new AppError('Authentication token is missing.', HTTP_STATUS.UNAUTHORIZED));
    return;
  }

  const token = authorizationHeader.slice('Bearer '.length);

  try {
    const decodedToken = verifyAuthToken(token);
    request.user = {
      id: decodedToken.userId,
      email: decodedToken.email
    };
    next();
  } catch (_error) {
    next(new AppError('Invalid or expired token.', HTTP_STATUS.UNAUTHORIZED));
  }
}

export { authenticateRequest };

