import type { CategoryType, Prisma, Transaction, Category } from '@prisma/client/index';
import { prisma } from '../config/database.js';
import { newId } from '../utils/id.js';

type TransactionWithCategory = Transaction & {
  category: Category;
};

class TransactionRepository {
  async create(data: {
    userId: string;
    categoryId: string;
    title: string;
    description: string;
    amount: number;
    type: CategoryType;
    transactionDate: Date;
  }): Promise<TransactionWithCategory> {
    return prisma.transaction.create({
      data: { id: newId(), ...data },
      include: {
        category: true
      }
    });
  }

  async findById(id: string): Promise<TransactionWithCategory | null> {
    return prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true
      }
    });
  }

  async findManyByUser(params: {
    userId: string;
    filters: {
      month?: number;
      year?: number;
      categoryId?: string;
      type?: CategoryType;
    };
    pagination: {
      skip: number;
      take: number;
    };
  }): Promise<{ items: TransactionWithCategory[]; totalCount: number }> {
    const where: Prisma.TransactionWhereInput = {
      userId: params.userId
    };

    if (params.filters.categoryId) {
      where.categoryId = params.filters.categoryId;
    }

    if (params.filters.type) {
      where.type = params.filters.type;
    }

    if (params.filters.month && params.filters.year) {
      where.transactionDate = {
        gte: new Date(params.filters.year, params.filters.month - 1, 1),
        lt: new Date(params.filters.year, params.filters.month, 1)
      };
    }

    const [items, totalCount] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        include: {
          category: true
        },
        orderBy: {
          transactionDate: 'desc'
        },
        skip: params.pagination.skip,
        take: params.pagination.take
      }),
      prisma.transaction.count({ where })
    ]);

    return { items, totalCount };
  }

  async update(
    id: string,
    data: {
      categoryId: string;
      title: string;
      description: string;
      amount: number;
      type: CategoryType;
      transactionDate: Date;
    }
  ): Promise<TransactionWithCategory> {
    return prisma.transaction.update({
      where: { id },
      data,
      include: {
        category: true
      }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.transaction.delete({
      where: { id }
    });
  }

  async aggregateByType(userId: string, month: number, year: number, type: CategoryType) {
    return prisma.transaction.aggregate({
      where: {
        userId,
        type,
        transactionDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1)
        }
      },
      _sum: {
        amount: true
      }
    });
  }

  async findRecentByUser(userId: string, month: number, year: number, limit: number): Promise<TransactionWithCategory[]> {
    return prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1)
        }
      },
      include: {
        category: true
      },
      orderBy: {
        transactionDate: 'desc'
      },
      take: limit
    });
  }

  async getCategorySpendMap(userId: string, month: number, year: number): Promise<Map<string, number>> {
    const groupedRows = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'EXPENSE',
        transactionDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1)
        }
      },
      _sum: {
        amount: true
      }
    });

    return new Map(
      groupedRows.map((row) => [row.categoryId, Number(row._sum.amount ?? 0)])
    );
  }

  async findAmountsForMonth(userId: string, month: number, year: number) {
    return prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1)
        }
      },
      select: {
        amount: true,
        type: true,
        transactionDate: true
      }
    });
  }
}

export { type TransactionWithCategory, TransactionRepository };
