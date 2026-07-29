import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { BudgetController } from '../controllers/budget.controller.js';
import { CategoryController } from '../controllers/category.controller.js';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { TransactionController } from '../controllers/transaction.controller.js';
import { authenticateRequest } from '../middlewares/auth.middleware.js';
import { BudgetRepository } from '../repositories/budget.repository.js';
import { CategoryRepository } from '../repositories/category.repository.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { AuthService } from '../services/auth.service.js';
import { BudgetService } from '../services/budget.service.js';
import { CategoryService } from '../services/category.service.js';
import { DashboardService } from '../services/dashboard.service.js';
import { TransactionService } from '../services/transaction.service.js';
import { buildAuthRoutes } from './auth.routes.js';
import { buildBudgetRoutes } from './budget.routes.js';
import { buildCategoryRoutes } from './category.routes.js';
import { buildDashboardRoutes } from './dashboard.routes.js';
import { buildTransactionRoutes } from './transaction.routes.js';

function buildApiRouter(): Router {
  const router = Router();

  const userRepository = new UserRepository();
  const categoryRepository = new CategoryRepository();
  const transactionRepository = new TransactionRepository();
  const budgetRepository = new BudgetRepository();

  const authService = new AuthService(userRepository);
  const categoryService = new CategoryService(categoryRepository);
  const transactionService = new TransactionService(transactionRepository, categoryService);
  const budgetService = new BudgetService(budgetRepository, transactionRepository, categoryService);
  const dashboardService = new DashboardService(transactionRepository, budgetRepository);

  const authController = new AuthController(authService);
  const categoryController = new CategoryController(categoryService);
  const transactionController = new TransactionController(transactionService);
  const budgetController = new BudgetController(budgetService);
  const dashboardController = new DashboardController(dashboardService);

  router.use('/auth', buildAuthRoutes(authController));
  router.use(authenticateRequest);
  router.use('/categories', buildCategoryRoutes(categoryController));
  router.use('/transactions', buildTransactionRoutes(transactionController));
  router.use('/budgets', buildBudgetRoutes(budgetController));
  router.use('/dashboard', buildDashboardRoutes(dashboardController));

  return router;
}

export { buildApiRouter };

