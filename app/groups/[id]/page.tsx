'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ExpenseForm from '@/app/components/ExpenseForm';
import ExpenseList from '@/app/components/ExpenseList';
import BalanceSheet from '@/app/components/BalanceSheet';
import Insights from '@/app/components/Insights';
import { ExpenseLike, getSpendingInsights } from '@/app/utils/calculations';

interface GroupExpense extends ExpenseLike {
  _id: string;
  description: string;
  createdAt: string;
}

interface GroupData {
  group: {
    name: string;
    description?: string;
    members: string[];
  };
  expenses: GroupExpense[];
  balances: Record<string, number>;
  settlements: { from: string; to: string; amount: number }[];
}

interface AiInsights {
  insightText: string;
  recommendations: string[];
  generatedBy: 'openai' | 'fallback';
}

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<GroupData['group'] | null>(null);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [settlements, setSettlements] = useState<{ from: string; to: string; amount: number }[]>([]);
  const [insights, setInsights] = useState<ReturnType<typeof getSpendingInsights> | null>(null);
  const [aiInsights, setAiInsights] = useState<AiInsights | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'insights'>('balances');
  const tabs: { id: 'balances' | 'expenses' | 'insights'; label: string }[] = [
    { id: 'balances', label: '⚖️ Balances & Settlements' },
    { id: 'expenses', label: '📋 Expenses' },
    { id: 'insights', label: '📊 Insights' },
  ];

  const fetchGroupData = useCallback(async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}`);
      if (!response.ok) throw new Error('Failed to fetch group');

      const data = await response.json();
      const payload: GroupData = data.data;

      setGroup(payload.group);
      setExpenses(payload.expenses);
      setBalances(payload.balances);
      setSettlements(payload.settlements);

      setAiLoading(true);
      const aiResponse = await fetch(`/api/insights?groupId=${groupId}`);
      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        setInsights({
          totalSpent: aiData.data.totalSpent,
          categorySpending: aiData.data.categorySpending,
          memberSpending: aiData.data.memberSpending,
          categoryPercentages: aiData.data.categoryPercentages,
          weeklyTrend: aiData.data.weeklyTrend,
        });
        setAiInsights(aiData.data.ai);
      } else {
        setInsights(getSpendingInsights(payload.expenses));
        setAiInsights(null);
      }
    } catch (error) {
      console.error('Error fetching group data:', error);
      setAiInsights(null);
    } finally {
      setAiLoading(false);
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchGroupData();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchGroupData, refreshTick]);

  const handleExpenseAdded = () => {
    setRefreshTick(prev => prev + 1);
  };

  const handleExpenseDeleted = () => {
    setRefreshTick(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xl text-gray-600">Group not found</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 font-medium mb-4 flex items-center gap-2"
          >
            ← Back to Groups
          </button>
          <h1 className="text-4xl font-bold text-gray-800">{group.name}</h1>
          {group.description && <p className="text-gray-600 mt-2">{group.description}</p>}
          <p className="text-sm text-gray-500 mt-2">Members: {group.members.join(', ')}</p>
        </div>

        {/* Add Expense Form */}
        <ExpenseForm groupId={groupId} members={group.members} onSuccess={handleExpenseAdded} />

        {/* Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'balances' && <BalanceSheet balances={balances} settlements={settlements} />}
            {activeTab === 'expenses' && <ExpenseList expenses={expenses} onDelete={handleExpenseDeleted} />}
            {activeTab === 'insights' && (
              <Insights insights={insights} aiInsights={aiInsights} aiLoading={aiLoading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
