'use client';

interface ExpenseSplit {
  member: string;
  amount: number;
}

interface ExpenseItem {
  _id: string;
  description: string;
  category: string;
  amount: number;
  paidBy: string;
  createdAt: string;
  splitAmong: ExpenseSplit[];
}

interface ExpenseListProps {
  expenses: ExpenseItem[];
  onDelete: (expenseId: string) => void;
}

export default function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  const handleDelete = async (expenseId: string) => {
    if (!window.confirm('Delete this expense?')) return;

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete(expenseId);
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      food: 'bg-orange-100 text-orange-800',
      travel: 'bg-blue-100 text-blue-800',
      accommodation: 'bg-purple-100 text-purple-800',
      entertainment: 'bg-pink-100 text-pink-800',
      utilities: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        No expenses yet. Add one to get started!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800">Expenses</h3>
      {expenses.map(expense => (
        <div key={expense._id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-lg font-semibold text-gray-800">{expense.description}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                  {expense.category}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Paid by <span className="font-semibold">{expense.paidBy}</span> on{' '}
                {new Date(expense.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-2 text-sm text-gray-700">
                <p>
                  Split among:{' '}
                  {expense.splitAmong.map(s => `${s.member} (₹${s.amount.toFixed(2)})`).join(', ')}
                </p>
              </div>
            </div>
            <div className="text-right ml-4">
              <p className="text-2xl font-bold text-green-600">₹{expense.amount.toFixed(2)}</p>
              <button
                onClick={() => handleDelete(expense._id)}
                className="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
