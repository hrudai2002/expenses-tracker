import { formatRupee } from '../lib/currency.js';

const chartPalette = ['#6366F1', '#F97316', '#22C55E', '#EC4899', '#06B6D4', '#EAB308'];

function SpendingCategoriesCard({ segments }) {
  const total = segments.reduce((sum, segment) => sum + segment.amount, 0);
  let cursor = 0;

  const gradient =
    total > 0
      ? segments
          .map((segment, index) => {
            const color = chartPalette[index % chartPalette.length];
            const start = cursor;
            cursor += (segment.amount / total) * 100;
            return `${color} ${start}% ${cursor}%`;
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
                <span className="dot" style={{ background: chartPalette[index % chartPalette.length] }} />
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
