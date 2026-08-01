import { useEffect, useMemo, useState } from 'react';
import { budgetApi } from '../lib/api.js';
import { getMonthYearLabel } from '../lib/month.js';
import { ChevronDownIcon } from './Icons.jsx';

function AddBudgetModal({ token, isOpen, onClose, onSaved, categories, expenseCategoryCount = 0, budget = null, month, year }) {
  const isEditing = Boolean(budget);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const monthLabel = useMemo(() => getMonthYearLabel(`${year}-${String(month).padStart(2, '0')}`), [month, year]);
  const noCategoriesAvailable = !isEditing && !categories.length;

  const emptyMessage = useMemo(() => {
    if (!noCategoriesAvailable) {
      return '';
    }

    if (!expenseCategoryCount) {
      return 'Create an expense category first from the Transactions page, then come back to set a budget.';
    }

    return `Every expense category already has a budget for ${monthLabel}. Edit an existing budget or create a new category from Transactions.`;
  }, [expenseCategoryCount, monthLabel, noCategoriesAvailable]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setErrorMessage('');

    if (budget) {
      setAmount(String(budget.amount));
      setCategoryId(budget.category.id);
      return;
    }

    setAmount('');
    setCategoryId(categories[0]?.id || '');
  }, [budget, categories, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const payload = {
      categoryId: budget ? budget.category.id : categoryId,
      amount: Number(amount),
      month,
      year
    };

    try {
      if (isEditing) {
        await budgetApi.update(token, budget.id, payload);
      } else {
        await budgetApi.create(token, payload);
      }

      onClose();
      await onSaved();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-modal-title"
      >
        <div className="modal-header">
          <h3 id="budget-modal-title">{isEditing ? 'Edit Budget' : 'Add Budget'}</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {noCategoriesAvailable ? (
          <div className="modal-empty-state">
            <p className="budget-modal-subtitle">Setting budget for {monthLabel}</p>
            <p>{emptyMessage}</p>
            <div className="modal-actions">
              <button type="button" className="primary-button" onClick={onClose}>
                Got it
              </button>
            </div>
          </div>
        ) : (
          <form className="modal-form" onSubmit={handleSubmit}>
            <p className="budget-modal-subtitle">Setting budget for {monthLabel}</p>

            {isEditing ? (
              <label>
                <span>Category</span>
                <input value={budget.category.name} disabled />
              </label>
            ) : (
              <label>
                <span>Category</span>
                <span className="modal-select-wrap">
                  <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon />
                </span>
              </label>
            )}

            <label>
              <span>Budget Amount (₹)</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="500.00"
                required
              />
            </label>

            {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={isSubmitting || (!isEditing && !categoryId)}>
                {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Budget'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AddBudgetModal;
