export interface Split {
  member: string;
  amount: number;
}

export interface Balance {
  [member: string]: number;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

interface ExpenseLike {
  category: string;
  amount: number;
  paidBy: string;
  createdAt?: string | Date;
  splitAmong: Split[];
}

interface WeeklyTrend {
  currentWeekTotal: number;
  previousWeekTotal: number;
  percentageChange: number;
  direction: 'up' | 'down' | 'flat';
}

// Split expense equally among members
export function splitEqually(amount: number, members: string[]): Split[] {
  const splitAmount = amount / members.length;
  return members.map(member => ({
    member,
    amount: Math.round(splitAmount * 100) / 100,
  }));
}

// Split expense with custom amounts
export function splitCustom(splits: Split[]): Split[] {
  return splits.map(split => ({
    ...split,
    amount: Math.round(split.amount * 100) / 100,
  }));
}

// Calculate balances for all members
export function calculateBalances(expenses: ExpenseLike[]): Balance {
  const balances: Balance = {};

  expenses.forEach(expense => {
    // Add money paid by someone
    if (!balances[expense.paidBy]) {
      balances[expense.paidBy] = 0;
    }
    balances[expense.paidBy] += expense.amount;

    // Subtract what each person owes
    expense.splitAmong.forEach((split: Split) => {
      if (!balances[split.member]) {
        balances[split.member] = 0;
      }
      balances[split.member] -= split.amount;
    });
  });

  return balances;
}

// Calculate who owes whom
export function calculateSettlements(balances: Balance): Settlement[] {
  const debtors = Object.entries(balances)
    .filter(([, amount]) => amount < 0)
    .map(([member, amount]) => ({ member, amount: Math.abs(amount) }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = Object.entries(balances)
    .filter(([, amount]) => amount > 0)
    .map(([member, amount]) => ({ member, amount }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let debtorIdx = 0;
  let creditorIdx = 0;

  while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
    const debtor = debtors[debtorIdx];
    const creditor = creditors[creditorIdx];

    const settleAmount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      from: debtor.member,
      to: creditor.member,
      amount: Math.round(settleAmount * 100) / 100,
    });

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount === 0) debtorIdx++;
    if (creditor.amount === 0) creditorIdx++;
  }

  return settlements;
}

// Categorize expense using AI (mock implementation)
export function categorizeExpense(description: string): string {
  const lower = description.toLowerCase();

  if (lower.includes('food') || lower.includes('restaurant') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('breakfast')) {
    return 'food';
  }
  if (lower.includes('taxi') || lower.includes('uber') || lower.includes('travel') || lower.includes('flight') || lower.includes('train')) {
    return 'travel';
  }
  if (lower.includes('hotel') || lower.includes('stay') || lower.includes('accommodation') || lower.includes('airbnb')) {
    return 'accommodation';
  }
  if (lower.includes('movie') || lower.includes('game') || lower.includes('show') || lower.includes('entertainment')) {
    return 'entertainment';
  }
  if (lower.includes('electricity') || lower.includes('water') || lower.includes('internet') || lower.includes('utility')) {
    return 'utilities';
  }

  return 'other';
}

// Get spending insights
export function getSpendingInsights(expenses: ExpenseLike[]) {
  const categorySpending: { [key: string]: number } = {};
  const memberSpending: { [key: string]: number } = {};

  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay());
  currentWeekStart.setHours(0, 0, 0, 0);

  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(currentWeekStart.getDate() - 7);

  let currentWeekTotal = 0;
  let previousWeekTotal = 0;

  expenses.forEach(expense => {
    // Category spending
    categorySpending[expense.category] = (categorySpending[expense.category] || 0) + expense.amount;

    // Member spending
    memberSpending[expense.paidBy] = (memberSpending[expense.paidBy] || 0) + expense.amount;

    if (expense.createdAt) {
      const createdAt = new Date(expense.createdAt);
      if (createdAt >= currentWeekStart) {
        currentWeekTotal += expense.amount;
      } else if (createdAt >= previousWeekStart && createdAt < currentWeekStart) {
        previousWeekTotal += expense.amount;
      }
    }
  });

  const totalSpent = Object.values(categorySpending).reduce((a, b) => a + b, 0);

  const categoryPercentages = Object.entries(categorySpending).map(([category, amount]) => ({
    category,
    amount,
    percentage: ((amount / totalSpent) * 100).toFixed(2),
  }));

  let percentageChange = 0;
  if (previousWeekTotal > 0) {
    percentageChange = ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100;
  } else if (currentWeekTotal > 0) {
    percentageChange = 100;
  }

  const weeklyTrend: WeeklyTrend = {
    currentWeekTotal: Math.round(currentWeekTotal * 100) / 100,
    previousWeekTotal: Math.round(previousWeekTotal * 100) / 100,
    percentageChange: Math.round(percentageChange * 100) / 100,
    direction: percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'flat',
  };

  return {
    totalSpent,
    categorySpending,
    memberSpending,
    categoryPercentages,
    weeklyTrend,
  };
}
