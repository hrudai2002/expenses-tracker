import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FilterIcon } from '../components/Icons.jsx';
import AddTransactionModal from '../components/AddTransactionModal.jsx';
import TransactionsTable from '../components/TransactionsTable.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { categoryApi, transactionApi } from '../lib/api.js';
import { formatRupee } from '../lib/currency.js';

function TransactionsPage() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedMonthYear, setSelectedMonthYear] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [modalHost, setModalHost] = useState(null);

  useEffect(() => {
    setModalHost(document.querySelector('.app-main'));
  }, []);

  const hasActiveFilters = Boolean(selectedType || selectedMonthYear || selectedCategoryId);

  const visibleCategories = useMemo(() => {
    if (!selectedType) {
      return categories;
    }

    return categories.filter((category) => category.type === selectedType);
  }, [categories, selectedType]);

  useEffect(() => {
    if (selectedCategoryId && !visibleCategories.some((category) => category.id === selectedCategoryId)) {
      setSelectedCategoryId('');
    }
  }, [selectedCategoryId, visibleCategories]);

  const loadTransactionsPage = async () => {
    setIsLoading(true);
    setErrorMessage('');

    const listParams = { limit: 100 };

    if (selectedType) {
      listParams.type = selectedType;
    }

    if (selectedCategoryId) {
      listParams.categoryId = selectedCategoryId;
    }

    if (selectedMonthYear) {
      const [year, month] = selectedMonthYear.split('-').map(Number);
      listParams.year = year;
      listParams.month = month;
    }

    try {
      const [transactionsResult, categoriesResult] = await Promise.all([
        transactionApi.list(token, listParams),
        categoryApi.list(token)
      ]);

      setTransactions(
        transactionsResult.items.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category.name,
          categoryId: item.category.id,
          categoryType: item.type,
          type: item.type === 'INCOME' ? 'Income' : 'Expense',
          rawAmount: item.amount,
          transactionDate: item.transactionDate,
          amount: formatRupee(item.amount),
          date: new Date(item.transactionDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          status: 'Logged'
        }))
      );
      setCategories(categoriesResult);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTransactionsPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, selectedType, selectedMonthYear, selectedCategoryId]);

  useEffect(() => {
    return () => setModalOpen(false);
  }, []);

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const items = query
      ? transactions.filter(
          (transaction) =>
            transaction.title.toLowerCase().includes(query) ||
            transaction.category.toLowerCase().includes(query) ||
            transaction.description.toLowerCase().includes(query)
        )
      : transactions;

    return items;
  }, [searchQuery, transactions]);

  const handleDeleteTransaction = (transaction) => {
    setPendingDelete(transaction);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage('');

    try {
      await transactionApi.delete(token, pendingDelete.id);
      setPendingDelete(null);
      await loadTransactionsPage();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTransaction(null);
  };

  const handleOpenCreateModal = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  const summary = useMemo(() => {
    return filteredTransactions.reduce(
      (totals, transaction) => {
        const amount = transaction.rawAmount;

        if (transaction.type === 'Income') {
          totals.income += amount;
        } else {
          totals.expense += amount;
        }

        totals.net = totals.income - totals.expense;
        return totals;
      },
      { income: 0, expense: 0, net: 0 }
    );
  }, [filteredTransactions]);

  const modal =
    modalOpen && modalHost ? (
      <AddTransactionModal
        token={token}
        categories={categories}
        isOpen={modalOpen}
        transaction={editingTransaction}
        onClose={handleCloseModal}
        onCreated={loadTransactionsPage}
      />
    ) : null;

  const deleteConfirm =
    pendingDelete && modalHost ? (
      <div className="modal-backdrop" onClick={() => !isDeleting && setPendingDelete(null)}>
        <div
          className="modal-card confirm-dialog"
          onClick={(event) => event.stopPropagation()}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-transaction-title"
        >
          <div className="modal-header">
            <h3 id="delete-transaction-title">Delete transaction?</h3>
            <button
              type="button"
              className="modal-close"
              onClick={() => setPendingDelete(null)}
              aria-label="Close"
              disabled={isDeleting}
            >
              ×
            </button>
          </div>
          <p className="confirm-dialog-copy">
            Are you sure you want to delete <strong>{pendingDelete.title}</strong>? This action cannot be undone.
          </p>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={() => setPendingDelete(null)} disabled={isDeleting}>
              Cancel
            </button>
            <button type="button" className="danger-button" onClick={() => void handleConfirmDelete()} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <div className="page-grid transactions-page">
      {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

      <div className="transactions-toolbar">
        <p>{isLoading ? 'Loading transactions...' : `${filteredTransactions.length} transactions found`}</p>
        <button type="button" className="primary-button" onClick={handleOpenCreateModal}>
          + Add Transaction
        </button>
      </div>

      <section className="summary-cards">
        <article className="summary-card income">
          <span>Income</span>
          <strong>{formatRupee(summary.income)}</strong>
        </article>
        <article className="summary-card expense">
          <span>Expenses</span>
          <strong>{formatRupee(summary.expense)}</strong>
        </article>
        <article className="summary-card net">
          <span>Net</span>
          <strong>{formatRupee(summary.net)}</strong>
        </article>
      </section>

      <section className="panel transactions-filters">
        <div className="transactions-search-row">
          <div className="transactions-search">
            <input
              type="search"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <button
            type="button"
            className={`filter-toggle-button${filtersOpen || hasActiveFilters ? ' active' : ''}`}
            aria-expanded={filtersOpen}
            aria-label="Toggle filters"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <FilterIcon />
            Filter
          </button>
        </div>
        {filtersOpen ? (
          <div className="transactions-filter-panel">
            <div className="filter-row transactions-filter-row">
              <button className={`chip${selectedType === '' ? ' active' : ''}`} type="button" onClick={() => setSelectedType('')}>
                All
              </button>
              <button
                className={`chip${selectedType === 'INCOME' ? ' active' : ''}`}
                type="button"
                onClick={() => setSelectedType('INCOME')}
              >
                Income
              </button>
              <button
                className={`chip${selectedType === 'EXPENSE' ? ' active' : ''}`}
                type="button"
                onClick={() => setSelectedType('EXPENSE')}
              >
                Expenses
              </button>
            </div>
            <div className="filter-controls-row">
              <label className="filter-field">
                <span>Date</span>
                <div className="filter-field-input">
                  <input
                    type="month"
                    value={selectedMonthYear}
                    onChange={(event) => setSelectedMonthYear(event.target.value)}
                  />
                  {selectedMonthYear ? (
                    <button type="button" className="filter-clear-button" onClick={() => setSelectedMonthYear('')}>
                      Clear
                    </button>
                  ) : null}
                </div>
              </label>
              <label className="filter-field">
                <span>Category</span>
                <select value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)}>
                  <option value="">All categories</option>
                  {visibleCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ) : null}
      </section>

      <TransactionsTable
        transactions={filteredTransactions}
        variant="table"
        onDelete={handleDeleteTransaction}
        onEdit={handleEditTransaction}
      />

      {modalHost ? createPortal(<>{modal}{deleteConfirm}</>, modalHost) : null}
    </div>
  );
}

export default TransactionsPage;
