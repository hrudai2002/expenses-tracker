import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app-error.js';
import { HTTP_STATUS } from '../utils/http-status.js';

function notFoundMiddleware(_request: Request, _response: Response, next: NextFunction): void {
  next(new AppError('Route not found.', HTTP_STATUS.NOT_FOUND));
}

export { notFoundMiddleware };

