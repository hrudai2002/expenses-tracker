import { BudgetRepository } from '../repositories/budget.repository.js';
import { CategoryRepository } from '../repositories/category.repository.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { toNullableNumber } from '../utils/response-mappers.js';

const palette = ['#6567eb', '#ff8a33', '#6b5ffc', '#ffcc33', '#33c56c', '#ff66bb'];

function buildTrendMonths(endMonth: number, endYear: number, count: number) {
  const months = [];

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(endYear, endMonth - 1 - index, 1);
    months.push({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      label: date.toLocaleDateString('en-US', { month: 'short' })
    });
  }

  return months;
}

class DashboardService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly budgetRepository: BudgetRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  async getDashboard(userId: string, query: { month: number; year: number }) {
    const trendMonths = buildTrendMonths(query.month, query.year, 6);

    const [incomeAggregate, expenseAggregate, budgets, spendMap, recentTransactions, categories, trendResults] =
      await Promise.all([
        this.transactionRepository.aggregateByType(userId, query.month, query.year, 'INCOME'),
        this.transactionRepository.aggregateByType(userId, query.month, query.year, 'EXPENSE'),
        this.budgetRepository.findManyByUserAndMonth(userId, query.month, query.year),
        this.transactionRepository.getCategorySpendMap(userId, query.month, query.year),
        this.transactionRepository.findRecentByUser(userId, query.month, query.year, 5),
        this.categoryRepository.findManyByUser(userId),
        Promise.all(
          trendMonths.map(async ({ month, year, label }) => {
            const [incomeResult, expenseResult] = await Promise.all([
              this.transactionRepository.aggregateByType(userId, month, year, 'INCOME'),
              this.transactionRepository.aggregateByType(userId, month, year, 'EXPENSE')
            ]);

            return {
              month: label,
              income: toNullableNumber(incomeResult._sum.amount) ?? 0,
              expense: toNullableNumber(expenseResult._sum.amount) ?? 0
            };
          })
        )
      ]);

    const totalIncome = toNullableNumber(incomeAggregate._sum.amount) ?? 0;
    const totalExpense = toNullableNumber(expenseAggregate._sum.amount) ?? 0;

    const categorySpending = categories
      .filter((category) => category.type === 'EXPENSE')
      .map((category, index) => ({
        name: category.name,
        color: category.color ?? palette[index % palette.length],
        amount: spendMap.get(category.id) ?? 0
      }))
      .filter((item) => item.amount > 0);

    return {
      month: query.month,
      year: query.year,
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      },
      trend: trendResults,
      categorySpending,
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

