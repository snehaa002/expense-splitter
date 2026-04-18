'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GroupForm from '@/app/components/GroupForm';
import GroupCard from '@/app/components/GroupCard';

interface Group {
  _id: string;
  name: string;
  description?: string;
  members: string[];
}

export default function Home() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    try {
      const response = await fetch('/api/groups');
      const data = await response.json();
      if (data.success) {
        setGroups(data.data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchGroups();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchGroups]);

  const handleGroupCreated = () => {
    fetchGroups();
  };

  const handleGroupDeleted = (groupId: string) => {
    setGroups(prev => prev.filter(g => g._id !== groupId));
  };

  const handleSelectGroup = (groupId: string) => {
    router.push(`/groups/${groupId}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white py-12 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">💰 Smart Expense Splitter</h1>
          <p className="text-blue-100">
            Easily split expenses with friends, roommates, and teams. Track balances in real-time.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Create Group Form */}
        <GroupForm onSuccess={handleGroupCreated} />

        {/* Groups List */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Groups</h2>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Loading groups...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg">No groups yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map(group => (
                <GroupCard
                  key={group._id}
                  group={group}
                  onSelect={handleSelectGroup}
                  onDelete={handleGroupDeleted}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-2">👥</div>
            <h3 className="font-bold text-gray-800 mb-2">Create Groups</h3>
            <p className="text-gray-600 text-sm">
              Start by creating a group with your friends and add members.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-2">💵</div>
            <h3 className="font-bold text-gray-800 mb-2">Add Expenses</h3>
            <p className="text-gray-600 text-sm">
              Log expenses and automatically split them equally or custom.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-2">🤖</div>
            <h3 className="font-bold text-gray-800 mb-2">Smart Insights</h3>
            <p className="text-gray-600 text-sm">
              AI-powered categorization and spending analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
