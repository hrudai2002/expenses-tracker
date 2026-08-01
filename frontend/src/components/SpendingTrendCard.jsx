import { formatRupee } from '../lib/currency.js';

function shouldShowDayLabel(day, totalDays) {
  return day === 1 || day % 5 === 0 || day === totalDays;
}

function SpendingTrendCard({ data }) {
  const width = 560;
  const height = 220;
  const padding = { top: 16, right: 16, bottom: 28, left: 48 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(...data.flatMap((point) => [point.income, point.expense]), 1);

  const xStep = data.length > 1 ? chartWidth / (data.length - 1) : 0;

  const toPoint = (value, index) => {
    const x = padding.left + index * xStep;
    const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
    return `${x},${y}`;
  };

  const incomePath = data.map((point, index) => toPoint(point.income, index)).join(' ');
  const expensePath = data.map((point, index) => toPoint(point.expense, index)).join(' ');
  const yTicks = [0, maxValue * 0.5, maxValue];

  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <h3>Spending Trend</h3>
      </div>
      <div className="line-chart-shell">
        <svg viewBox={`0 0 ${width} ${height}`} className="line-chart" role="img" aria-label="Daily spending trend chart">
          {yTicks.map((tick) => {
            const y = padding.top + chartHeight - (tick / maxValue) * chartHeight;
            return (
              <g key={tick}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} className="line-chart-grid" />
                <text x={padding.left - 10} y={y + 4} className="line-chart-tick">
                  {formatRupee(tick).replace('.00', '')}
                </text>
              </g>
            );
          })}
          <polyline points={expensePath} className="line-chart-line expense" fill="none" />
          <polyline points={incomePath} className="line-chart-line income" fill="none" />
          {data.map((point, index) => {
            const x = padding.left + index * xStep;
            const showLabel = shouldShowDayLabel(point.day, data.length);

            return showLabel ? (
              <text key={point.day} x={x} y={height - 8} className="line-chart-label" textAnchor="middle">
                {point.label}
              </text>
            ) : null;
          })}
        </svg>
        <div className="chart-legend">
          <span><i className="legend-swatch income" /> Income</span>
          <span><i className="legend-swatch expense" /> Expenses</span>
        </div>
      </div>
    </section>
  );
}

export default SpendingTrendCard;
