import { Prisma } from '@prisma/client/index';
import { BudgetRepository } from '../repositories/budget.repository.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { CategoryService } from './category.service.js';
import { AppError } from '../utils/app-error.js';
import { HTTP_STATUS } from '../utils/http-status.js';
import { toNumber } from '../utils/response-mappers.js';

class BudgetService {
  constructor(
    private readonly budgetRepository: BudgetRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly categoryService: CategoryService
  ) {}

  async createBudget(
    userId: string,
    payload: { categoryId: string; month: number; year: number; amount: number }
  ) {
    const category = await this.categoryService.ensureOwnedCategory(userId, payload.categoryId);

    if (category.type !== 'EXPENSE') {
      throw new AppError('Budgets can only be created for expense categories.', HTTP_STATUS.BAD_REQUEST);
    }

    try {
      const budget = await this.budgetRepository.create({
        userId,
        categoryId: payload.categoryId,
        month: payload.month,
        year: payload.year,
        amount: payload.amount
      });

      return this.toBudgetResponse(budget, 0);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError('Budget already exists for this category and month.', HTTP_STATUS.CONFLICT);
      }

      throw error;
    }
  }

  async getBudgets(userId: string, query: { month: number; year: number }) {
    const budgets = await this.budgetRepository.findManyByUserAndMonth(userId, query.month, query.year);
    const spendMap = await this.transactionRepository.getCategorySpendMap(userId, query.month, query.year);

    return budgets.map((budget) => this.toBudgetResponse(budget, spendMap.get(budget.categoryId) ?? 0));
  }

  async getBudgetById(userId: string, budgetId: string) {
    const budget = await this.ensureOwnedBudget(userId, budgetId);
    const spendMap = await this.transactionRepository.getCategorySpendMap(userId, budget.month, budget.year);
    return this.toBudgetResponse(budget, spendMap.get(budget.categoryId) ?? 0);
  }

  async updateBudget(
    userId: string,
    budgetId: string,
    payload: { categoryId: string; month: number; year: number; amount: number }
  ) {
    await this.ensureOwnedBudget(userId, budgetId);
    const category = await this.categoryService.ensureOwnedCategory(userId, payload.categoryId);

    if (category.type !== 'EXPENSE') {
      throw new AppError('Budgets can only be created for expense categories.', HTTP_STATUS.BAD_REQUEST);
    }

    try {
      const budget = await this.budgetRepository.update(budgetId, payload);
      const spendMap = await this.transactionRepository.getCategorySpendMap(userId, budget.month, budget.year);
      return this.toBudgetResponse(budget, spendMap.get(budget.categoryId) ?? 0);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError('Budget already exists for this category and month.', HTTP_STATUS.CONFLICT);
      }

      throw error;
    }
  }

  async deleteBudget(userId: string, budgetId: string) {
    await this.ensureOwnedBudget(userId, budgetId);
    await this.budgetRepository.delete(budgetId);
  }

  async ensureOwnedBudget(userId: string, budgetId: string) {
    const budget = await this.budgetRepository.findById(budgetId);

    if (!budget || budget.userId !== userId) {
      throw new AppError('Budget not found.', HTTP_STATUS.NOT_FOUND);
    }

    return budget;
  }

  private toBudgetResponse(
    budget: {
      id: string;
      categoryId: string;
      month: number;
      year: number;
      amount: { toString(): string };
      createdAt: Date;
      updatedAt: Date;
      category: { id: string; name: string; type: string; color: string | null };
    },
    spentAmount: number
  ) {
    const budgetAmount = toNumber(budget.amount);

    return {
      id: budget.id,
      month: budget.month,
      year: budget.year,
      amount: budgetAmount,
      spentAmount,
      remainingAmount: budgetAmount - spentAmount,
      category: {
        id: budget.category.id,
        name: budget.category.name,
        type: budget.category.type,
        color: budget.category.color
      },
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt
    };
  }
}

export { BudgetService };

