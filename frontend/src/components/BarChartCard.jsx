import { formatRupee } from '../lib/currency.js';

function BarChartCard({ title, data }) {
  const maxValue = Math.max(...data.flatMap((item) => [item.income, item.expense]));

  return (
    <section className="panel chart-panel large">
      <div className="panel-heading">
        <h3>{title}</h3>
      </div>
      <div className="bar-chart">
        <div className="chart-grid">
          {[0, 2000, 4000, 6000, 8000].reverse().map((tick) => (
            <div className="chart-grid-row" key={tick}>
              <span>{formatRupee(tick).replace('.00', '')}</span>
              <div />
            </div>
          ))}
        </div>
        <div className="chart-bars">
          {data.map((item) => (
            <div className="chart-group" key={item.month}>
              <div className="bar-stack">
                <div
                  className="bar income"
                  style={{ height: `${(item.income / maxValue) * 100}%` }}
                  title={`${item.month} income ${item.income}`}
                />
                <div
                  className="bar expense"
                  style={{ height: `${(item.expense / maxValue) * 100}%` }}
                  title={`${item.month} expense ${item.expense}`}
                />
              </div>
              <span>{item.month}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="chart-legend">
        <span><i className="legend-swatch income" /> Income</span>
        <span><i className="legend-swatch expense" /> Expenses</span>
      </div>
    </section>
  );
}

export default BarChartCard;

