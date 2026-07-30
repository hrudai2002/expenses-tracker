import { useLocation, useSearchParams } from 'react-router-dom';
import { ChevronDownIcon } from './Icons.jsx';
import { currentMonthYearValue, getMonthYearOptions } from '../lib/month.js';

const pageTitles = {
  dashboard: 'Dashboard',
  transactions: 'Transactions',
  budgets: 'Budget'
};

const monthFilterPages = new Set(['dashboard', 'budgets']);

function Topbar() {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageKey = pathname.replace('/', '') || 'dashboard';
  const monthOptions = getMonthYearOptions(12);
  const selectedMonthYear = searchParams.get('month') || currentMonthYearValue();

  const handleMonthChange = (event) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('month', event.target.value);
    setSearchParams(nextParams);
  };

  return (
    <header className="topbar">
      <h2 className="topbar-title">{pageTitles[pageKey] || 'SpendWise'}</h2>
      {monthFilterPages.has(pageKey) ? (
        <div className="topbar-actions">
          <label className="month-select-field">
            <span className="sr-only">Select month</span>
            <span className="month-select-wrap">
              <select className="month-select" value={selectedMonthYear} onChange={handleMonthChange}>
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon />
            </span>
          </label>
        </div>
      ) : null}
    </header>
  );
}

export default Topbar;
