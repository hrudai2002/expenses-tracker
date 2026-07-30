function padMonth(month) {
  return String(month).padStart(2, '0');
}

function currentMonthYearValue() {
  const now = new Date();
  return `${now.getFullYear()}-${padMonth(now.getMonth() + 1)}`;
}

function parseMonthYearValue(value) {
  const [year, month] = value.split('-').map(Number);
  return { year, month };
}

function getMonthYearOptions(count = 12) {
  const options = [];
  const now = new Date();

  for (let index = 0; index < count; index += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    options.push({
      value: `${date.getFullYear()}-${padMonth(date.getMonth() + 1)}`,
      label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    });
  }

  return options;
}

function getMonthYearLabel(value) {
  const { year, month } = parseMonthYearValue(value);
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getMonthDayProgress(month, year) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  const day = isCurrentMonth ? now.getDate() : daysInMonth;

  return { day, daysInMonth };
}

export { currentMonthYearValue, getMonthDayProgress, getMonthYearLabel, getMonthYearOptions, parseMonthYearValue };
