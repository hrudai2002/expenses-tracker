import { BudgetRepository } from '../repositories/budget.repository.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { toNullableNumber } from '../utils/response-mappers.js';

class DashboardService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly budgetRepository: BudgetRepository
  ) {}

  async getDashboard(userId: string, query: { month: number; year: number }) {
    const [incomeAggregate, expenseAggregate, budgets, spendMap, recentTransactions] = await Promise.all([
      this.transactionRepository.aggregateByType(userId, query.month, query.year, 'INCOME'),
      this.transactionRepository.aggregateByType(userId, query.month, query.year, 'EXPENSE'),
      this.budgetRepository.findManyByUserAndMonth(userId, query.month, query.year),
      this.transactionRepository.getCategorySpendMap(userId, query.month, query.year),
      this.transactionRepository.findRecentByUser(userId, query.month, query.year, 5)
    ]);

    const totalIncome = toNullableNumber(incomeAggregate._sum.amount) ?? 0;
    const totalExpense = toNullableNumber(expenseAggregate._sum.amount) ?? 0;

    return {
      month: query.month,
      year: query.year,
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      },
      budgets: budgets.map((budget) => {
        const spentAmount = spendMap.get(budget.categoryId) ?? 0;
        const budgetAmount = Number(budget.amount.toString());

        return {
          id: budget.id,
          amount: budgetAmount,
          spentAmount,
          remainingAmount: budgetAmount - spentAmount,
          category: {
            id: budget.category.id,
            name: budget.category.name,
            color: budget.category.color
          }
        };
      }),
      recentTransactions: recentTransactions.map((transaction) => ({
        id: transaction.id,
        title: transaction.title,
        description: transaction.description,
        amount: Number(transaction.amount.toString()),
        type: transaction.type,
        transactionDate: transaction.transactionDate,
        category: {
          id: transaction.category.id,
          name: transaction.category.name,
          type: transaction.category.type,
          color: transaction.category.color
        }
      }))
    };
  }
}

export { DashboardService };

