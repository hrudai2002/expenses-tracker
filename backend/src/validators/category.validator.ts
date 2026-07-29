import type { CategoryType } from '@prisma/client/index';
import { ensureObject, optionalString, requireString } from './common.validator.js';
import { AppError } from '../utils/app-error.js';
import { HTTP_STATUS } from '../utils/http-status.js';

type CategoryPayload = {
  name: string;
  type: CategoryType;
  color?: string;
};

function requireCategoryType(value: unknown): CategoryType {
  const categoryType = requireString(value, 'type').toUpperCase();

  if (categoryType !== 'INCOME' && categoryType !== 'EXPENSE') {
    throw new AppError('type must be either INCOME or EXPENSE.', HTTP_STATUS.BAD_REQUEST);
  }

  return categoryType as CategoryType;
}

function validateCategoryPayload(payload: unknown): CategoryPayload {
  const data = ensureObject(payload);

  return {
    name: requireString(data.name, 'name'),
    type: requireCategoryType(data.type),
    color: optionalString(data.color, 'color')
  };
}

export { type CategoryPayload, validateCategoryPayload };

