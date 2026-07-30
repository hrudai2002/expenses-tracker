import type { Budget, Category } from '@prisma/client/index';
import { prisma } from '../config/database.js';
import { newId } from '../utils/id.js';

type BudgetWithCategory = Budget & {
  category: Category;
};

class BudgetRepository {
  async create(data: {
    userId: string;
    categoryId: string;
    month: number;
    year: number;
    amount: number;
  }): Promise<BudgetWithCategory> {
    return prisma.budget.create({
      data: { id: newId(), ...data },
      include: {
        category: true
      }
    });
  }

  async findById(id: string): Promise<BudgetWithCategory | null> {
    return prisma.budget.findUnique({
      where: { id },
      include: {
        category: true
      }
    });
  }

  async findManyByUserAndMonth(userId: string, month: number, year: number): Promise<BudgetWithCategory[]> {
    return prisma.budget.findMany({
      where: {
        userId,
        month,
        year
      },
      include: {
        category: true
      },
      orderBy: {
        category: {
          name: 'asc'
        }
      }
    });
  }

  async update(id: string, data: { categoryId: string; month: number; year: number; amount: number }): Promise<BudgetWithCategory> {
    return prisma.budget.update({
      where: { id },
      data,
      include: {
        category: true
      }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.budget.delete({
      where: { id }
    });
  }
}

export { type BudgetWithCategory, BudgetRepository };

