import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

function buildDashboardRoutes(dashboardController: DashboardController): Router {
  const router = Router();

  router.get('/', asyncHandler(dashboardController.getDashboard));

  return router;
}

export { buildDashboardRoutes };

