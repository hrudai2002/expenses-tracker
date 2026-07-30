import { formatRupee } from '../lib/currency.js';

function BudgetProgressCard({ budgets }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h3>Budget Health</h3>
        <button type="button" className="ghost-button">Set Budget</button>
      </div>
      <div className="budget-list">
        {budgets.length ? budgets.map((budget) => {
          const ratio = Math.min((budget.spent / budget.total) * 100, 100);

          return (
            <article className="budget-item" key={budget.category}>
              <div className="budget-item-top">
                <div>
                  <strong>{budget.category}</strong>
                  <p>{formatRupee(budget.spent)} spent of {formatRupee(budget.total)}</p>
                </div>
                <span>{Math.round(ratio)}%</span>
              </div>
              <div className="progress-track">
                <div className={`progress-fill ${budget.colorClass}`} style={{ width: `${ratio}%` }} />
              </div>
            </article>
          );
        }) : <div className="empty-panel-state">No budgets created for this month yet.</div>}
      </div>
    </section>
  );
}

export default BudgetProgressCard;
