import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

function buildCategoryRoutes(categoryController: CategoryController): Router {
  const router = Router();

  router.post('/', asyncHandler(categoryController.create));
  router.get('/', asyncHandler(categoryController.list));
  router.get('/:categoryId', asyncHandler(categoryController.getById));
  router.put('/:categoryId', asyncHandler(categoryController.update));
  router.delete('/:categoryId', asyncHandler(categoryController.delete));

  return router;
}

export { buildCategoryRoutes };

