import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SpendingCategoriesCard from '../components/SpendingCategoriesCard.jsx';
import SpendingTrendCard from '../components/SpendingTrendCard.jsx';
import TransactionsTable from '../components/TransactionsTable.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { dashboardApi } from '../lib/api.js';
import { formatRupee } from '../lib/currency.js';
import { currentMonthYearValue, parseMonthYearValue } from '../lib/month.js';

function DashboardPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedMonthYear = searchParams.get('month') || currentMonthYearValue();
  const { month, year } = parseMonthYearValue(selectedMonthYear);
  const [dashboardData, setDashboardData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const result = await dashboardApi.get(token, { month, year });

        if (isMounted) {
          setDashboardData(result);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message);
          setDashboardData(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [month, token, year]);

  const recentTransactions = useMemo(
    () =>
      dashboardData?.recentTransactions.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category.name,
        type: item.type === 'INCOME' ? 'Income' : 'Expense',
        rawAmount: item.amount,
        transactionDate: item.transactionDate,
        amount: formatRupee(item.amount),
        date: new Date(item.transactionDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        status: 'Logged'
      })) ?? [],
    [dashboardData]
  );

  if (isLoading) {
    return (
      <div className="page-grid">
        <div className="dashboard-charts-grid">
          <article className="panel skeleton-card chart-skeleton" />
          <article className="panel skeleton-card chart-skeleton" />
        </div>
        <article className="panel skeleton-card table-skeleton" />
      </div>
    );
  }

  return (
    <div className="page-grid">
      {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

      <section className="dashboard-charts-grid">
        <SpendingTrendCard data={dashboardData?.trend ?? []} />
        <SpendingCategoriesCard segments={dashboardData?.categorySpending ?? []} />
      </section>

      <TransactionsTable transactions={recentTransactions} variant="list" />
    </div>
  );
}

export default DashboardPage;
