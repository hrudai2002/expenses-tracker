import { formatRupee } from '../lib/currency.js';

const palette = ['#6567eb', '#ff8a33', '#6b5ffc', '#ffcc33', '#33c56c', '#ff66bb'];

function SpendingCategoriesCard({ segments }) {
  const total = segments.reduce((sum, segment) => sum + segment.amount, 0);
  let cursor = 0;

  const gradient =
    total > 0
      ? segments
          .map((segment, index) => {
            const start = cursor;
            cursor += (segment.amount / total) * 100;
            return `${segment.color || palette[index % palette.length]} ${start}% ${cursor}%`;
          })
          .join(', ')
      : '#e6e9f6 0% 100%';

  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <h3>Spending Categories</h3>
      </div>
      <div className="donut-chart-shell">
        <div className="donut-chart" style={{ background: `conic-gradient(${gradient})` }}>
          <div className="donut-chart-hole">
            <strong>{formatRupee(total)}</strong>
            <span>Total</span>
          </div>
        </div>
        <div className="donut-legend">
          {segments.length ? (
            segments.map((segment, index) => (
              <div className="donut-legend-item" key={segment.name}>
                <span
                  className="dot"
                  style={{ background: segment.color || palette[index % palette.length] }}
                />
                <div>
                  <strong>{segment.name}</strong>
                  <p>{formatRupee(segment.amount)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="empty-panel-state">No expense data for this month yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default SpendingCategoriesCard;
