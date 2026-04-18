'use client';

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

interface Balance {
  [member: string]: number;
}

interface BalanceSheetProps {
  balances: Balance;
  settlements: Settlement[];
}

export default function BalanceSheet({ balances, settlements }: BalanceSheetProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balances */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Individual Balances</h3>
          <div className="space-y-3">
            {Object.entries(balances).map(([member, amount]) => (
              <div key={member} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-800">{member}</span>
                <span
                  className={`text-lg font-bold ${
                    amount > 0 ? 'text-green-600' : amount < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}
                >
                  {amount > 0 ? '+' : ''}₹{Math.abs(amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Analytics</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded">
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{Object.values(balances).reduce((a, b) => a + Math.max(0, b), 0).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded">
              <p className="text-sm text-gray-600">Settlement Count</p>
              <p className="text-2xl font-bold text-purple-600">{settlements.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settlements */}
      {settlements.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Settlements Required</h3>
          <div className="space-y-3">
            {settlements.map((settlement, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    <span className="text-red-600">{settlement.from}</span> owes{' '}
                    <span className="text-green-600">{settlement.to}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">₹{settlement.amount.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {settlements.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-700 font-medium">✓ All balances are settled!</p>
        </div>
      )}
    </div>
  );
}
