import { requireInteger } from './common.validator.js';

type DashboardQuery = {
  month: number;
  year: number;
};

function validateDashboardQuery(query: Record<string, unknown>): DashboardQuery {
  return {
    month: requireInteger(query.month, 'month', { min: 1, max: 12 }),
    year: requireInteger(query.year, 'year', { min: 2000, max: 9999 })
  };
}

export { type DashboardQuery, validateDashboardQuery };

