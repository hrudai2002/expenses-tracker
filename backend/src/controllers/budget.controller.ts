import type { Request, Response } from 'express';
import { BudgetService } from '../services/budget.service.js';
import { HTTP_STATUS } from '../utils/http-status.js';
import { getRequiredRouteParam } from '../utils/request-params.js';
import { validateBudgetPayload, validateBudgetQuery } from '../validators/budget.validator.js';

class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  create = async (request: Request, response: Response) => {
    const payload = validateBudgetPayload(request.body);
    const result = await this.budgetService.createBudget(request.user!.id, payload);
    response.status(HTTP_STATUS.CREATED).json(result);
  };

  list = async (request: Request, response: Response) => {
    const query = validateBudgetQuery(request.query as Record<string, unknown>);
    const result = await this.budgetService.getBudgets(request.user!.id, query);
    response.status(HTTP_STATUS.OK).json(result);
  };

  getById = async (request: Request, response: Response) => {
    const budgetId = getRequiredRouteParam(request.params.budgetId, 'budgetId');
    const result = await this.budgetService.getBudgetById(request.user!.id, budgetId);
    response.status(HTTP_STATUS.OK).json(result);
  };

  update = async (request: Request, response: Response) => {
    const payload = validateBudgetPayload(request.body);
    const budgetId = getRequiredRouteParam(request.params.budgetId, 'budgetId');
    const result = await this.budgetService.updateBudget(request.user!.id, budgetId, payload);
    response.status(HTTP_STATUS.OK).json(result);
  };

  delete = async (request: Request, response: Response) => {
    const budgetId = getRequiredRouteParam(request.params.budgetId, 'budgetId');
    await this.budgetService.deleteBudget(request.user!.id, budgetId);
    response.status(HTTP_STATUS.NO_CONTENT).send();
  };
}

export { BudgetController };
