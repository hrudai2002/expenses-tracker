import { Router } from 'express';
import { BudgetController } from '../controllers/budget.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

function buildBudgetRoutes(budgetController: BudgetController): Router {
  const router = Router();

  router.post('/', asyncHandler(budgetController.create));
  router.get('/', asyncHandler(budgetController.list));
  router.get('/:budgetId', asyncHandler(budgetController.getById));
  router.put('/:budgetId', asyncHandler(budgetController.update));
  router.delete('/:budgetId', asyncHandler(budgetController.delete));

  return router;
}

export { buildBudgetRoutes };

