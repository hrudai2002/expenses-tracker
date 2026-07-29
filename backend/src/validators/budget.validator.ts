import {
  ensureObject,
  requireId,
  requireInteger,
  requireNumber
} from './common.validator.js';

type BudgetPayload = {
  categoryId: string;
  month: number;
  year: number;
  amount: number;
};

type BudgetQuery = {
  month: number;
  year: number;
};

function validateBudgetPayload(payload: unknown): BudgetPayload {
  const data = ensureObject(payload);

  return {
    categoryId: requireId(data.categoryId, 'categoryId'),
    month: requireInteger(data.month, 'month', { min: 1, max: 12 }),
    year: requireInteger(data.year, 'year', { min: 2000, max: 9999 }),
    amount: requireNumber(data.amount, 'amount', { min: 0.01 })
  };
}

function validateBudgetQuery(query: Record<string, unknown>): BudgetQuery {
  return {
    month: requireInteger(query.month, 'month', { min: 1, max: 12 }),
    year: requireInteger(query.year, 'year', { min: 2000, max: 9999 })
  };
}

export { type BudgetPayload, type BudgetQuery, validateBudgetPayload, validateBudgetQuery };

