import type { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service.js';
import { HTTP_STATUS } from '../utils/http-status.js';
import { validateDashboardQuery } from '../validators/dashboard.validator.js';

class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  getDashboard = async (request: Request, response: Response) => {
    const query = validateDashboardQuery(request.query as Record<string, unknown>);
    const result = await this.dashboardService.getDashboard(request.user!.id, query);
    response.status(HTTP_STATUS.OK).json(result);
  };
}

export { DashboardController };

