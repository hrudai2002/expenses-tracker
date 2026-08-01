import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateRequest } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

function buildAuthRoutes(authController: AuthController): Router {
  const router = Router();

  router.post('/signup', asyncHandler(authController.signup));
  router.post('/login', asyncHandler(authController.login));
  router.get('/me', authenticateRequest, asyncHandler(authController.me));
  router.post('/change-password', authenticateRequest, asyncHandler(authController.changePassword));

  return router;
}

export { buildAuthRoutes };

