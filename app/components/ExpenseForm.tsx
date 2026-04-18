'use client';

import { useState } from 'react';
import { categorizeExpense } from '@/app/utils/calculations';

interface ExpenseFormProps {
  groupId: string;
  members: string[];
  onSuccess: () => void;
}

export default function ExpenseForm({ groupId, members, onSuccess }: ExpenseFormProps) {
  const initialCustomSplits = members.reduce<Record<string, string>>((acc, member) => {
    acc[member] = '';
    return acc;
  }, {});

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    paidBy: members[0] || '',
    splitAmong: members,
    splitType: 'equal',
    customSplits: initialCustomSplits,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMemberToggle = (member: string) => {
    setFormData(prev => ({
      ...prev,
      splitAmong: prev.splitAmong.includes(member)
        ? prev.splitAmong.filter(m => m !== member)
        : [...prev.splitAmong, member],
    }));
  };

  const handleCustomSplitChange = (member: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      customSplits: {
        ...prev.customSplits,
        [member]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!formData.description || !formData.amount || formData.splitAmong.length === 0) {
        setError('Please fill all required fields');
        setIsLoading(false);
        return;
      }

      const amount = parseFloat(formData.amount);
      if (Number.isNaN(amount) || amount <= 0) {
        setError('Amount must be greater than 0');
        setIsLoading(false);
        return;
      }

      let splitPayload: string[] | { member: string; amount: number }[] = formData.splitAmong;
      if (formData.splitType === 'custom') {
        const customSplits = formData.splitAmong.map(member => ({
          member,
          amount: parseFloat(formData.customSplits[member] || '0'),
        }));

        const hasInvalid = customSplits.some(item => Number.isNaN(item.amount) || item.amount < 0);
        if (hasInvalid) {
          setError('Custom amounts must be valid positive numbers');
          setIsLoading(false);
          return;
        }

        const customTotal = customSplits.reduce((sum, item) => sum + item.amount, 0);
        if (Math.abs(customTotal - amount) > 0.01) {
          setError('Custom split total must exactly match the expense amount');
          setIsLoading(false);
          return;
        }

        splitPayload = customSplits;
      }

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          description: formData.description,
          amount,
          paidBy: formData.paidBy,
          splitAmong: splitPayload,
          splitType: formData.splitType,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to create expense');
        return;
      }

      setFormData({
        description: '',
        amount: '',
        paidBy: members[0] || '',
        splitAmong: members,
        splitType: 'equal',
        customSplits: members.reduce<Record<string, string>>((acc, member) => {
          acc[member] = '';
          return acc;
        }, {}),
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Expense</h2>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g., Lunch at restaurant"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Category: <span className="font-semibold">{categorizeExpense(formData.description)}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount * (₹)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paid By *
            </label>
            <select
              name="paidBy"
              value={formData.paidBy}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {members.map(member => (
                <option key={member} value={member}>
                  {member}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Split Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="splitType"
                value="equal"
                checked={formData.splitType === 'equal'}
                onChange={handleChange}
                className="mr-2"
              />
              Equal
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="splitType"
                value="custom"
                checked={formData.splitType === 'custom'}
                onChange={handleChange}
                className="mr-2"
              />
              Custom
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Split Among
          </label>
          <div className="space-y-2">
            {members.map(member => (
              <label key={member} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.splitAmong.includes(member)}
                  onChange={() => handleMemberToggle(member)}
                  className="mr-2"
                />
                {member}
              </label>
            ))}
          </div>
        </div>

        {formData.splitType === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Amounts
            </label>
            <div className="space-y-2">
              {formData.splitAmong.map(member => (
                <div key={member} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-gray-700">{member}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.customSplits[member] || ''}
                    onChange={e => handleCustomSplitChange(member, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Adding...' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
}
