'use client';

import { useState } from 'react';

interface Group {
  _id: string;
  name: string;
  description?: string;
  members: string[];
}

interface GroupCardProps {
  group: Group;
  onSelect: (groupId: string) => void;
  onDelete: (groupId: string) => void;
}

export default function GroupCard({ group, onSelect, onDelete }: GroupCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/groups/${group._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete(group._id);
      }
    } catch (error) {
      console.error('Error deleting group:', error);
    }
    setIsDeleting(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
          <p className="text-gray-600 mt-2">{group.description || 'No description'}</p>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Members: <span className="font-semibold text-gray-700">{group.members.length}</span>
            </p>
          </div>
        </div>
        <div className="ml-4 space-y-2">
          <button
            onClick={() => onSelect(group._id)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors w-full"
          >
            View
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors w-full disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
