export const userProfile = {
  name: 'Alex Morgan',
  email: 'alex@example.com',
  role: 'Smart Tracker'
};

export const dashboardMetrics = [
  { label: 'Monthly Income', value: '₹6,420.00', tone: 'success', helper: 'Salary + freelance' },
  { label: 'Monthly Expenses', value: '₹2,910.00', tone: 'danger', helper: '78 entries tracked' },
  { label: 'Monthly Savings', value: '₹3,510.00', tone: 'primary', helper: '54.6% of income' },
  { label: 'Budget Left', value: '₹1,190.00', tone: 'info', helper: 'Across 6 categories' }
];

export const monthlyComparison = [
  { month: 'Feb', income: 4200, expense: 1920 },
  { month: 'Mar', income: 4680, expense: 2140 },
  { month: 'Apr', income: 5120, expense: 2330 },
  { month: 'May', income: 5480, expense: 2460 },
  { month: 'Jun', income: 6210, expense: 2790 },
  { month: 'Jul', income: 6420, expense: 2910 }
];

export const spendingHighlights = [
  { name: 'Food & Dining', amount: '₹648.00', ratio: 82, colorClass: 'accent-orange' },
  { name: 'Housing', amount: '₹1,240.00', ratio: 96, colorClass: 'accent-purple' },
  { name: 'Transport', amount: '₹318.00', ratio: 48, colorClass: 'accent-blue' },
  { name: 'Shopping', amount: '₹424.00', ratio: 62, colorClass: 'accent-green' }
];

export const transactions = [
  {
    id: 'TRX-1032',
    title: 'Salary Credit',
    description: 'July monthly salary',
    category: 'Salary',
    type: 'Income',
    amount: '₹4,900.00',
    date: 'Jul 28, 2026',
    status: 'Cleared'
  },
  {
    id: 'TRX-1031',
    title: 'Whole Foods',
    description: 'Weekly grocery run',
    category: 'Food',
    type: 'Expense',
    amount: '₹132.00',
    date: 'Jul 27, 2026',
    status: 'Cleared'
  },
  {
    id: 'TRX-1027',
    title: 'Adobe Subscription',
    description: 'Creative Cloud monthly renewal',
    category: 'Subscriptions',
    type: 'Expense',
    amount: '₹34.00',
    date: 'Jul 24, 2026',
    status: 'Auto-paid'
  },
  {
    id: 'TRX-1022',
    title: 'Client Retainer',
    description: 'Product design retainer payout',
    category: 'Freelance',
    type: 'Income',
    amount: '₹1,520.00',
    date: 'Jul 22, 2026',
    status: 'Received'
  },
  {
    id: 'TRX-1019',
    title: 'Uber',
    description: 'Airport ride',
    category: 'Transport',
    type: 'Expense',
    amount: '₹28.00',
    date: 'Jul 20, 2026',
    status: 'Cleared'
  }
];

export const budgets = [
  { category: 'Housing', spent: 1240, total: 1400, colorClass: 'accent-purple' },
  { category: 'Food & Dining', spent: 648, total: 800, colorClass: 'accent-orange' },
  { category: 'Transport', spent: 318, total: 500, colorClass: 'accent-blue' },
  { category: 'Shopping', spent: 424, total: 700, colorClass: 'accent-green' },
  { category: 'Subscriptions', spent: 92, total: 160, colorClass: 'accent-pink' }
];

export const quickStats = [
  { label: 'Transactions Logged', value: '78' },
  { label: 'Expense Categories', value: '06' },
  { label: 'Upcoming Bills', value: '03' }
];

