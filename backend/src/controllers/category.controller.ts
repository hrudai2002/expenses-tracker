import type { Request, Response } from 'express';
import { CategoryService } from '../services/category.service.js';
import { HTTP_STATUS } from '../utils/http-status.js';
import { getRequiredRouteParam } from '../utils/request-params.js';
import { validateCategoryPayload } from '../validators/category.validator.js';

class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  create = async (request: Request, response: Response) => {
    const payload = validateCategoryPayload(request.body);
    const result = await this.categoryService.createCategory(request.user!.id, payload);
    response.status(HTTP_STATUS.CREATED).json(result);
  };

  list = async (request: Request, response: Response) => {
    const result = await this.categoryService.getCategories(request.user!.id);
    response.status(HTTP_STATUS.OK).json(result);
  };

  getById = async (request: Request, response: Response) => {
    const categoryId = getRequiredRouteParam(request.params.categoryId, 'categoryId');
    const result = await this.categoryService.getCategoryById(request.user!.id, categoryId);
    response.status(HTTP_STATUS.OK).json(result);
  };

  update = async (request: Request, response: Response) => {
    const payload = validateCategoryPayload(request.body);
    const categoryId = getRequiredRouteParam(request.params.categoryId, 'categoryId');
    const result = await this.categoryService.updateCategory(
      request.user!.id,
      categoryId,
      payload
    );
    response.status(HTTP_STATUS.OK).json(result);
  };

  delete = async (request: Request, response: Response) => {
    const categoryId = getRequiredRouteParam(request.params.categoryId, 'categoryId');
    await this.categoryService.deleteCategory(request.user!.id, categoryId);
    response.status(HTTP_STATUS.NO_CONTENT).send();
  };
}

export { CategoryController };
