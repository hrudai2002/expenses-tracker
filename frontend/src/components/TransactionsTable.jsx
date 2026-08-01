import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatRupee } from '../lib/currency.js';
import { DeleteIcon, EditIcon, SortIcon } from './Icons.jsx';

function getTransactionEmoji(title, category) {
  const cat = category.toLowerCase();
  const value = `${title} ${category}`.toLowerCase();

  if (cat.includes('grocer')) return '🛒';
  if (cat.includes('food') || cat.includes('dining')) return '🍔';
  if (cat.includes('travel') || cat.includes('transport')) return '🚗';
  if (cat.includes('entertainment')) return '🎬';
  if (cat.includes('rent') || cat.includes('housing')) return '🏠';
  if (cat.includes('utility') || cat.includes('electric')) return '💡';
  if (cat.includes('salary') || cat.includes('income')) return '💼';

  if (value.includes('salary') || value.includes('income')) return '💼';
  if (value.includes('uber') || value.includes('ride')) return '🚗';
  if (value.includes('netflix')) return '🎬';
  if (value.includes('coffee')) return '☕';
  if (value.includes('milk')) return '🥛';

  return '💳';
}

function getCategoryTone(category) {
  const value = category.toLowerCase();

  if (value.includes('salary') || value.includes('income')) return 'green';
  if (value.includes('groc')) return 'teal';
  if (value.includes('food') || value.includes('dining')) return 'orange';
  if (value.includes('transport') || value.includes('travel')) return 'blue';
  if (value.includes('entertainment')) return 'pink';
  if (value.includes('rent') || value.includes('housing')) return 'purple';
  if (value.includes('utility') || value.includes('electric')) return 'yellow';

  return 'neutral';
}

function getTransactionNote(transaction) {
  const note = transaction.description?.trim();

  if (!note || note === transaction.title.trim()) {
    return null;
  }

  return note;
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
          <Link to="/transactions" className="ghost-button">
            View all
          </Link>
        </div>
        <div className="transaction-list">
          {sortedTransactions.length ? (
            sortedTransactions.map((transaction) => {
              const note = getTransactionNote(transaction);

              return (
                <article className="transaction-list-item" key={transaction.id}>
                  <div className={`transaction-icon ${transaction.type === 'Income' ? 'income' : 'expense'}`}>
                    {getTransactionEmoji(transaction.title, transaction.category)}
                  </div>
                  <div className="transaction-copy">
                    <strong>{transaction.title}</strong>
                    {note ? <p className="transaction-note">{note}</p> : null}
                    <p>
                      {transaction.category} · {transaction.date}
                    </p>
                  </div>
                  <div className={`transaction-amount ${transaction.type === 'Income' ? 'positive' : ''}`}>
                    {transaction.type === 'Income' ? '+' : '-'}
                    {transaction.amount.replace(/^[+-]/, '')}
                  </div>
                </article>
              );
            })
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
              sortedTransactions.map((transaction) => {
                const note = getTransactionNote(transaction);

                return (
                  <tr className="transaction-row" key={transaction.id}>
                    <td>
                      <div className="transaction-cell">
                        <span className="transaction-cell-icon">
                          {getTransactionEmoji(transaction.title, transaction.category)}
                        </span>
                        <div className="transaction-cell-copy">
                          <strong>{transaction.title}</strong>
                          {note ? <span className="transaction-note">{note}</span> : null}
                        </div>
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
                );
              })
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
