import { BudgetRepository } from '../repositories/budget.repository.js';
import { CategoryRepository } from '../repositories/category.repository.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { toNullableNumber } from '../utils/response-mappers.js';

// ponytail: chart ignores stored category colors — DB values can be distinct hex but visually identical
const chartPalette = ['#6366F1', '#F97316', '#22C55E', '#EC4899', '#06B6D4', '#EAB308'];

function buildDailyTrend(
  transactions: Array<{ amount: { toString(): string }; type: 'INCOME' | 'EXPENSE'; transactionDate: Date }>,
  month: number,
  year: number
) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const incomeByDay = Array.from({ length: daysInMonth }, () => 0);
  const expenseByDay = Array.from({ length: daysInMonth }, () => 0);

  for (const transaction of transactions) {
    const day = new Date(transaction.transactionDate).getDate();
    const amount = Number(transaction.amount.toString());
    const bucket = transaction.type === 'INCOME' ? incomeByDay : expenseByDay;
    bucket[day - 1] += amount;
  }

  return Array.from({ length: daysInMonth }, (_, index) => ({
    day: index + 1,
    label: String(index + 1),
    income: incomeByDay[index],
    expense: expenseByDay[index]
  }));
}

class DashboardService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly budgetRepository: BudgetRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  async getDashboard(userId: string, query: { month: number; year: number }) {
    const [incomeAggregate, expenseAggregate, budgets, spendMap, recentTransactions, categories, monthTransactions] =
      await Promise.all([
        this.transactionRepository.aggregateByType(userId, query.month, query.year, 'INCOME'),
        this.transactionRepository.aggregateByType(userId, query.month, query.year, 'EXPENSE'),
        this.budgetRepository.findManyByUserAndMonth(userId, query.month, query.year),
        this.transactionRepository.getCategorySpendMap(userId, query.month, query.year),
        this.transactionRepository.findRecentByUser(userId, query.month, query.year, 5),
        this.categoryRepository.findManyByUser(userId),
        this.transactionRepository.findAmountsForMonth(userId, query.month, query.year)
      ]);

    const totalIncome = toNullableNumber(incomeAggregate._sum.amount) ?? 0;
    const totalExpense = toNullableNumber(expenseAggregate._sum.amount) ?? 0;

    const categorySpending = categories
      .filter((category) => category.type === 'EXPENSE')
      .map((category) => ({
        name: category.name,
        amount: spendMap.get(category.id) ?? 0
      }))
      .filter((item) => item.amount > 0)
      .map((item, index) => ({
        ...item,
        color: chartPalette[index % chartPalette.length]
      }));

    return {
      month: query.month,
      year: query.year,
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      },
      trend: buildDailyTrend(monthTransactions, query.month, query.year),
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

