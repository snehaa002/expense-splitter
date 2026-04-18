'use client';

interface SpendingInsight {
  category: string;
  amount: number;
  percentage: string;
}

interface AiInsights {
  insightText: string;
  recommendations: string[];
  generatedBy: 'openai' | 'fallback';
}

interface InsightsProps {
  insights: {
    totalSpent: number;
    categoryPercentages: SpendingInsight[];
    memberSpending: { [key: string]: number };
    weeklyTrend: {
      currentWeekTotal: number;
      previousWeekTotal: number;
      percentageChange: number;
      direction: 'up' | 'down' | 'flat';
    };
  } | null;
  aiInsights: AiInsights | null;
  aiLoading: boolean;
}

export default function Insights({ insights, aiInsights, aiLoading }: InsightsProps) {
  if (!insights || Object.keys(insights).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        No spending data yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">💰 Spending Insights</h3>

        {/* Total Spent */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">Total Group Spending</p>
          <p className="text-3xl font-bold text-blue-900">₹{insights.totalSpent.toFixed(2)}</p>
        </div>

        {/* Category Breakdown */}
        {insights.categoryPercentages && insights.categoryPercentages.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">By Category</h4>
            <div className="space-y-2">
              {insights.categoryPercentages.map((cat: SpendingInsight) => (
                <div key={cat.category}>
                  <div className="flex justify-between mb-1">
                    <span className="capitalize font-medium text-gray-700">{cat.category}</span>
                    <span className="text-gray-600">
                      ₹{cat.amount.toFixed(2)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Week-over-Week Trend</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-500">This Week</p>
              <p className="text-lg font-semibold text-gray-800">₹{insights.weeklyTrend.currentWeekTotal.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-500">Previous Week</p>
              <p className="text-lg font-semibold text-gray-800">₹{insights.weeklyTrend.previousWeekTotal.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-500">Change</p>
              <p
                className={`text-lg font-semibold ${
                  insights.weeklyTrend.direction === 'up'
                    ? 'text-red-600'
                    : insights.weeklyTrend.direction === 'down'
                      ? 'text-green-600'
                      : 'text-gray-700'
                }`}
              >
                {insights.weeklyTrend.direction === 'flat'
                  ? '0.00%'
                  : `${Math.abs(insights.weeklyTrend.percentageChange).toFixed(2)}% ${
                      insights.weeklyTrend.direction === 'up' ? 'more' : 'less'
                    }`}
              </p>
            </div>
          </div>
        </div>

        {/* Member Spending */}
        {insights.memberSpending && Object.keys(insights.memberSpending).length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">By Member</h4>
            <div className="space-y-2">
              {Object.entries(insights.memberSpending).map(([member, amount]) => (
                <div key={member} className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-800">{member}</span>
                  <span className="text-gray-700">₹{Number(amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-purple-900">🤖 Smart AI Insight</p>
          {aiInsights && (
            <span className="text-xs px-2 py-1 rounded bg-white text-purple-700 border border-purple-200">
              Source: {aiInsights.generatedBy === 'openai' ? 'OpenAI' : 'Fallback Engine'}
            </span>
          )}
        </div>

        {aiLoading && <p className="text-sm text-purple-800">Generating AI insight...</p>}

        {!aiLoading && aiInsights && (
          <div className="space-y-3">
            <p className="text-sm text-purple-900">{aiInsights.insightText}</p>
            {aiInsights.recommendations.length > 0 && (
              <ul className="text-sm text-purple-900 list-disc pl-5 space-y-1">
                {aiInsights.recommendations.map((item, idx) => (
                  <li key={`${item}-${idx}`}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {!aiLoading && !aiInsights && (
          <p className="text-sm text-purple-800">
            AI insight is currently unavailable. Add more expenses or set OPENAI_API_KEY to enable richer suggestions.
          </p>
        )}
      </div>
    </div>
  );
}
