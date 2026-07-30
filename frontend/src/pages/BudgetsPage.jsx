import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import AddBudgetModal from '../components/AddBudgetModal.jsx';
import { EditIcon } from '../components/Icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { budgetApi, categoryApi } from '../lib/api.js';
import { formatRupee } from '../lib/currency.js';
import { currentMonthYearValue, getMonthDayProgress, getMonthYearLabel, parseMonthYearValue } from '../lib/month.js';

const palette = ['#6567eb', '#ff8a33', '#6b5ffc', '#ff66bb', '#33c56c', '#ffcc33'];

function getCategoryEmoji(name) {
  const value = name.toLowerCase();

  if (value.includes('food') || value.includes('dining') || value.includes('grocery')) return '🍔';
  if (value.includes('transport') || value.includes('uber') || value.includes('ride')) return '🚗';
  if (value.includes('shop')) return '🛍️';
  if (value.includes('entertainment') || value.includes('netflix')) return '🎬';
  if (value.includes('rent') || value.includes('housing')) return '🏠';
  if (value.includes('utility') || value.includes('electric')) return '💡';

  return '💳';
}

function BudgetsPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedMonthYear = searchParams.get('month') || currentMonthYearValue();
  const { month, year } = parseMonthYearValue(selectedMonthYear);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [modalHost, setModalHost] = useState(null);

  useEffect(() => {
    setModalHost(document.querySelector('.app-main'));
  }, []);

  const loadBudgets = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const [budgetsResult, categoriesResult] = await Promise.all([
        budgetApi.list(token, { month, year }),
        categoryApi.list(token)
      ]);

      setBudgets(budgetsResult);
      setCategories(categoriesResult.filter((category) => category.type === 'EXPENSE'));
    } catch (error) {
      setErrorMessage(error.message);
      setBudgets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, month, year]);

  const monthLabel = getMonthYearLabel(selectedMonthYear);
  const { day, daysInMonth } = getMonthDayProgress(month, year);

  const totals = useMemo(() => {
    return budgets.reduce(
      (summary, budget) => {
        summary.totalBudget += budget.amount;
        summary.totalSpent += budget.spentAmount;
        return summary;
      },
      { totalBudget: 0, totalSpent: 0 }
    );
  }, [budgets]);

  const remaining = totals.totalBudget - totals.totalSpent;
  const usedPercent = totals.totalBudget > 0 ? Math.min((totals.totalSpent / totals.totalBudget) * 100, 100) : 0;

  const availableCategories = useMemo(
    () => categories.filter((category) => !budgets.some((budget) => budget.category.id === category.id)),
    [budgets, categories]
  );

  const handleOpenCreate = () => {
    setEditingBudget(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (budget) => {
    setEditingBudget(budget);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBudget(null);
  };

  const modal =
    modalOpen && modalHost ? (
      <AddBudgetModal
        token={token}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSaved={loadBudgets}
        categories={availableCategories}
        budget={editingBudget}
        month={month}
        year={year}
      />
    ) : null;

  if (isLoading) {
    return (
      <div className="page-grid budgets-page">
        <article className="panel skeleton-card budget-overview-skeleton" />
        <article className="panel skeleton-card budget-grid-skeleton" />
      </div>
    );
  }

  return (
    <div className="page-grid budgets-page">
      {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

      <section className="budget-overview-card">
        <div className="budget-overview-top">
          <div>
            <p className="budget-overview-eyebrow">Monthly Budget Overview</p>
            <h3>
              {formatRupee(totals.totalSpent)} <span>/ {formatRupee(totals.totalBudget)}</span>
            </h3>
          </div>
          <span className="budget-month-badge">{monthLabel}</span>
        </div>

        <div className="budget-overview-progress">
          <div className="budget-overview-track">
            <div className="budget-overview-fill" style={{ width: `${usedPercent}%` }} />
          </div>
          <div className="budget-overview-meta">
            <span>
              Day {day} of {daysInMonth}
            </span>
            <span>{usedPercent.toFixed(1)}% used</span>
          </div>
        </div>

        <div className="budget-overview-stats">
          <div>
            <span>Total Budget</span>
            <strong>{formatRupee(totals.totalBudget)}</strong>
          </div>
          <div>
            <span>Spent</span>
            <strong className="spent">{formatRupee(totals.totalSpent)}</strong>
          </div>
          <div>
            <span>Remaining</span>
            <strong className="remaining">{formatRupee(remaining)}</strong>
          </div>
        </div>
      </section>

      <section className="panel budget-categories-panel">
        <div className="panel-heading">
          <h3>Category Budgets</h3>
          <div className="budget-panel-actions">
            <span className="budget-panel-hint">Click ✏️ to edit budgets</span>
            <button type="button" className="primary-button" onClick={handleOpenCreate} disabled={!availableCategories.length}>
              + Add Budget
            </button>
          </div>
        </div>

        {budgets.length ? (
          <div className="budget-category-grid">
            {budgets.map((budget, index) => {
              const color = budget.category.color || palette[index % palette.length];
              const ratio = budget.amount > 0 ? Math.min((budget.spentAmount / budget.amount) * 100, 100) : 0;

              return (
                <article className="budget-category-card" key={budget.id}>
                  <div className="budget-category-card-top">
                    <div className="budget-category-title">
                      <span className="budget-category-icon" style={{ background: `${color}20`, color }}>
                        {getCategoryEmoji(budget.category.name)}
                      </span>
                      <div>
                        <strong>{budget.category.name}</strong>
                        <p>{formatRupee(budget.remainingAmount)} remaining</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="row-action-button edit"
                      aria-label={`Edit ${budget.category.name} budget`}
                      onClick={() => handleOpenEdit(budget)}
                    >
                      <EditIcon />
                    </button>
                  </div>

                  <div className="budget-category-amounts">
                    <span>
                      Budget: <strong>{formatRupee(budget.amount)}</strong>
                    </span>
                    <span>
                      Spent: <strong>{formatRupee(budget.spentAmount)}</strong>
                    </span>
                  </div>

                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${ratio}%`, background: color }} />
                  </div>
                  <p className="budget-category-percent">{Math.round(ratio)}% used</p>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-panel-state">
            No budgets for {monthLabel} yet.{' '}
            {availableCategories.length ? (
              <button type="button" className="text-button" onClick={handleOpenCreate}>
                Add your first budget
              </button>
            ) : (
              'Create an expense category first, then add a budget.'
            )}
          </div>
        )}
      </section>

      {modalHost ? createPortal(modal, modalHost) : null}
    </div>
  );
}

export default BudgetsPage;
