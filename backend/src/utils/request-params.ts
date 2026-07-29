import { AppError } from './app-error.js';
import { HTTP_STATUS } from './http-status.js';

function getRequiredRouteParam(value: string | string[] | undefined, name: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(`${name} route parameter is required.`, HTTP_STATUS.BAD_REQUEST);
  }

  return value;
}

export { getRequiredRouteParam };

