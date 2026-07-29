import { Prisma } from '@prisma/client/index';
import { CategoryRepository } from '../repositories/category.repository.js';
import { AppError } from '../utils/app-error.js';
import { HTTP_STATUS } from '../utils/http-status.js';

class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async createCategory(userId: string, payload: { name: string; type: 'INCOME' | 'EXPENSE'; color?: string }) {
    try {
      return await this.categoryRepository.create({
        userId,
        name: payload.name,
        type: payload.type,
        color: payload.color
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError('Category already exists for this user and type.', HTTP_STATUS.CONFLICT);
      }

      throw error;
    }
  }

  async getCategories(userId: string) {
    return this.categoryRepository.findManyByUser(userId);
  }

  async getCategoryById(userId: string, categoryId: string) {
    const category = await this.ensureOwnedCategory(userId, categoryId);
    return category;
  }

  async updateCategory(
    userId: string,
    categoryId: string,
    payload: { name: string; type: 'INCOME' | 'EXPENSE'; color?: string }
  ) {
    await this.ensureOwnedCategory(userId, categoryId);

    try {
      return await this.categoryRepository.update(categoryId, {
        name: payload.name,
        type: payload.type,
        color: payload.color ?? null
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError('Category already exists for this user and type.', HTTP_STATUS.CONFLICT);
      }

      throw error;
    }
  }

  async deleteCategory(userId: string, categoryId: string) {
    await this.ensureOwnedCategory(userId, categoryId);

    try {
      await this.categoryRepository.delete(categoryId);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new AppError(
          'Category cannot be deleted because it is already used in transactions or budgets.',
          HTTP_STATUS.CONFLICT
        );
      }

      throw error;
    }
  }

  async ensureOwnedCategory(userId: string, categoryId: string) {
    const category = await this.categoryRepository.findById(categoryId);

    if (!category || category.userId !== userId) {
      throw new AppError('Category not found.', HTTP_STATUS.NOT_FOUND);
    }

    return category;
  }
}

export { CategoryService };

