import type { CategoryType } from '@prisma/client/index';
import {
  ensureObject,
  parseOptionalPagination,
  requireId,
  requireIsoDate,
  requireNumber,
  requireString
} from './common.validator.js';
import { AppError } from '../utils/app-error.js';
import { HTTP_STATUS } from '../utils/http-status.js';

type TransactionPayload = {
  categoryId: string;
  title: string;
  description: string;
  amount: number;
  transactionDate: Date;
};

type TransactionQuery = {
  month?: number;
  year?: number;
  categoryId?: string;
  type?: CategoryType;
  page: number;
  limit: number;
};

function parseCategoryType(value: unknown): CategoryType | undefined {
  if (value === undefined) {
    return undefined;
  }

  const typeValue = requireString(value, 'type').toUpperCase();

  if (typeValue !== 'INCOME' && typeValue !== 'EXPENSE') {
    throw new AppError('type must be either INCOME or EXPENSE.', HTTP_STATUS.BAD_REQUEST);
  }

  return typeValue as CategoryType;
}

function parseOptionalMonth(value: unknown): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const month = Number(value);

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new AppError('month must be between 1 and 12.', HTTP_STATUS.BAD_REQUEST);
  }

  return month;
}

function parseOptionalYear(value: unknown): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const year = Number(value);

  if (!Number.isInteger(year) || year < 2000 || year > 9999) {
    throw new AppError('year must be a valid 4 digit year.', HTTP_STATUS.BAD_REQUEST);
  }

  return year;
}

function validateTransactionPayload(payload: unknown): TransactionPayload {
  const data = ensureObject(payload);

  return {
    categoryId: requireId(data.categoryId, 'categoryId'),
    title: requireString(data.title, 'title'),
    description: requireString(data.description, 'description'),
    amount: requireNumber(data.amount, 'amount', { min: 0.01 }),
    transactionDate: requireIsoDate(data.transactionDate, 'transactionDate')
  };
}

function validateTransactionQuery(query: Record<string, unknown>): TransactionQuery {
  return {
    month: parseOptionalMonth(query.month),
    year: parseOptionalYear(query.year),
    categoryId: typeof query.categoryId === 'string' ? query.categoryId : undefined,
    type: parseCategoryType(query.type),
    page: parseOptionalPagination(query.page, 1),
    limit: parseOptionalPagination(query.limit, 10)
  };
}

export { type TransactionPayload, type TransactionQuery, validateTransactionPayload, validateTransactionQuery };
