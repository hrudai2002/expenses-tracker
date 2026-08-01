import { CategoryService } from './category.service.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { AppError } from '../utils/app-error.js';
import { HTTP_STATUS } from '../utils/http-status.js';
import { toNumber } from '../utils/response-mappers.js';

class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly categoryService: CategoryService
  ) {}

  async createTransaction(
    userId: string,
    payload: { categoryId: string; title: string; description: string; amount: number; transactionDate: Date }
  ) {
    const category = await this.categoryService.ensureOwnedCategory(userId, payload.categoryId);

    const transaction = await this.transactionRepository.create({
      userId,
      categoryId: payload.categoryId,
      title: payload.title,
      description: payload.description,
      amount: payload.amount,
      type: category.type,
      transactionDate: payload.transactionDate
    });

    return this.toTransactionResponse(transaction);
  }

  async getTransactions(
    userId: string,
    query: {
      month?: number;
      year?: number;
      categoryId?: string;
      type?: 'INCOME' | 'EXPENSE';
      page: number;
      limit: number;
    }
  ) {
    if ((query.month && !query.year) || (!query.month && query.year)) {
      throw new AppError('month and year must be provided together.', HTTP_STATUS.BAD_REQUEST);
    }

    if (query.categoryId) {
      await this.categoryService.ensureOwnedCategory(userId, query.categoryId);
    }

    const { items, totalCount } = await this.transactionRepository.findManyByUser({
      userId,
      filters: query,
      pagination: {
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }
    });

    return {
      items: items.map((item) => this.toTransactionResponse(item)),
      meta: {
        page: query.page,
        limit: query.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / query.limit)
      }
    };
  }

  async getTransactionById(userId: string, transactionId: string) {
    const transaction = await this.ensureOwnedTransaction(userId, transactionId);
    return this.toTransactionResponse(transaction);
  }

  async updateTransaction(
    userId: string,
    transactionId: string,
    payload: { categoryId: string; title: string; description: string; amount: number; transactionDate: Date }
  ) {
    await this.ensureOwnedTransaction(userId, transactionId);
    const category = await this.categoryService.ensureOwnedCategory(userId, payload.categoryId);

    const transaction = await this.transactionRepository.update(transactionId, {
      categoryId: payload.categoryId,
      title: payload.title,
      description: payload.description,
      amount: payload.amount,
      type: category.type,
      transactionDate: payload.transactionDate
    });

    return this.toTransactionResponse(transaction);
  }

  async deleteTransaction(userId: string, transactionId: string) {
    await this.ensureOwnedTransaction(userId, transactionId);
    await this.transactionRepository.delete(transactionId);
  }

  async ensureOwnedTransaction(userId: string, transactionId: string) {
    const transaction = await this.transactionRepository.findById(transactionId);

    if (!transaction || transaction.userId !== userId) {
      throw new AppError('Transaction not found.', HTTP_STATUS.NOT_FOUND);
    }

    return transaction;
  }

  private toTransactionResponse(transaction: {
    id: string;
    title: string;
    description: string;
    amount: { toString(): string };
    type: string;
    transactionDate: Date;
    createdAt: Date;
    updatedAt: Date;
    category: { id: string; name: string; type: string; color: string | null };
  }) {
    return {
      id: transaction.id,
      title: transaction.title,
      description: transaction.description,
      amount: toNumber(transaction.amount),
      type: transaction.type,
      transactionDate: transaction.transactionDate,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      category: {
        id: transaction.category.id,
        name: transaction.category.name,
        type: transaction.category.type,
        color: transaction.category.color
      }
    };
  }
}

export { TransactionService };
