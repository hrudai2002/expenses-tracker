import { AppError } from '../utils/app-error.js';
import { HTTP_STATUS } from '../utils/http-status.js';

function ensureObject(value: unknown, message = 'Request body must be a valid object.'): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AppError(message, HTTP_STATUS.BAD_REQUEST);
  }

  return value as Record<string, unknown>;
}

function requireString(value: unknown, fieldName: string, options?: { minLength?: number }): string {
  if (typeof value !== 'string') {
    throw new AppError(`${fieldName} must be a string.`, HTTP_STATUS.BAD_REQUEST);
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new AppError(`${fieldName} is required.`, HTTP_STATUS.BAD_REQUEST);
  }

  if (options?.minLength && trimmedValue.length < options.minLength) {
    throw new AppError(
      `${fieldName} must be at least ${options.minLength} characters long.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  return trimmedValue;
}

function optionalString(value: unknown, fieldName: string): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return requireString(value, fieldName);
}

function requireEmail(value: unknown): string {
  const email = requireString(value, 'email');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new AppError('email must be a valid email address.', HTTP_STATUS.BAD_REQUEST);
  }

  return email.toLowerCase();
}

function requireNumber(value: unknown, fieldName: string, options?: { min?: number }): number {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    throw new AppError(`${fieldName} must be a valid number.`, HTTP_STATUS.BAD_REQUEST);
  }

  if (options?.min !== undefined && parsedValue < options.min) {
    throw new AppError(`${fieldName} must be at least ${options.min}.`, HTTP_STATUS.BAD_REQUEST);
  }

  return parsedValue;
}

function requireInteger(value: unknown, fieldName: string, options?: { min?: number; max?: number }): number {
  const parsedValue = requireNumber(value, fieldName, options);

  if (!Number.isInteger(parsedValue)) {
    throw new AppError(`${fieldName} must be an integer.`, HTTP_STATUS.BAD_REQUEST);
  }

  if (options?.max !== undefined && parsedValue > options.max) {
    throw new AppError(`${fieldName} must be at most ${options.max}.`, HTTP_STATUS.BAD_REQUEST);
  }

  return parsedValue;
}

function requireIsoDate(value: unknown, fieldName: string): Date {
  const dateValue = requireString(value, fieldName);
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError(`${fieldName} must be a valid date.`, HTTP_STATUS.BAD_REQUEST);
  }

  return parsedDate;
}

function requireId(value: unknown, fieldName: string): string {
  return requireString(value, fieldName);
}

function parseOptionalPagination(value: unknown, fallbackValue: number): number {
  if (value === undefined) {
    return fallbackValue;
  }

  return requireInteger(value, 'pagination value', { min: 1 });
}

export {
  ensureObject,
  optionalString,
  parseOptionalPagination,
  requireEmail,
  requireId,
  requireInteger,
  requireIsoDate,
  requireNumber,
  requireString
};

