import { useEffect, useMemo, useState } from 'react';
import { categoryApi, transactionApi } from '../lib/api.js';

const categoryColors = ['#6366F1', '#F97316', '#22C55E', '#EC4899', '#06B6D4', '#EAB308'];

function pickCategoryColor(categories) {
  const used = new Set(categories.map((category) => category.color?.toLowerCase()).filter(Boolean));
  return categoryColors.find((color) => !used.has(color.toLowerCase())) ?? categoryColors[categories.length % categoryColors.length];
}

function AddTransactionModal({ token, categories, isOpen, onClose, onCreated, transaction = null }) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const isEditing = Boolean(transaction);
  const [transactionType, setTransactionType] = useState('EXPENSE');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    title: '',
    amount: '',
    categoryId: '',
    transactionDate: today,
    note: ''
  });

  const filteredCategories = categories.filter((category) => category.type === transactionType);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setErrorMessage('');
    setShowNewCategory(false);
    setNewCategoryName('');

    if (transaction) {
      setTransactionType(transaction.categoryType);
      setFormState({
        title: transaction.title,
        amount: String(transaction.rawAmount),
        categoryId: transaction.categoryId,
        transactionDate: transaction.transactionDate.slice(0, 10),
        note: transaction.description === transaction.title ? '' : transaction.description
      });
      return;
    }

    setTransactionType('EXPENSE');
    setFormState({
      title: '',
      amount: '',
      categoryId: '',
      transactionDate: today,
      note: ''
    });
  }, [isOpen, today, transaction]);

  useEffect(() => {
    if (!filteredCategories.some((category) => category.id === formState.categoryId)) {
      setFormState((currentState) => ({
        ...currentState,
        categoryId: filteredCategories[0]?.id || ''
      }));
    }
  }, [filteredCategories, formState.categoryId, transactionType]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleCreateCategory = async () => {
    setErrorMessage('');

    try {
      const createdCategory = await categoryApi.create(token, {
        name: newCategoryName.trim(),
        type: transactionType,
        color: pickCategoryColor(categories)
      });

      setFormState((currentState) => ({
        ...currentState,
        categoryId: createdCategory.id
      }));
      setNewCategoryName('');
      setShowNewCategory(false);
      await onCreated();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const payload = {
      title: formState.title.trim(),
      description: formState.note.trim() || formState.title.trim(),
      categoryId: formState.categoryId,
      amount: Number(formState.amount),
      transactionDate: new Date(formState.transactionDate).toISOString()
    };

    try {
      if (isEditing) {
        await transactionApi.update(token, transaction.id, payload);
      } else {
        await transactionApi.create(token, payload);
      }

      onClose();
      await onCreated();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="add-transaction-title">
        <div className="modal-header">
          <h3 id="add-transaction-title">{isEditing ? 'Edit Transaction' : 'Add Transaction'}</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="type-toggle">
            <button
              type="button"
              className={transactionType === 'EXPENSE' ? 'active expense' : ''}
              onClick={() => setTransactionType('EXPENSE')}
            >
              Expense
            </button>
            <button
              type="button"
              className={transactionType === 'INCOME' ? 'active income' : ''}
              onClick={() => setTransactionType('INCOME')}
            >
              Income
            </button>
          </div>

          <label>
            <span>Title</span>
            <input
              value={formState.title}
              onChange={(event) => setFormState((currentState) => ({ ...currentState, title: event.target.value }))}
              placeholder="e.g., Grocery shopping"
              required
            />
          </label>

          <label>
            <span>Amount (₹)</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={formState.amount}
              onChange={(event) => setFormState((currentState) => ({ ...currentState, amount: event.target.value }))}
              placeholder="0.00"
              required
            />
          </label>

          <div className="category-field">
            <label>
              <span>Category</span>
              {showNewCategory ? (
                <div className="new-category-row">
                  <input
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    placeholder="Category name"
                  />
                  <button type="button" className="ghost-button" onClick={() => void handleCreateCategory()} disabled={!newCategoryName.trim()}>
                    Save
                  </button>
                  <button type="button" className="text-button" onClick={() => setShowNewCategory(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <select
                  value={formState.categoryId}
                  onChange={(event) => setFormState((currentState) => ({ ...currentState, categoryId: event.target.value }))}
                  required
                >
                  <option value="" disabled>
                    {filteredCategories.length ? 'Select a category' : 'No categories yet'}
                  </option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </label>
            {!showNewCategory ? (
              <button type="button" className="text-button" onClick={() => setShowNewCategory(true)}>
                + New category
              </button>
            ) : null}
          </div>

          <label>
            <span>Date</span>
            <input
              type="date"
              value={formState.transactionDate}
              onChange={(event) =>
                setFormState((currentState) => ({ ...currentState, transactionDate: event.target.value }))
              }
              required
            />
          </label>

          <label>
            <span>Note (optional)</span>
            <textarea
              rows="3"
              value={formState.note}
              onChange={(event) => setFormState((currentState) => ({ ...currentState, note: event.target.value }))}
              placeholder="Add a note..."
            />
          </label>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSubmitting || !formState.categoryId}>
              {isSubmitting ? (isEditing ? 'Saving...' : 'Adding...') : isEditing ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTransactionModal;
