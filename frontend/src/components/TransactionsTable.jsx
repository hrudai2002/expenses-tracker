import { useMemo, useState } from 'react';
import { formatRupee } from '../lib/currency.js';
import { DeleteIcon, EditIcon, SortIcon } from './Icons.jsx';

function getTransactionEmoji(title, category) {
  const value = `${title} ${category}`.toLowerCase();

  if (value.includes('salary') || value.includes('income')) return '💼';
  if (value.includes('food') || value.includes('grocery') || value.includes('dining') || value.includes('milk')) return '🍔';
  if (value.includes('uber') || value.includes('transport') || value.includes('ride')) return '🚗';
  if (value.includes('netflix') || value.includes('entertainment')) return '🎬';
  if (value.includes('rent') || value.includes('housing')) return '🏠';
  if (value.includes('coffee')) return '☕';
  if (value.includes('electric') || value.includes('utility')) return '💡';

  return '💳';
}

function getCategoryTone(category) {
  const value = category.toLowerCase();

  if (value.includes('salary') || value.includes('income')) return 'green';
  if (value.includes('food') || value.includes('dining')) return 'orange';
  if (value.includes('transport')) return 'blue';
  if (value.includes('entertainment')) return 'pink';
  if (value.includes('rent') || value.includes('housing')) return 'purple';
  if (value.includes('utility') || value.includes('electric')) return 'yellow';

  return 'neutral';
}

function SortHeader({ label, sortKey, activeKey, direction, onSort }) {
  const isActive = activeKey === sortKey;

  return (
    <button
      type="button"
      className={`sort-header-button${isActive ? ' active' : ''}`}
      onClick={() => onSort(sortKey)}
    >
      <span>{label}</span>
      <span className="sort-icon-wrap">
        <SortIcon direction={isActive ? direction : 'none'} />
      </span>
    </button>
  );
}

function TransactionsTable({ transactions, variant = 'table', onDelete, onEdit }) {
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const sortedTransactions = useMemo(() => {
    const multiplier = sortConfig.direction === 'asc' ? 1 : -1;

    return [...transactions].sort((left, right) => {
      if (sortConfig.key === 'amount') {
        return multiplier * (left.rawAmount - right.rawAmount);
      }

      return multiplier * (new Date(left.transactionDate).getTime() - new Date(right.transactionDate).getTime());
    });
  }, [sortConfig.direction, sortConfig.key, transactions]);

  const handleSort = (key) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }

      return { key, direction: 'desc' };
    });
  };

  if (variant === 'list') {
    return (
      <section className="panel">
        <div className="panel-heading">
          <h3>Recent Transactions</h3>
          <button type="button" className="ghost-button">View all</button>
        </div>
        <div className="transaction-list">
          {sortedTransactions.length ? (
            sortedTransactions.map((transaction) => (
              <article className="transaction-list-item" key={transaction.id}>
                <div className={`transaction-icon ${transaction.type === 'Income' ? 'income' : 'expense'}`}>
                  {getTransactionEmoji(transaction.title, transaction.category)}
                </div>
                <div className="transaction-copy">
                  <strong>{transaction.title}</strong>
                  <p>
                    {transaction.category} · {transaction.date}
                  </p>
                </div>
                <div className={`transaction-amount ${transaction.type === 'Income' ? 'positive' : ''}`}>
                  {transaction.type === 'Income' ? '+' : '-'}
                  {transaction.amount.replace(/^[+-]/, '')}
                </div>
              </article>
            ))
          ) : (
            <p className="empty-panel-state">No transactions available yet. Add your first entry to begin tracking.</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="panel transactions-panel">
      <div className="table-shell">
        <table className="transactions-table figma-table">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Category</th>
              <th>
                <SortHeader
                  label="Date"
                  sortKey="date"
                  activeKey={sortConfig.key}
                  direction={sortConfig.direction}
                  onSort={handleSort}
                />
              </th>
              <th>
                <SortHeader
                  label="Amount"
                  sortKey="amount"
                  activeKey={sortConfig.key}
                  direction={sortConfig.direction}
                  onSort={handleSort}
                />
              </th>
              {onDelete || onEdit ? <th aria-label="Actions" /> : null}
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.length ? (
              sortedTransactions.map((transaction) => (
                <tr className="transaction-row" key={transaction.id}>
                  <td>
                    <div className="transaction-cell">
                      <span className="transaction-cell-icon">{getTransactionEmoji(transaction.title, transaction.category)}</span>
                      <strong>{transaction.title}</strong>
                    </div>
                  </td>
                  <td>
                    <span className={`category-pill ${getCategoryTone(transaction.category)}`}>{transaction.category}</span>
                  </td>
                  <td>{transaction.date}</td>
                  <td className={`amount-cell ${transaction.type === 'Income' ? 'positive' : ''}`}>
                    {transaction.type === 'Income' ? '+' : '-'}
                    {formatRupee(transaction.rawAmount)}
                  </td>
                  {onDelete || onEdit ? (
                    <td className="table-action-cell">
                      <div className="row-actions">
                        {onEdit ? (
                          <button
                            type="button"
                            className="row-action-button edit"
                            aria-label={`Edit ${transaction.title}`}
                            onClick={() => onEdit(transaction)}
                          >
                            <EditIcon />
                          </button>
                        ) : null}
                        {onDelete ? (
                          <button
                            type="button"
                            className="row-action-button delete"
                            aria-label={`Delete ${transaction.title}`}
                            onClick={() => onDelete(transaction)}
                          >
                            <DeleteIcon />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={onDelete || onEdit ? 5 : 4} className="empty-table-state">
                  No transactions yet. Create a category, then add your first transaction.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default TransactionsTable;
