import { Prisma } from '@prisma/client/index';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app-error.js';
import { HTTP_STATUS } from '../utils/http-status.js';

function errorMiddleware(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction
): void {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      message: error.message
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    response.status(HTTP_STATUS.BAD_REQUEST).json({
      message: error.message
    });
    return;
  }

  console.error(error);
  response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: 'Something went wrong on the server.'
  });
}

export { errorMiddleware };

